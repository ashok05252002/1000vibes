import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TagInput = ({ value = [], onChange, placeholder, className }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      
      if (trimmedInput && !value.includes(trimmedInput)) {
        onChange([...value, trimmedInput]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 p-2 border border-border rounded-md bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-shadow",
      className
    )}>
      {value.map((tag, index) => (
        <span 
          key={index} 
          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-text-primary border border-gray-200"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1.5 text-text-secondary hover:text-red-500 focus:outline-none"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent py-1"
        placeholder={value.length === 0 ? placeholder : ""}
      />
    </div>
  );
};
