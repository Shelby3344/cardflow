'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Palette,
  Heading1,
  Heading2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Digite aqui...',
  onImageUpload 
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetLink = () => {
    if (linkUrl === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-300 flex-wrap">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-sm font-semibold rounded hover:bg-gray-200 transition-colors text-gray-900 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
          }`}
          title="Título 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-sm font-semibold rounded hover:bg-gray-200 transition-colors text-gray-900 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
          }`}
          title="Título 2"
        >
          H2
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('underline') ? 'bg-gray-300' : ''
          }`}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFEB3B' }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('highlight') ? 'bg-gray-300' : ''
          }`}
          title="Destacar"
        >
          <Highlighter className="w-4 h-4 text-gray-900" />
        </button>

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Cor do texto"
          >
            <Palette className="w-4 h-4 text-gray-900" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 flex gap-1">
              {['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="px-2 text-xs bg-gray-100 rounded hover:bg-gray-200"
              >
                Padrão
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
          }`}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
          }`}
          title="Centralizar"
        >
          <AlignCenter className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
          }`}
          title="Alinhar à direita"
        >
          <AlignRight className="w-4 h-4 text-gray-900" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Lista com marcadores"
        >
          <List className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-gray-300' : ''
          }`}
          title="Citação"
        >
          <Quote className="w-4 h-4 text-gray-900" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('link') ? 'bg-gray-300' : ''
          }`}
          title="Inserir link"
        >
          <Link2 className="w-4 h-4 text-gray-900" />
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={handleImageClick}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Inserir imagem"
        >
          <ImageIcon className="w-4 h-4 text-gray-900" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo className="w-4 h-4 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Refazer (Ctrl+Y)"
        >
          <Redo className="w-4 h-4 text-gray-900" />
        </button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="bg-blue-50 border-b border-gray-300 p-3 flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSetLink()}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSetLink}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Inserir
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
