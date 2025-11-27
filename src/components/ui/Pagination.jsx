import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-white">
      {/* Mobile View */}
      <div className="flex justify-between flex-1 sm:hidden">
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-text-secondary flex items-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            Showing <span className="font-medium text-text-primary">{startItem}</span> to <span className="font-medium text-text-primary">{endItem}</span> of <span className="font-medium text-text-primary">{totalItems}</span> results
          </p>
        </div>
        <div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => onPageChange(currentPage - 1)}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            
            {/* Simple Page Numbers (Current / Total) */}
            <div className="flex items-center px-4 text-sm font-medium text-text-secondary">
              Page {currentPage} of {totalPages}
            </div>

            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === totalPages} 
              onClick={() => onPageChange(currentPage + 1)}
              className="flex-row-reverse" // Hack to put icon on right
            >
              Next <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
