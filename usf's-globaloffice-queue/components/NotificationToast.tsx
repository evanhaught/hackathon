import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-0 left-0 flex justify-center z-[100] pointer-events-none">
      <div className="bg-[#006747] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 border-2 border-[#CFC493] animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-auto max-w-2xl mx-4">
        <div className="bg-[#CFC493] p-1.5 rounded-full">
          <Info className="w-5 h-5 text-[#006747]" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base md:text-lg leading-snug text-center">{message}</p>
        </div>
        <button onClick={onClose} className="text-[#CFC493] hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};