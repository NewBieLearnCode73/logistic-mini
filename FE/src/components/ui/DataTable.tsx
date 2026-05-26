import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  columns: Column<T>[];
  loading?: boolean;
  
  // Pagination
  totalItems?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  
  // Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  
  // Sort
  sortKey?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  
  // Slots
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  totalItems = 0,
  page = 1,
  limit = 10,
  onPageChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  sortKey,
  sortDirection,
  onSort,
  filters,
  actions,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  // Sync search query from parent
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    if (onSearchChange && searchQuery !== undefined) {
      const handler = setTimeout(() => {
        if (localSearch !== searchQuery) {
          onSearchChange(localSearch);
        }
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [localSearch, onSearchChange, searchQuery]);

  const handleSortClick = (key: string) => {
    if (!onSort) return;
    let nextDirection: 'asc' | 'desc' | null = 'asc';
    if (sortKey === key) {
      if (sortDirection === 'asc') nextDirection = 'desc';
      else if (sortDirection === 'desc') nextDirection = null;
    }
    onSort(key, nextDirection);
  };

  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="w-full space-y-3">
      {/* Header bar (Search, Filters, Actions) */}
      {(onSearchChange || filters || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {onSearchChange && (
              <div className="relative w-full max-w-xs">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={searchPlaceholder || t('common.search')}
                  className="input-field pl-8.5 w-full"
                />
              </div>
            )}
            {filters}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table container */}
      <div className="overflow-hidden rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/40 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200/50 dark:divide-zinc-800/40 table-fixed">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/10">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      onClick={() => col.sortable && handleSortClick(col.key)}
                      className={`table-header-cell ${
                        col.sortable ? 'cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-900/50' : ''
                      } ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5 py-1">
                        <span>{col.header}</span>
                        {col.sortable && onSort && (
                          <span className="text-zinc-400 dark:text-zinc-500">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUpIcon className="h-3 w-3" />
                              ) : sortDirection === 'desc' ? (
                                <ChevronDownIcon className="h-3 w-3" />
                              ) : (
                                <ChevronUpDownIcon className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronUpDownIcon className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 bg-white dark:divide-zinc-800/40 dark:bg-zinc-950">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-4">
                    <LoadingSkeleton rows={limit} columns={columns.length} />
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={(item as any).id || idx}
                    className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`table-cell ${col.className || ''}`}>
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="truncate block">
                            {String((item as any)[col.key] ?? '')}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {onPageChange && totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-200/50 px-4 py-3 dark:border-zinc-800/40">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="btn-secondary px-3 py-1"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="btn-secondary px-3 py-1"
              >
                {t('common.next')}
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  {t('common.showing')}{' '}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {startItem}
                  </span>{' '}
                  {t('common.of')}{' '}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {endItem}
                  </span>{' '}
                  {t('common.of')}{' '}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {totalItems}
                  </span>{' '}
                  {t('common.results')}
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md bg-white dark:bg-zinc-950"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || loading}
                    className="relative inline-flex items-center rounded-l-md border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    // Limit visible page numbers
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - page) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          aria-current={page === pageNum ? 'page' : undefined}
                          className={`relative inline-flex items-center border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 text-[13px] font-medium transition-colors ${
                            page === pageNum
                              ? 'z-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                              : 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (
                      pageNum === 2 ||
                      pageNum === totalPages - 1
                    ) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 text-[13px] font-medium bg-white dark:bg-zinc-950 text-zinc-500"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="relative inline-flex items-center rounded-r-md border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
