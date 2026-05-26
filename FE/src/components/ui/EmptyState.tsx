import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <svg
        className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-[13px] font-semibold text-gray-900 dark:text-gray-100">
        {title || t('common.noData')}
      </h3>
      <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-500">
        {description || t('common.noDataDesc')}
      </p>
    </div>
  );
}
