'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, BookOpen, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deckData: DeckFormData) => void;
  isSubmitting?: boolean;
}

export interface DeckFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  image?: File | null;
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

export default function CreateDeckModal({ isOpen, onClose, onSubmit, isSubmitting = false }: CreateDeckModalProps) {
  const [formData, setFormData] = useState<DeckFormData>({
    name: '',
    description: '',
    color: COLORS[0].value,
    icon: ICONS[0],
    image: null,
    isPublic: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpar formulário quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        color: COLORS[0].value,
        icon: ICONS[0],
        image: null,
        isPublic: false,
      });
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor, insira um nome para o deck');
      return;
    }
    onSubmit(formData);
    // Não fecha mais aqui, deixa o parent controlar
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      color: COLORS[0].value,
      icon: ICONS[0],
      image: null,
      isPublic: false,
    });
    setImagePreview(null);
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com gradiente */}
              <div className="sticky top-0 p-6 z-10" style={{ background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(24, 38, 105))' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Criar Novo Deck</h2>
                      <p className="text-blue-100 text-sm mt-1">Organize seu conhecimento de forma inteligente</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Form com scroll suave */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-120px)]"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
              >
                {/* Nome do Deck */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
                    Nome do Deck *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Medicina Interna, JavaScript Avançado..."
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg bg-white shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></span>
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o conteúdo e objetivos do seu deck de estudos..."
                    rows={4}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none bg-white shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Imagem ou Ícone */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-600" />
                    Aparência do Deck
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        <div className={`w-40 h-40 bg-gradient-to-br ${formData.color} rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-105 ring-4 ring-white`}>
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                          ) : (
                            <span className="text-6xl drop-shadow-lg">{formData.icon}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all text-sm font-semibold shadow-md hover:shadow-lg border-2 border-gray-200"
                      >
                        <Upload className="w-5 h-5" />
                        Upload Imagem Personalizada
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
                            setFormData({ ...formData, image: null });
                          }}
                          className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                        >
                          🗑️ Remover imagem
                        </button>
                      )}
                    </div>

                    {/* Ícone e Cor */}
                    {!imagePreview && (
                      <div className="space-y-5">
                        {/* Ícones */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            Escolha um Ícone
                          </label>
                          <div className="grid grid-cols-6 gap-2.5">
                            {ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                className={`w-full aspect-square flex items-center justify-center text-2xl rounded-xl border-2 transition-all hover:scale-110 active:scale-95 ${
                                  formData.icon === icon
                                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cores */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            Escolha uma Cor
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                title={color.name}
                                className={`relative p-1 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                                  formData.color === color.value
                                    ? 'border-blue-500 shadow-xl ring-4 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div 
                                  className="w-full h-10 rounded-lg shadow-inner"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})` 
                                  }}
                                ></div>
                                {formData.color === color.value && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    </div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibilidade */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="isPublic" className="cursor-pointer flex-1">
                    <div className="font-bold text-gray-800 mb-1"> Deck Público</div>
                    <div className="text-sm text-gray-600">
                      Compartilhe seu conhecimento! Outros estudantes poderão visualizar e usar este deck para estudar.
                    </div>
                  </label>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl font-bold transition-all hover:shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-4 text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234), rgb(219, 39, 119))' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Criando...
                      </>
                    ) : (
                      <>✨ Criar Deck</>
                    )}
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
