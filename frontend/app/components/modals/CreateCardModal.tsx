'use client';

import { useState, useEffect } from 'react';
import { X, FlipHorizontal, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from '../RichTextEditor';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: CardFormData) => void;
  deckName?: string;
  subDeckId?: number;
  isSubmitting?: boolean;
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
  isSubmitting = false
}: CreateCardModalProps) {
  const [formData, setFormData] = useState<CardFormData>({
    front: '',
    back: '',
    sub_deck_id: subDeckId,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        front: '',
        back: '',
        sub_deck_id: subDeckId,
      });
      setShowPreview(false);
      setPreviewSide('front');
    }
  }, [isOpen, subDeckId]);

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
    setShowPreview(false);
    onClose();
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    setPreviewSide('front');
  };

  const flipPreviewCard = () => {
    setPreviewSide(previewSide === 'front' ? 'back' : 'front');
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 text-white z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Criar Novo Flashcard</h2>
                      {deckName && (
                        <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-1">
                          <span className="opacity-75">📚</span> {deckName}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Toggle Preview */}
                <div className="mt-6 flex items-center gap-2 bg-white/10 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                      !showPreview
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                     Edição
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                      showPreview
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                     Preview
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {!showPreview ? (
                  /* Edit Mode */
                  <div className="space-y-6">
                    {/* Front Side */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-3">
                        <span className="text-xl">🎯</span>
                        <span>Frente do Card (Pergunta)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <RichTextEditor
                        content={formData.front}
                        onChange={(content) =>
                          setFormData({ ...formData, front: content })
                        }
                        placeholder="Ex: O que é fotossíntese?"
                      />
                      <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                        <span>💡</span>
                        <span>Use formatação, listas e imagens para criar cards ricos</span>
                      </p>
                    </div>

                    {/* Back Side */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-green-900 mb-3">
                        <span className="text-xl">✅</span>
                        <span>Verso do Card (Resposta)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <RichTextEditor
                        content={formData.back}
                        onChange={(content) =>
                          setFormData({ ...formData, back: content })
                        }
                        placeholder="Ex: Processo pelo qual plantas convertem luz em energia..."
                      />
                      <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                        <span>💡</span>
                        <span>Adicione detalhes, exemplos e imagens explicativas</span>
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
                      <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-3 text-base">
                        <span className="text-2xl">🎓</span>
                        <span>Dicas para criar bons flashcards</span>
                      </h3>
                      <ul className="text-sm text-amber-900 space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>Seja conciso e objetivo - uma ideia por card</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>Use imagens para reforçar o aprendizado visual</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>Evite ambiguidade - perguntas claras geram respostas claras</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>Teste a si mesmo - se não consegue responder, melhore o card</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* Preview Mode */
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <button
                        type="button"
                        onClick={flipPreviewCard}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
                      >
                        <FlipHorizontal className="w-6 h-6" />
                        Virar Card
                      </button>
                    </div>

                    {/* Card Preview */}
                    <motion.div
                      key={previewSide}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className={`relative bg-gradient-to-br ${
                        previewSide === 'front'
                          ? 'from-blue-50 to-indigo-100 border-blue-300'
                          : 'from-green-50 to-emerald-100 border-green-300'
                      } border-4 rounded-3xl p-10 min-h-[350px] flex items-center justify-center shadow-2xl`}
                    >
                      {/* Corner badge */}
                      <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold ${
                        previewSide === 'front'
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        {previewSide === 'front' ? '🎯 FRENTE' : '✅ VERSO'}
                      </div>

                      <div className="w-full">
                        <div
                          className="prose prose-lg max-w-none text-center"
                          dangerouslySetInnerHTML={{
                            __html:
                              previewSide === 'front'
                                ? formData.front || '<p class="text-gray-400 italic">Frente vazia - adicione conteúdo na aba Edição</p>'
                                : formData.back || '<p class="text-gray-400 italic">Verso vazio - adicione conteúdo na aba Edição</p>',
                          }}
                        />
                      </div>
                    </motion.div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Clique em "Virar Card" para alternar entre frente e verso</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>

                  <div className="flex items-center gap-3">
                    {!showPreview && (
                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         Ver Preview
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Criar Flashcard</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
