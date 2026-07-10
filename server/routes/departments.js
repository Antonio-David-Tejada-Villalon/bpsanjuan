const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── GET /api/departments — Listar todos los departamentos (público) ───────
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('libraryCount')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener departamentos.' });
  }
});

// ─── GET /api/departments/:slug — Obtener un departamento por slug (público)
router.get('/:slug', async (req, res) => {
  try {
    const department = await Department.findOne({ slug: req.params.slug, isActive: true })
      .populate('libraryCount');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Departamento no encontrado.' });
    }

    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el departamento.' });
  }
});

// ─── POST /api/departments — Crear departamento (admin) ───────────────────
router.post('/', protect, restrictTo('admin'), [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('slug').trim().notEmpty().withMessage('El slug es requerido')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug solo puede tener letras minúsculas, números y guiones')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const department = await Department.create(req.body);
    res.status(201).json({ success: true, department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ya existe un departamento con ese nombre o slug.' });
    }
    res.status(500).json({ success: false, message: 'Error al crear el departamento.' });
  }
});

// ─── PATCH /api/departments/:id — Editar departamento (admin + supervisor con permiso) ─
router.patch('/:id', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canEditDepartments;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar departamentos.' });
    }

    const allowedFields = ['name', 'description', 'thumbnail', 'location', 'isActive'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const department = await Department.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Departamento no encontrado.' });
    }

    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el departamento.' });
  }
});

module.exports = router;
