import React from 'react';
import { Menu, Bell, Search, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:bg-gray-100 rounded-md"
        >
          <Menu size={20} />
        </button>
        
        {/* Store Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-border cursor-pointer hover:bg-gray-100">
          <span className="text-sm font-medium text-text-primary">Main Branch - Chennai</span>
          <ChevronDown size={14} className="text-text-secondary" />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Date Filter */}
        <div className="hidden md:flex items-center gap-2 text-text-secondary text-sm">
          <Calendar size={16} />
          <span>Today: 24 Oct, 2025</span>
        </div>

        <div className="h-6 w-px bg-border hidden md:block"></div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-text-secondary hover:bg-gray-100 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              AD
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-text-primary">Admin User</p>
              <p className="text-xs text-text-secondary">Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
