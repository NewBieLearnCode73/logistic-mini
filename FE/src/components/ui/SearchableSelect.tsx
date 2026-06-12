import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: any;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  className?: string;
}

const removeDiacritics = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  disabled = false,
  error = false,
  required = false,
  className = '',
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const selectPlaceholder = placeholder || t('common.select');
  const selectSearchPlaceholder = searchPlaceholder || t('common.search');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = options.filter((o) => {
    const q = removeDiacritics(search.toLowerCase());
    const labelLower = removeDiacritics(o.label.toLowerCase());
    const subLabelLower = o.subLabel ? removeDiacritics(String(o.subLabel).toLowerCase()) : '';
    return (
      labelLower.includes(q) ||
      subLabelLower.includes(q)
    );
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch('');
          }
        }}
        disabled={disabled}
        className={`input-field w-full text-left flex items-center justify-between gap-2 pr-2 ${
          error ? 'border-red-500' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-zinc-100/50 dark:bg-zinc-900/60' : 'cursor-pointer'}`}
      >
        <span
          className={`truncate flex-1 ${
            selectedOption
              ? 'text-text-primary'
              : 'text-text-muted'
          }`}
        >
          {selectedOption ? selectedOption.label : selectPlaceholder}
        </span>
        <span className="flex items-center gap-0.5 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <XMarkIcon className="h-3.5 w-3.5 text-text-muted" />
            </span>
          )}
          <ChevronUpDownIcon className="h-4 w-4 text-text-muted" />
        </span>
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required
          onChange={() => {}}
          tabIndex={-1}
          className="absolute opacity-0 h-0 w-0 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-full min-w-[280px] sm:min-w-[320px] md:min-w-[420px] rounded-lg border border-border bg-surface shadow-lg overflow-hidden animate-in fade-in duration-100">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={selectSearchPlaceholder}
                className="w-full rounded-md border border-border bg-muted/30 py-1.5 pl-8 pr-3 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[320px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-[12px] text-text-muted">
                {t('common.noResults')}
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 text-[13px] transition-colors flex items-center justify-between gap-2 ${
                    option.value === value
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-text-primary hover:bg-muted/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.subLabel && (
                      <span className="block truncate text-[11px] text-text-muted mt-0.5">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {option.value === value && (
                    <span className="text-accent text-[11px] font-bold shrink-0">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
