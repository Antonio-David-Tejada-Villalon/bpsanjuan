import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle, Color, FontFamily, FontSize } from '@tiptap/extension-text-style';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ── SVG icons ─────────────────────────────────────────────────── */
const S = ({ children, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    {children}
  </svg>
);
const IcoBold       = () => <S><path d="M4 2h5a3 3 0 0 1 2.12 5.12A3.5 3.5 0 0 1 8.5 14H4V2zm2 5h2.5a1 1 0 0 0 0-2H6v2zm0 5h2.5a1.5 1.5 0 0 0 0-3H6v3z"/></S>;
const IcoItalic     = () => <S><path d="M7 2h5v2H9.8L7.2 12H9v2H4v-2h2.2L8.8 4H7V2z"/></S>;
const IcoUnderline  = () => <S><path d="M4 2h2v6a2 2 0 0 0 4 0V2h2v6a4 4 0 0 1-8 0V2zM2 14h12v2H2z"/></S>;
const IcoStrike     = () => <S><path d="M2 8h12v1.5H2V8zM5 4.5A3 3 0 0 1 8 3c1.5 0 2.8.9 3.3 2.2H9.1C8.7 4.5 8.4 4 8 4a1 1 0 0 0-1 1c0 .4.2.7.5.9H5.1A2.5 2.5 0 0 1 5 4.5zM6.5 11c.1.7.7 1 1.5 1s1.3-.4 1.3-1c0-.3-.1-.5-.3-.7H6.7c-.1.2-.2.4-.2.7z"/></S>;
const IcoAlignL     = () => <S><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="10" height="2" rx="1"/><rect x="1" y="12" width="12" height="2" rx="1"/></S>;
const IcoAlignC     = () => <S><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="3" y="7" width="10" height="2" rx="1"/><rect x="2" y="12" width="12" height="2" rx="1"/></S>;
const IcoAlignR     = () => <S><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="5" y="7" width="10" height="2" rx="1"/><rect x="3" y="12" width="12" height="2" rx="1"/></S>;
const IcoAlignJ     = () => <S><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></S>;
const IcoOList      = () => <S><path d="M1 3h1.5V6H1V3zm0 5h1.5v3H1V8zm0 5h1.5v2H1v-2z"/><rect x="4" y="3.5" width="10" height="1.5" rx=".75"/><rect x="4" y="8.5" width="10" height="1.5" rx=".75"/><rect x="4" y="13.5" width="10" height="1.5" rx=".75"/></S>;
const IcoBList      = () => <S><circle cx="2" cy="4.25" r="1.25"/><circle cx="2" cy="9.25" r="1.25"/><circle cx="2" cy="14.25" r="1.25"/><rect x="5" y="3.5" width="10" height="1.5" rx=".75"/><rect x="5" y="8.5" width="10" height="1.5" rx=".75"/><rect x="5" y="13.5" width="10" height="1.5" rx=".75"/></S>;
const IcoIndent     = () => <S><rect x="1" y="2" width="14" height="1.5" rx=".75"/><rect x="5" y="6" width="10" height="1.5" rx=".75"/><rect x="5" y="10" width="10" height="1.5" rx=".75"/><rect x="1" y="14" width="14" height="1.5" rx=".75"/><path d="M1 7.5L4 9 1 10.5z"/></S>;
const IcoOutdent    = () => <S><rect x="1" y="2" width="14" height="1.5" rx=".75"/><rect x="5" y="6" width="10" height="1.5" rx=".75"/><rect x="5" y="10" width="10" height="1.5" rx=".75"/><rect x="1" y="14" width="14" height="1.5" rx=".75"/><path d="M4 7.5L1 9l3 1.5z"/></S>;
const IcoBlockquote = () => <S><path d="M2 3h5v4H4.5C4.2 8.3 5 9.5 6.5 10L5 12C2.5 11 1.5 9 1.5 7V3H2zm8 0h5v4h-2.5C12.2 8.3 13 9.5 14.5 10L13 12C10.5 11 9.5 9 9.5 7V3H10z"/></S>;
const IcoHr         = () => <S><rect x="0" y="7.25" width="16" height="1.5" rx=".75"/></S>;
const IcoLink       = () => <S><path d="M6.5 9.5a3.5 3.5 0 0 0 4.95 0l2-2a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25.71.71 1.25-1.25a2.5 2.5 0 0 1 3.53 3.53l-2 2a2.5 2.5 0 0 1-3.53 0l-.71.71zm3-3a3.5 3.5 0 0 0-4.95 0l-2 2a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25-.71-.71-1.25 1.25a2.5 2.5 0 0 1-3.53-3.53l2-2a2.5 2.5 0 0 1 3.53 0l.71-.71z"/></S>;
const IcoImage      = () => <S><rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="5" cy="6" r="1.5"/><path d="M1 11l4-4 3 3 2-2 4 4" fill="none" stroke="currentColor" strokeWidth="1.2"/></S>;
const IcoCode       = () => <S><path d="M5 4L1 8l4 4M11 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></S>;
const IcoUndo       = () => <S><path d="M3.5 6A5 5 0 0 1 13 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M1 4l3 3-3 3V4z"/></S>;
const IcoRedo       = () => <S><path d="M12.5 6A5 5 0 0 0 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 4l-3 3 3 3V4z"/></S>;
const IcoClear      = () => <S><path d="M11 2L5 13H2l2-4H3L9 2h2zM7.5 8l-1.5 3h4L7.5 8z"/><line x1="10" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></S>;

/* ── Data ───────────────────────────────────────────────────────── */
const FONT_FAMILIES = [
  { label: 'Predeterminada', value: '' },
  { label: 'Arial',          value: 'Arial, sans-serif' },
  { label: 'Georgia',        value: 'Georgia, serif' },
  { label: 'Courier New',    value: '"Courier New", monospace' },
  { label: 'Verdana',        value: 'Verdana, sans-serif' },
  { label: 'Times New Roman',value: '"Times New Roman", serif' },
];
const FONT_SIZES = ['10','12','14','16','18','20','24','30','36','48','60','72'];

const ALIGN_OPTS = [
  { value: 'left',    label: 'Izquierda', Ico: IcoAlignL },
  { value: 'center',  label: 'Centrar',   Ico: IcoAlignC },
  { value: 'right',   label: 'Derecha',   Ico: IcoAlignR },
  { value: 'justify', label: 'Justificar',Ico: IcoAlignJ },
];

/* ── Custom dropdown (evita problemas de native <select> con backdrop-filter) */
function RteDropdown({ label, title, children, btnClass = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  return (
    <div ref={ref} className="rte-dd-wrap">
      <button type="button" className={`rte-dd-btn ${btnClass}`} title={title}
        onClick={() => setOpen(o => !o)}>
        {label}<span className="rte-chevron">▾</span>
      </button>
      {open && <div className="rte-dd-menu" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  );
}

function RteDropItem({ active, onClick, children, style }) {
  return (
    <button type="button" className={`rte-dd-item${active ? ' rte-dd-item--on' : ''}`}
      style={style} onClick={onClick}>
      {children}
    </button>
  );
}

/* ── Toolbar button ─────────────────────────────────────────────── */
const Btn = ({ active, onClick, title, children, textBtn }) => (
  <button type="button" title={title} onClick={onClick}
    className={`rte-btn${active ? ' rte-btn--on' : ''}${textBtn ? ' rte-btn--text' : ''}`}>
    {children}
  </button>
);
const Div = () => <span className="rte-divider" aria-hidden />;

/* ── Main component ─────────────────────────────────────────────── */
export default function RichTextEditor({ value, onChange, placeholder = 'Escribí el contenido aquí…' }) {
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize,   setFontSize]   = useState('');
  const [textColor,  setTextColor]  = useState('#1e3a8a');

  const syncAttrs = useCallback(ed => {
    const a = ed.getAttributes('textStyle');
    setFontFamily(a.fontFamily || '');
    setFontSize(a.fontSize ? a.fontSize.replace('px','') : '');
    setTextColor(a.color || '#1e3a8a');
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate:          ({ editor: ed }) => { onChange(ed.getHTML()); syncAttrs(ed); },
    onSelectionUpdate: ({ editor: ed }) => { syncAttrs(ed); },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value || '', false);
  }, [value]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace (vacío para quitar):', prev || 'https://');
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const currentAlign = ALIGN_OPTS.find(a => editor.isActive({ textAlign: a.value })) || ALIGN_OPTS[0];
  const AlignIco = currentAlign.Ico;
  const fontLabel = FONT_FAMILIES.find(f => f.value === fontFamily)?.label || 'Fuente';
  const sizeLabel = fontSize || 'Tam.';

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">

        {/* ── Font family ── */}
        <RteDropdown label={<span className="rte-dd-label">{fontLabel}</span>} title="Tipo de letra" btnClass="rte-dd-btn--family">
          {FONT_FAMILIES.map(f => (
            <RteDropItem key={f.value} active={fontFamily === f.value}
              style={f.value ? { fontFamily: f.value } : {}}
              onClick={() => {
                setFontFamily(f.value);
                if (f.value) editor.chain().focus().setFontFamily(f.value).run();
                else editor.chain().focus().unsetFontFamily().run();
              }}>
              {f.label}
            </RteDropItem>
          ))}
        </RteDropdown>

        {/* ── Font size ── */}
        <RteDropdown label={<span className="rte-dd-label">{sizeLabel}</span>} title="Tamaño" btnClass="rte-dd-btn--size">
          {FONT_SIZES.map(s => (
            <RteDropItem key={s} active={fontSize === s}
              onClick={() => {
                setFontSize(s);
                editor.chain().focus().setFontSize(s + 'px').run();
              }}>
              {s}
            </RteDropItem>
          ))}
        </RteDropdown>

        <Div />

        {/* ── Formatting ── */}
        <Btn active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Negrita (Ctrl+B)"><IcoBold /></Btn>
        <Btn active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Cursiva (Ctrl+I)"><IcoItalic /></Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Subrayado"><IcoUnderline /></Btn>
        <Btn active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Tachado"><IcoStrike /></Btn>

        {/* ── Color ── */}
        <label className="rte-color-btn" title="Color de texto">
          <span className="rte-color-a" style={{ color: textColor }}>A</span>
          <span className="rte-color-swatch" style={{ background: textColor }} />
          <input type="color" value={textColor}
            onChange={e => { setTextColor(e.target.value); editor.chain().focus().setColor(e.target.value).run(); }}
            tabIndex={-1} />
        </label>

        <Div />

        {/* ── Headings ── */}
        <Btn active={editor.isActive('heading',{level:1})} onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} title="Título 1" textBtn>H1</Btn>
        <Btn active={editor.isActive('heading',{level:2})} onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} title="Título 2" textBtn>H2</Btn>
        <Btn active={editor.isActive('heading',{level:3})} onClick={() => editor.chain().focus().toggleHeading({level:3}).run()} title="Título 3" textBtn>H3</Btn>

        <Div />

        {/* ── Alignment dropdown ── */}
        <RteDropdown label={<AlignIco />} title="Alineación">
          {ALIGN_OPTS.map(({ value, label, Ico }) => (
            <RteDropItem key={value} active={currentAlign.value === value}
              onClick={() => editor.chain().focus().setTextAlign(value).run()}>
              <Ico /> {label}
            </RteDropItem>
          ))}
        </RteDropdown>

        <Div />

        {/* ── Lists + indent ── */}
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada"><IcoOList /></Btn>
        <Btn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Lista con viñetas"><IcoBList /></Btn>
        <Btn onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Reducir sangría"><IcoOutdent /></Btn>
        <Btn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Aumentar sangría"><IcoIndent /></Btn>

        <Div />

        {/* ── Block elements ── */}
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Cita"><IcoBlockquote /></Btn>
        <Btn active={editor.isActive('code')}       onClick={() => editor.chain().focus().toggleCode().run()}       title="Código"><IcoCode /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea separadora"><IcoHr /></Btn>

        <Div />

        {/* ── Link + image ── */}
        <Btn active={editor.isActive('link')} onClick={setLink}   title="Insertar enlace"><IcoLink /></Btn>
        <Btn onClick={addImage}               title="Insertar imagen"><IcoImage /></Btn>

        <Div />

        {/* ── History + clear ── */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)"><IcoUndo /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)"><IcoRedo /></Btn>
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Quitar formato"><IcoClear /></Btn>

      </div>

      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}
