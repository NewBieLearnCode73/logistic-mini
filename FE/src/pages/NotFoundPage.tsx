import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-8xl font-semibold tracking-tight text-text-muted">
        404
      </div>
      <h2 className="mt-4 text-lg font-semibold text-text-primary">
        {t('errors.notFound')}
      </h2>
      <p className="mt-2 text-[13px] text-text-secondary">
        {t('common.back')}
      </p>
      <Link to="/" className="btn-primary mt-6">
        {t('sidebar.dashboard')}
      </Link>
    </div>
  );
}
