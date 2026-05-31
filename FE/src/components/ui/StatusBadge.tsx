import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  // Map status color to a unified badge styling
  let badgeClass = "badge-info";
  if (status === 'RECEIVED' || status === 'RESOLVED') {
    badgeClass = "badge-success";
  } else if (status === 'SOLD' || status === 'DELAYED' || status === 'OPEN') {
    badgeClass = "badge-warning";
  } else if (status === 'DISCARDED' || status === 'LOST') {
    badgeClass = "badge-danger";
  } else if (status === 'CREATED' || status === 'CANCELLED' || status === 'CLOSED') {
    badgeClass = "badge-muted";
  } else if (status === 'IN_TRANSIT' || status === 'IN_PROGRESS') {
    badgeClass = "badge-primary";
  }

  return (
    <span className={`inline-flex items-center px-[10px] py-[3px] rounded-[8px] text-[12px] font-medium transition-colors ${badgeClass}`}>
      {t(`batch.status.${status}`, status)}
    </span>
  );
}
