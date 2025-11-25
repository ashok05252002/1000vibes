import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export const SlideOver = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className={cn(
            "pointer-events-auto w-screen max-w-2xl transform transition-transform duration-300 ease-in-out bg-white shadow-2xl flex flex-col h-full",
            className
          )}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50/50">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button 
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary hover:bg-gray-100 p-2 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
