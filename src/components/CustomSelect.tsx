import React, { useState } from 'react';

interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filtered = options;

  return (
    <div className="relative group">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <input
        readOnly
        value={value}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold transition-all shadow-sm cursor-pointer"
      />
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto">
          {filtered.map(opt => (
            <div 
              key={opt} 
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700" 
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
