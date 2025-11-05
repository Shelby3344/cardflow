'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SimplePromptProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  description?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export default function SimplePrompt({ isOpen, title, placeholder, description, onConfirm, onClose }: SimplePromptProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
      console.log('SimplePrompt opened');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit clicked, value:', value);
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
      onClose();
    }
  };

  const handleClose = () => {
    console.log('Close clicked');
    setValue('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input changed:', newValue);
    setValue(newValue);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" 
      onClick={handleClose}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {description && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{description}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none mb-4 bg-white text-gray-900"
            autoFocus
            autoComplete="off"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
