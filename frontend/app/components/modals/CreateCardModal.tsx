'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from '../RichTextEditor';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: CardFormData) => void;
  deckName?: string;
  subDeckId?: number;
  isSubmitting?: boolean;
  editData?: any;
}

export interface CardFormData {
  front: string;
  back: string;
  deck_id?: number;
  sub_deck_id?: number;
}

export default function CreateCardModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  deckName,
  subDeckId,
  isSubmitting = false,
  editData
}: CreateCardModalProps) {
  const [formData, setFormData] = useState<CardFormData>({
    front: '',
    back: '',
    sub_deck_id: subDeckId,
  });

  // Reset form when modal closes or populate with edit data
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        front: '',
        back: '',
        sub_deck_id: subDeckId,
      });
    } else if (editData) {
      // Populate form with edit data
      setFormData({
        front: editData.front || '',
        back: editData.back || '',
        sub_deck_id: editData.sub_deck_id || subDeckId,
      });
    }
  }, [isOpen, subDeckId, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.front.trim() || !formData.back.trim()) {
      alert('Por favor, preencha a frente e o verso do card.');
      return;
    }
    
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      front: '',
      back: '',
      sub_deck_id: subDeckId,
    });
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            {/* Modal - Layout Brainscape Side by Side */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {editData ? 'Editar Flashcard' : 'Criar Novo Flashcard'}
                    </h2>
                    {deckName && (
                      <p className="text-blue-100 text-sm">📚 {deckName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Side by Side Layout */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 grid grid-cols-2 gap-4 p-6 overflow-y-auto">
                  {/* Left Side - Question */}
                  <div className="flex flex-col">
                    <div className="mb-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-lg">1</span>
                        <span>Pergunta</span>
                      </label>
                      <div className="text-xs text-gray-500 mb-3">
                        Cite objetivo e exemplos ?
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                      <RichTextEditor
                        content={formData.front}
                        onChange={(content) =>
                          setFormData({ ...formData, front: content })
                        }
                        placeholder="Digite a pergunta aqui..."
                      />
                    </div>
                  </div>

                  {/* Right Side - Answer */}
                  <div className="flex flex-col">
                    <div className="mb-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-lg">1</span>
                        <span>Resposta</span>
                      </label>
                      <div className="text-xs text-gray-500 mb-3">
                        Objetivo: Escreva o objetivo aqui
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                      <RichTextEditor
                        content={formData.back}
                        onChange={(content) =>
                          setFormData({ ...formData, back: content })
                        }
                        placeholder="Digite a resposta aqui..."
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{editData ? 'Salvando...' : 'Salvando...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{editData ? 'Salvar' : 'Salvar'}</span>
                      </>
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
