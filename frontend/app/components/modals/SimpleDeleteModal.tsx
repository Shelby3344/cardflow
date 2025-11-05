'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SimpleDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export default function SimpleDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: SimpleDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Excluir Card</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Tem certeza que deseja excluir este card?
                </p>
                {itemName && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-900 font-medium line-clamp-2">
                      {itemName}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
