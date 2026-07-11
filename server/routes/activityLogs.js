const express = require('express');
const XLSX = require('xlsx');
const { Document, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, Packer } = require('docx');
const ActivityLog = require('../models/ActivityLog');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);
router.use(restrictTo('admin'));

const PAGE_SIZE = 50;

// ─── GET / — listar logs con paginación y stats ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { page = 1, userId, userType, search } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (userType) filter.userType = userType;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action:   { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * PAGE_SIZE;
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [logs, total, expiringCount] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
      ActivityLog.countDocuments(filter),
      ActivityLog.countDocuments({ expiresAt: { $lte: weekFromNow } })
    ]);

    res.json({
      success: true,
      logs,
      total,
      pages: Math.ceil(total / PAGE_SIZE),
      page: Number(page),
      expiringCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener los registros.' });
  }
});

// ─── PATCH /extend — extender retención 30 días para logs próximos a vencer ──
router.patch('/extend', async (req, res) => {
  try {
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const result = await ActivityLog.updateMany(
      { expiresAt: { $lte: weekFromNow } },
      [{ $set: { expiresAt: { $add: ['$expiresAt', thirtyDaysMs] } } }]
    );

    res.json({ success: true, modified: result.modifiedCount });
  } catch {
    res.status(500).json({ success: false, message: 'Error al extender la retención.' });
  }
});

// ─── DELETE / — eliminar todos los logs ──────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const result = await ActivityLog.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount });
  } catch {
    res.status(500).json({ success: false, message: 'Error al eliminar los registros.' });
  }
});

// ─── DELETE /:id — eliminar un log ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await ActivityLog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Error al eliminar el registro.' });
  }
});

// ─── GET /export — descargar historial ───────────────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const { format = 'txt' } = req.query;
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).lean();

    const formatDate = (d) =>
      new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const headers = ['Fecha', 'Usuario', 'Email', 'Rol', 'Tipo', 'Acción', 'Recurso', 'IP'];
    const rows = logs.map(l => [
      formatDate(l.createdAt),
      l.userName,
      l.userEmail || '',
      l.userRole || 'público',
      l.userType === 'staff' ? 'Staff' : 'Comunidad',
      l.action,
      l.resource || '',
      l.ip || ''
    ]);

    // ── Excel ──────────────────────────────────────────────────────────────────
    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 26 }, { wch: 14 }, { wch: 12 }, { wch: 34 }, { wch: 24 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Actividad');
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="historial_actividad.xlsx"');
      return res.send(buf);
    }

    // ── Word ───────────────────────────────────────────────────────────────────
    if (format === 'docx') {
      const headerCells = headers.map(h =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
          width: { size: 1200, type: WidthType.DXA }
        })
      );
      const dataRows = rows.map(r =>
        new TableRow({
          children: r.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 18 })] })],
              width: { size: 1200, type: WidthType.DXA }
            })
          )
        })
      );

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: 'Historial de Actividad', heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: 'Bibliotecas Populares de San Juan', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ children: [new TextRun({ text: `Generado: ${formatDate(new Date())} — Total: ${logs.length} registros`, italics: true })] }),
            new Paragraph({ text: '' }),
            new Table({ rows: [new TableRow({ children: headerCells }), ...dataRows] })
          ]
        }]
      });

      const buf = await Packer.toBuffer(doc);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="historial_actividad.docx"');
      return res.send(buf);
    }

    // ── TXT (default) ──────────────────────────────────────────────────────────
    const sep = ' | ';
    const line = headers.join(sep);
    const divider = '-'.repeat(line.length);
    const lines = [
      'HISTORIAL DE ACTIVIDAD — Bibliotecas Populares de San Juan',
      `Generado: ${formatDate(new Date())}  |  Total: ${logs.length} registros`,
      divider,
      line,
      divider,
      ...rows.map(r => r.join(sep)),
      divider
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="historial_actividad.txt"');
    return res.send(lines);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al exportar.' });
  }
});

module.exports = router;
