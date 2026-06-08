import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicTrace } from '../../hooks/queries/usePublicTrace';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchOSRMRoute } from '../../utils/routing';
import {
  CalendarDaysIcon,
  InboxStackIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

// Event translation helper mapping
const getEventTitleKey = (type: string): string => {
  const map: Record<string, string> = {
    CREATED: 'timeline.mfg',
    SHIPPED: 'timeline.transit',
    RECEIVED: 'timeline.received',
    SOLD: 'timeline.sold',
    DELAYED: 'timeline.delayed',
    INVESTIGATING: 'timeline.investigating',
    LOST: 'timeline.lost',
    DISCARDED: 'timeline.discarded',
  };
  return map[type] || 'common.detail';
};

const getEventColors = (type: string): { bg: string; text: string; border: string } => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    CREATED: {
      bg: 'bg-zinc-50 dark:bg-zinc-900/40',
      text: 'text-zinc-500 dark:text-zinc-400',
      border: 'border-zinc-200/50 dark:border-zinc-800/40',
    },
    SHIPPED: {
      bg: 'bg-blue-50/40 dark:bg-blue-950/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/20 dark:border-blue-900/20',
    },
    RECEIVED: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200/20 dark:border-emerald-900/20',
    },
    SOLD: {
      bg: 'bg-indigo-50/40 dark:bg-indigo-950/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200/20 dark:border-indigo-900/20',
    },
    DELAYED: {
      bg: 'bg-amber-50/40 dark:bg-amber-950/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/20 dark:border-amber-900/20',
    },
    INVESTIGATING: {
      bg: 'bg-orange-50/40 dark:bg-orange-950/10',
      text: 'text-orange-650 dark:text-orange-400',
      border: 'border-orange-200/20 dark:border-orange-900/20',
    },
    LOST: {
      bg: 'bg-red-50/40 dark:bg-red-950/10',
      text: 'text-red-650 dark:text-red-400',
      border: 'border-red-200/20 dark:border-red-900/20',
    },
    DISCARDED: {
      bg: 'bg-red-50/40 dark:bg-red-950/10',
      text: 'text-red-650 dark:text-red-400',
      border: 'border-red-200/20 dark:border-red-900/20',
    },
  };
  return colors[type] || {
    bg: 'bg-zinc-50 dark:bg-zinc-900/40',
    text: 'text-zinc-500 dark:text-zinc-400',
    border: 'border-zinc-200/50 dark:border-zinc-800/40',
  };
};

export default function TracePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { batchCode } = useParams<{ batchCode: string }>();

  // Geolocation states
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Map DOM reference
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Geolocation request on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setHasRequestedLocation(true);
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
          setCoords(undefined);
          setHasRequestedLocation(true);
        },
        { timeout: 5000 }
      );
    } else {
      setCoords(undefined);
      setHasRequestedLocation(true);
    }
  }, []);

  // Fetch Traceability data once coordinates attempt has completed
  const { data: traceData, isLoading, isError } = usePublicTrace(
    batchCode || '',
    coords,
    hasRequestedLocation
  );

  const formatDate = (dateStr: string | null, withTime = false) => {
    if (!dateStr) return '—';
    try {
      const options: Intl.DateTimeFormatOptions = withTime
        ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateStr).toLocaleString('vi-VN', options);
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    if (!mapRef.current || !traceData?.batch) return;

    const abortController = new AbortController();

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const locations: { lat: number; lng: number; name: string; type: string }[] = [];

    // Origin Node
    if (traceData.batch.originNode?.latitude && traceData.batch.originNode?.longitude) {
      locations.push({
        lat: traceData.batch.originNode.latitude,
        lng: traceData.batch.originNode.longitude,
        name: traceData.batch.originNode.name,
        type: 'origin',
      });
    }

    // Intermediate timeline event nodes
    traceData.timelineEvents.forEach((evt) => {
      if (evt.node?.latitude && evt.node?.longitude) {
        const exists = locations.some(
          (loc) => loc.lat === evt.node?.latitude && loc.lng === evt.node?.longitude
        );
        if (!exists) {
          locations.push({
            lat: evt.node.latitude,
            lng: evt.node.longitude,
            name: evt.node.name,
            type: 'event',
          });
        }
      }
    });

    // Current location node
    if (traceData.batch.currentNode?.latitude && traceData.batch.currentNode?.longitude) {
      const exists = locations.some(
        (loc) =>
          loc.lat === traceData.batch.currentNode?.latitude &&
          loc.lng === traceData.batch.currentNode?.longitude
      );
      if (!exists) {
        locations.push({
          lat: traceData.batch.currentNode.latitude,
          lng: traceData.batch.currentNode.longitude,
          name: traceData.batch.currentNode.name,
          type: 'current',
        });
      }
    }

    if (locations.length === 0) return;

    // Instantiate map
    const map = L.map(mapRef.current, {
      center: [locations[0].lat, locations[0].lng],
      zoom: 6,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Div icon generator for beautiful responsive dots
    const createMarkerIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 rounded-full opacity-35 animate-ping" style="background-color: ${color}"></span>
            <span class="relative inline-flex rounded-full h-4.5 w-4.5 border border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style="background-color: ${color}">
              ${label}
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    const pathCoords: [number, number][] = [];

    locations.forEach((loc, idx) => {
      const color =
        loc.type === 'origin' ? '#374151' : loc.type === 'current' ? '#10B981' : '#3B82F6';
      const label =
        loc.type === 'origin' ? 'M' : loc.type === 'current' ? 'C' : String(idx);

      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(color, label),
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-1 font-sans text-2xs">
          <div class="font-bold text-gray-900">${loc.name}</div>
          <div class="text-gray-400 capitalize mt-0.5">${loc.type === 'origin'
          ? 'Nơi sản xuất (Origin)'
          : loc.type === 'current'
            ? 'Vị trí hiện tại (Current)'
            : 'Địa điểm trung chuyển'
        }</div>
        </div>
      `);

      pathCoords.push([loc.lat, loc.lng]);
    });

    if (pathCoords.length > 1) {
      // Fit bounds to node locations first
      map.fitBounds(L.latLngBounds(pathCoords), { padding: [30, 30] });

      // Fetch actual OSRM road routes segment by segment concurrently
      const segmentPromises = [];
      for (let i = 0; i < pathCoords.length - 1; i++) {
        const start = pathCoords[i];
        const end = pathCoords[i + 1];
        segmentPromises.push(
          fetchOSRMRoute([start, end], abortController.signal)
            .then((coords) => ({ coords, success: !!coords && coords.length > 0 }))
            .catch(() => ({ coords: null, success: false }))
        );
      }

      Promise.all(segmentPromises)
        .then((results) => {
          if (abortController.signal.aborted || mapInstanceRef.current !== map) return;

          const combinedCoords: [number, number][] = [];
          let hasRoadRoute = false;

          results.forEach((res, i) => {
            if (res.success && res.coords) {
              combinedCoords.push(...res.coords);
              hasRoadRoute = true;
            } else {
              // Fallback to straight segment coords if OSRM failed for this segment
              combinedCoords.push(pathCoords[i], pathCoords[i + 1]);
            }
          });

          if (combinedCoords.length > 0) {
            L.polyline(combinedCoords, {
              color: '#3B82F6',
              weight: 3.5,
              opacity: 0.8,
              dashArray: hasRoadRoute ? undefined : '5, 8', // Draw solid only if we resolved road routes, dashed if we fell back entirely
            }).addTo(map);
          }
        })
        .catch(() => {
          if (abortController.signal.aborted || mapInstanceRef.current !== map) return;

          // Draw straight dashed fallback only on total failure/rejection
          L.polyline(pathCoords, {
            color: '#3B82F6',
            weight: 2.5,
            opacity: 0.7,
            dashArray: '5, 8',
          }).addTo(map);
        });
    }

    return () => {
      abortController.abort();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [traceData]);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-60 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (isError || !traceData) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
          <ExclamationCircleIcon className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-150">
            {t('public.notFound')}
          </h2>
          <p className="text-2xs text-gray-500 max-w-xs mx-auto">
            {t('public.notFoundHint')}
          </p>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="btn-secondary py-2 px-4 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{t('common.back')}</span>
        </button>
      </div>
    );
  }

  const { batch, timelineEvents } = traceData;
  const isLost = batch.status === 'LOST';

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-5">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/scan')}
          className="btn-ghost flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white pl-0"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Quay lại Quét</span>
        </button>
      </div>

      {/* Main Product Card */}
      <div className="card space-y-4 relative overflow-hidden">
        {/* Verification Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500 dark:bg-emerald-400" />

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-3xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/25 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
              <ShieldCheckIcon className="h-3 w-3" />
              <span>Sản phẩm chính hãng</span>
            </span>
            <h1 className="text-base font-bold text-gray-950 dark:text-white leading-snug">
              {batch.product?.name}
            </h1>
          </div>
          <span className="text-2xs font-mono bg-gray-50 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800 select-all">
            SKU: {batch.product?.sku}
          </span>
        </div>

        {batch.product?.description && (
          <p className="text-2xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-800/10 p-2.5 rounded-lg border border-gray-100 dark:border-gray-850/10">
            {batch.product.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-2xs">
          <div>
            <span className="text-gray-450 block mb-0.5">Phân loại</span>
            <span className="font-semibold text-gray-900 dark:text-gray-200">
              {batch.product?.category ? t(`product.categories.${batch.product.category}` as any) : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-450 block mb-0.5">Quy cách đóng gói</span>
            <span className="font-semibold text-gray-900 dark:text-gray-200">
              {batch.product?.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Information */}
      <div className="card space-y-3.5">
        <h3 className="text-2xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Chi tiết Lô hàng
        </h3>

        <div className="grid grid-cols-2 gap-4 text-2xs">
          <div>
            <span className="text-gray-450 block mb-0.5">Mã Lô hàng</span>
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100 uppercase">
              {batch.batchCode}
            </span>
          </div>
          <div>
            <span className="text-gray-450 block mb-0.5">Trạng thái</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${isLost
                  ? 'text-red-600'
                  : batch.status === 'SOLD'
                    ? 'text-purple-600'
                    : 'text-emerald-600'
                }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLost ? 'bg-red-500' : batch.status === 'SOLD' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`}
              />
              {t(`batch.status.${batch.status}`, batch.status)}
            </span>
          </div>
          <div>
            <span className="text-gray-450 block mb-0.5">Ngày sản xuất (Mfg Date)</span>
            <span className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-1">
              <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
              {formatDate(batch.manufactureDate)}
            </span>
          </div>
          <div>
            <span className="text-gray-450 block mb-0.5">Hạn sử dụng (Exp Date)</span>
            <span className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-1">
              <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
              {formatDate(batch.expiryDate)}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-gray-50 dark:border-gray-850/30">
            <span className="text-gray-450 block mb-0.5">Nơi sản xuất (Origin Hub)</span>
            <span className="font-medium text-gray-900 dark:text-gray-150 flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
              {batch.originNode?.name}
            </span>
            <p className="text-3xs text-gray-400 ml-4.5 mt-0.5">{batch.originNode?.address}</p>
          </div>
        </div>
      </div>

      {/* Journey Map */}
      <div className="card space-y-2">
        <h3 className="text-2xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Bản đồ Hành trình (Route Map)
        </h3>
        <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50">
          <div ref={mapRef} className="h-64 w-full" />
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="card space-y-4">
        <h3 className="text-2xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Lịch trình luân chuyển chi tiết
        </h3>

        {timelineEvents.length === 0 ? (
          <p className="text-2xs text-gray-400 italic text-center py-4">{t('timeline.noEvents')}</p>
        ) : (
          <div className="relative pl-6 space-y-5 border-l border-zinc-200/60 dark:border-zinc-800 ml-2">
            {timelineEvents.map((evt, idx) => {
              const colors = getEventColors(evt.eventType);
              const isLast = idx === timelineEvents.length - 1;

              return (
                <div key={idx} className="relative">
                  {/* Event Marker Bubble */}
                  <span
                    className={`absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full flex items-center justify-center border ${colors.bg} ${colors.border} ${colors.text} shadow-2xs z-10`}
                  >
                    {evt.eventType === 'CREATED' ? (
                      <InboxStackIcon className="h-2.5 w-2.5" />
                    ) : evt.eventType === 'SHIPPED' ? (
                      <TruckIcon className="h-2.5 w-2.5" />
                    ) : evt.eventType === 'RECEIVED' ? (
                      <CheckCircleIcon className="h-2.5 w-2.5" />
                    ) : (
                      <ClockIcon className="h-2.5 w-2.5" />
                    )}
                  </span>

                  {/* Content Container */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`text-2xs font-bold leading-none ${isLast
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-gray-900 dark:text-gray-200'
                          }`}
                      >
                        {t(getEventTitleKey(evt.eventType), evt.eventType)}
                      </span>
                      <span className="text-3xs text-gray-400 font-mono">
                        {formatDate(evt.occurredAt, true)}
                      </span>
                    </div>

                    <div className="text-3xs space-y-0.5 text-gray-500">
                      {evt.node && (
                        <div className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                          <span>{evt.node.name}</span>
                          <span className="text-gray-400 font-normal">
                            ({t(`node.types.${evt.node.nodeType}`, evt.node.nodeType)})
                          </span>
                        </div>
                      )}
                      {evt.actor && (
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {t('timeline.doneBy')}: {evt.actor.fullName}
                          </span>
                        </div>
                      )}
                    </div>

                    {evt.notes && (
                      <p className="text-3xs text-gray-600 dark:text-gray-450 italic bg-gray-50/60 dark:bg-gray-800/10 p-1.5 rounded border border-gray-100/50 dark:border-gray-850/5 leading-relaxed">
                        {evt.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
