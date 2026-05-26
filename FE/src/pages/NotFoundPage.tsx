import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-8xl font-semibold tracking-tight text-zinc-350 dark:text-zinc-800">
        404
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t('errors.notFound')}
      </h2>
      <p className="mt-2 text-[13px] text-zinc-500 dark:text-zinc-400">
        {t('common.back')}
      </p>
      <Link to="/" className="btn-primary mt-6">
        {t('sidebar.dashboard')}
      </Link>
    </div>
  );
}
