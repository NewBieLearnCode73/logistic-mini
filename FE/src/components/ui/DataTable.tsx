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
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={searchPlaceholder || t('common.search')}
                  className="input-field pl-8 w-full"
                />
              </div>
            )}
            {filters}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table container */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-muted table-fixed">
            <thead className="bg-transparent">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      onClick={() => col.sortable && handleSortClick(col.key)}
                      className={`table-header-cell ${col.sortable ? 'cursor-pointer select-none hover:bg-muted' : ''
                        } ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5 py-1">
                        <span>{col.header}</span>
                        {col.sortable && onSort && (
                          <span className="text-text-muted">
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
            <tbody className="divide-y divide-border-muted bg-surface">
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
                    className="table-row"
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
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
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
                <p className="text-[13px] text-text-secondary">
                  {t('common.showing')}{' '}
                  <span className="font-medium text-text-primary">
                    {startItem}
                  </span>{' '}
                  {t('common.of')}{' '}
                  <span className="font-medium text-text-primary">
                    {endItem}
                  </span>{' '}
                  {t('common.of')}{' '}
                  <span className="font-medium text-text-primary">
                    {totalItems}
                  </span>{' '}
                  {t('common.results')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <nav
                  className="isolate inline-flex -space-x-px rounded-md bg-surface"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || loading}
                    className="relative inline-flex items-center rounded-l-md border border-border bg-surface px-2 py-1.5 text-text-secondary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`relative inline-flex items-center border border-border px-3 py-1.5 text-[13px] font-medium transition-colors ${page === pageNum
                            ? 'z-10 bg-accent text-text-inverse border-accent font-semibold'
                            : 'bg-surface text-text-secondary hover:bg-muted'
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
                          className="relative inline-flex items-center border border-border px-3 py-1.5 text-[13px] font-medium bg-surface text-text-secondary"
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
                    className="relative inline-flex items-center rounded-r-md border border-border bg-surface px-2 py-1.5 text-text-secondary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
                {totalPages > 5 && (
                  <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                    <span className="hidden md:inline">{t('common.goToPage')}:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      defaultValue={page}
                      key={page}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          onPageChange(val);
                        } else {
                          e.target.value = page.toString();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val) && val >= 1 && val <= totalPages) {
                            onPageChange(val);
                          } else {
                            (e.target as HTMLInputElement).value = page.toString();
                          }
                        }
                      }}
                      className="w-12 text-center rounded border border-border bg-surface px-1.5 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span>/ {totalPages}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
