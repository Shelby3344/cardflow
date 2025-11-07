'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateSubDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subDeckData: SubDeckFormData) => void;
  parentDeckName: string;
}

export interface SubDeckFormData {
  name: string;
  icon: string;
  image?: File | null;
}

const ICONS = ['📚', '📖', '🎓', '🧠', '💡', '🔬', '🎨', '🎵', '💻', '🌍', '⚡', '🚀', '📝', '🎯', '🔥', '⭐', '✨', '🌟'];

export default function CreateSubDeckModal({ isOpen, onClose, onSubmit, parentDeckName }: CreateSubDeckModalProps) {
  const [formData, setFormData] = useState<SubDeckFormData>({
    name: '',
    icon: ICONS[0],
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpar formulário quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        icon: ICONS[0],
        image: null,
      });
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor, insira um nome para o flashcard');
      return;
    }
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      icon: ICONS[0],
      image: null,
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
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Criar Novo Flashcard</h2>
                    <p className="text-blue-100 text-sm mt-1">Digite o nome do flashcard</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                {/* Nome do Subdeck */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Nome do Flashcard *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Capítulo 1, Verbos Irregulares..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900"
                    required
                    autoFocus
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                  >
                    Criar Flashcard
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
