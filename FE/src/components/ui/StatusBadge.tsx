import { STATUS_CONFIG } from '../../utils/constants';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {t(`batch.status.${status}`, status)}
    </span>
  );
}
