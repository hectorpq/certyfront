import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    const end = Math.min(totalPages, start + showPages - 1);
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 pt-4 mt-2 border-t border-secondary-100">
      <p className="text-xs text-secondary-500">
        <span className="font-semibold text-secondary-700">{startItem}–{endItem}</span> de{' '}
        <span className="font-semibold text-secondary-700">{totalItems}</span> resultados
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((page, idx) => (
          <button
            key={typeof page === 'number' ? page : `ellipsis-${idx}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page !== 'number'}
            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all ${
              page === currentPage
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                : typeof page === 'number'
                ? 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                : 'text-secondary-300 cursor-default'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
