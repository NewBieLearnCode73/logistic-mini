import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { RoleName, ShipmentStatus } from '../../utils/constants';
import { useShipmentDetail, useReceiveShipment } from '../../hooks/queries/useShipments';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getRole, getNodeId } = useAuthStore();

  const role = getRole();
  const userNodeId = getNodeId();
  const isAdmin = role === RoleName.ADMIN;

  // React Query queries/mutations
  const { data: shipment, isLoading, isError } = useShipmentDetail(id || '');
  const receiveMutation = useReceiveShipment();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-4">
        <div className="h-6 w-20 rounded bg-zinc-100 dark:bg-zinc-900/60" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="h-40 rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
            <div className="h-40 rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
          </div>
          <div className="h-60 rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
        </div>
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <span className="text-4xl mb-2">❌</span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t('shipment.notFound')}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          {t('shipment.notFoundDesc')}
        </p>
        <button onClick={() => navigate('/shipments')} className="btn-secondary mt-4">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const handleConfirmReceive = () => {
    receiveMutation.mutate(shipment.id);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Check if current user is from the destination node or admin, and shipment is in transit
  const canReceive =
    shipment.status === ShipmentStatus.IN_TRANSIT &&
    (isAdmin || userNodeId === shipment.destinationNodeId);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/shipments')}
          className="btn-ghost flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150 pl-0"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{t('common.back')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Left Column: Shipment Details, Batch Details & Route Details */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Card 1: Shipment Info */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3 dark:border-zinc-800/40">
              <div>
                <span className="text-2xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
                  {t('shipment.trackingCode')}
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                  {shipment.trackingCode}
                </h2>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.shippedAt')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatDate(shipment.shippedAt)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.expectedDeliveryDate')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatDate(shipment.expectedDeliveryDate)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.receivedAt')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatDate(shipment.actualDeliveryDate)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.creator')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {shipment.creator?.fullName || '—'}{' '}
                  {shipment.creator && (
                    <span className="text-2xs text-zinc-400 dark:text-zinc-500 font-normal">({shipment.creator.email})</span>
                  )}
                </span>
              </div>
              {shipment.receiver && (
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.receiver')}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {shipment.receiver.fullName}{' '}
                    <span className="text-2xs text-zinc-400 dark:text-zinc-500 font-normal">({shipment.receiver.email})</span>
                  </span>
                </div>
              )}
              {shipment.notes && (
                <div className="col-span-2">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.notes')}</span>
                  <p className="mt-0.5 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 p-2 rounded text-[13px]">
                    {shipment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Batch Info */}
          <div className="card space-y-3">
            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200/50 pb-2 dark:border-zinc-800/40">
              {t('batch.title')}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.batchCode')}</span>
                <span
                  onClick={() => navigate(`/batches/${shipment.batchId}`)}
                  className="font-mono font-medium text-zinc-900 hover:underline dark:text-zinc-50 cursor-pointer text-2xs"
                >
                  {shipment.batch?.batchCode}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.product')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {shipment.batch?.product?.name} ({shipment.batch?.product?.sku})
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.quantityShipped')}</span>
                <span className="font-medium text-zinc-950 dark:text-zinc-50 font-mono">
                  {shipment.quantityShipped} {shipment.batch?.unit}
                </span>
              </div>
              {shipment.quantityReceived !== null && (
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('shipment.receivedAt')} ({t('batch.quantity')})</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    {shipment.quantityReceived} {shipment.batch?.unit}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Route details */}
          <div className="card space-y-3">
            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200/50 pb-2 dark:border-zinc-800/40">
              Tuyến đường di chuyển
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
              <div className="p-3 bg-zinc-50/50 rounded dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800/40">
                <span className="text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase block tracking-wider mb-1">
                  {t('shipment.sourceNode')}
                </span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{shipment.sourceNode?.name}</p>
                <p className="text-2xs text-zinc-500 mt-0.5">
                  Type: {shipment.sourceNode?.nodeType ? t(`node.types.${shipment.sourceNode.nodeType}`, shipment.sourceNode.nodeType) : '—'}
                </p>
                <p className="text-[12px] text-zinc-500 mt-1">{shipment.sourceNode?.address || '—'}</p>
              </div>
              <div className="p-3 bg-zinc-50/50 rounded dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800/40">
                <span className="text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase block tracking-wider mb-1">
                  {t('shipment.destNode')}
                </span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{shipment.destinationNode?.name}</p>
                <p className="text-2xs text-zinc-500 mt-0.5">
                  Type: {shipment.destinationNode?.nodeType ? t(`node.types.${shipment.destinationNode.nodeType}`, shipment.destinationNode.nodeType) : '—'}
                </p>
                <p className="text-[12px] text-zinc-500 mt-1">{shipment.destinationNode?.address || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Incidents */}
        <div className="space-y-4">
          {canReceive && (
            <div className="card">
              <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                {t('shipment.receiveShipment')}
              </h4>
              <p className="text-2xs text-zinc-500 dark:text-zinc-400 mb-4">
                Xác nhận đã nhận đủ {shipment.quantityShipped} {shipment.batch?.unit} của lô hàng tại địa điểm của bạn. Số lượng hàng sẽ được ghi có vào kho của bạn ngay lập tức.
              </p>
              <button
                onClick={handleConfirmReceive}
                disabled={receiveMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-1.5 py-2 text-[13px]"
              >
                {receiveMutation.isPending ? (
                  <span>{t('common.loading')}</span>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{t('shipment.receiveShipment')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Incident reporting panel (Static placeholder for later phases if needed, or simple info) */}
          <div className="card">
            <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Sự cố vận đơn
            </h4>
            {shipment.issues && shipment.issues.length > 0 ? (
              <div className="space-y-2 mt-2">
                {shipment.issues.map((issue) => (
                  <div key={issue.id} className="p-2 border border-red-200/40 rounded bg-red-50/20 dark:border-red-950/20 dark:bg-red-950/10">
                    <p className="text-[12px] text-zinc-800 dark:text-zinc-300">{issue.description}</p>
                    <p className="text-3xs text-zinc-400 dark:text-zinc-500 mt-1">
                      Báo cáo bởi: {issue.reporter?.fullName} &middot; {formatDate(issue.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-2xs text-zinc-400 dark:text-zinc-500">
                Chưa ghi nhận sự cố nào liên quan tới vận đơn này.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
