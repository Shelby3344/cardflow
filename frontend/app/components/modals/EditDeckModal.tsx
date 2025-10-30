'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deckData: DeckFormData) => void;
  onDelete?: () => void;
  initialData?: Partial<DeckFormData>;
}

export interface DeckFormData {
  id?: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  image?: File | null;
  imageUrl?: string;
  isPublic: boolean;
}

const COLORS = [
  { name: 'Azul', value: 'from-blue-500 to-blue-700', hex: '#3b82f6' },
  { name: 'Roxo', value: 'from-purple-500 to-purple-700', hex: '#a855f7' },
  { name: 'Rosa', value: 'from-pink-500 to-pink-700', hex: '#ec4899' },
  { name: 'Verde', value: 'from-green-500 to-green-700', hex: '#22c55e' },
  { name: 'Laranja', value: 'from-orange-500 to-orange-700', hex: '#f97316' },
  { name: 'Vermelho', value: 'from-red-500 to-red-700', hex: '#ef4444' },
  { name: 'Cinza', value: 'from-slate-700 to-slate-900', hex: '#475569' },
  { name: 'Teal', value: 'from-teal-500 to-teal-700', hex: '#14b8a6' },
];

const ICONS = ['📚', '📖', '🎓', '🧠', '💡', '🔬', '🎨', '🎵', '💻', '🌍', '⚡', '🚀'];

export default function EditDeckModal({ isOpen, onClose, onSubmit, onDelete, initialData }: EditDeckModalProps) {
  const [formData, setFormData] = useState<DeckFormData>({
    name: '',
    description: '',
    color: COLORS[0].value,
    icon: ICONS[0],
    image: null,
    isPublic: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
      });
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor, insira um nome para o deck');
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Editar Deck</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="p-6 bg-red-50 border-b border-red-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-1">
                        Tem certeza que deseja excluir este deck?
                      </h3>
                      <p className="text-sm text-red-700">
                        Esta ação não pode ser desfeita. Todos os flashcards e sub-decks serão permanentemente removidos.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Sim, Excluir Deck
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nome do Deck */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome do Deck *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Medicina Interna"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o conteúdo do seu deck..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Imagem ou Ícone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Aparência do Deck
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Preview */}
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-32 h-32 bg-gradient-to-br ${formData.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span className="text-5xl">{formData.icon}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        {imagePreview ? 'Alterar Imagem' : 'Upload Imagem'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: null, imageUrl: undefined });
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remover imagem
                        </button>
                      )}
                    </div>

                    {/* Ícone e Cor */}
                    {!imagePreview && (
                      <div className="space-y-4">
                        {/* Ícones */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Ícone
                          </label>
                          <div className="grid grid-cols-6 gap-2">
                            {ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                                  formData.icon === icon
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cores */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Cor
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                                  formData.color === color.value
                                    ? 'border-blue-500 shadow-md'
                                    : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color.hex }}
                              >
                                <div className="w-full h-6 rounded"></div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibilidade */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Tornar este deck público (outros usuários poderão visualizar e usar)
                  </label>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Excluir
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
