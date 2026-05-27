import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNodesList } from '../../hooks/queries/useNodes';
import { useShipmentsList } from '../../hooks/queries/useShipments';
import type { Node } from '../../types/node.types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const NODE_COLORS: Record<string, string> = {
  MANUFACTURER: '#374151', // Slate gray
  DISTRIBUTOR: '#3B82F6',  // Blue
  RETAILER: '#10B981',     // Green
  WAREHOUSE: '#F59E0B',    // Amber
};

export default function MapPage() {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Queries
  const { data: nodesData, isLoading: isLoadingNodes } = useNodesList();
  const { data: shipmentsData, isLoading: isLoadingShipments } = useShipmentsList({
    page: 1,
    limit: 1000,
  });

  // Filters state
  const [filterTypes, setFilterTypes] = useState<string[]>([
    'MANUFACTURER',
    'DISTRIBUTOR',
    'RETAILER',
    'WAREHOUSE',
  ]);
  const [showShipments, setShowShipments] = useState(true);

  const toggleFilterType = (type: string) => {
    if (filterTypes.includes(type)) {
      setFilterTypes(filterTypes.filter((t) => t !== type));
    } else {
      setFilterTypes([...filterTypes, type]);
    }
  };

  // Re-render Leaflet Map on data or filter change
  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const nodes = nodesData?.data || [];
    const shipments = shipmentsData?.data || [];

    // Filter nodes with valid coordinates
    const validNodes = nodes.filter(
      (n: Node) => n.latitude !== null && n.longitude !== null && n.isActive
    );

    // Calculate map center dynamically (fallback to Vietnam center)
    let centerLat = 16.047;
    let centerLng = 108.206;
    if (validNodes.length > 0) {
      const sumLat = validNodes.reduce((sum: number, n: Node) => sum + (n.latitude || 0), 0);
      const sumLng = validNodes.reduce((sum: number, n: Node) => sum + (n.longitude || 0), 0);
      centerLat = sumLat / validNodes.length;
      centerLng = sumLng / validNodes.length;
    }

    // Initialize Leaflet Map
    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 6,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom node marker generator using SVG and divIcon
    const createNodeMarkerIcon = (type: string) => {
      const color = NODE_COLORS[type] || '#6B7280';
      const char = type.substring(0, 1);
      return L.divIcon({
        className: 'custom-node-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-7 w-7 rounded-full opacity-20 animate-ping" style="background-color: ${color}"></span>
            <span class="relative inline-flex rounded-full h-5.5 w-5.5 border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-transform hover:scale-110" style="background-color: ${color}">
              ${char}
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Keep references to node lat/lng for shipment route mapping
    const nodeCoordsMap: Record<string, [number, number]> = {};

    // Render nodes
    validNodes.forEach((node: Node) => {
      if (node.latitude === null || node.longitude === null) return;
      nodeCoordsMap[node.id] = [node.latitude, node.longitude];

      // Skip rendering if filtered out
      if (!filterTypes.includes(node.nodeType)) return;

      const marker = L.marker([node.latitude, node.longitude], {
        icon: createNodeMarkerIcon(node.nodeType),
      }).addTo(map);

      // Node details Popup
      marker.bindPopup(`
        <div class="p-2 font-sans text-2xs space-y-1.5 min-w-[180px]">
          <div class="border-b border-border pb-1">
            <span class="text-3xs font-semibold uppercase tracking-wider px-1 py-0.5 rounded text-white" style="background-color: ${
              NODE_COLORS[node.nodeType]
            }">
              ${t(`node.types.${node.nodeType}`)}
            </span>
            <h4 class="font-bold text-text-primary mt-1 leading-none">${node.name}</h4>
          </div>
          <div class="text-text-secondary">
            <span class="text-text-muted block text-3xs">Địa chỉ</span>
            <p className="mt-0.5 leading-snug">${node.address || '—'}</p>
          </div>
          <div class="grid grid-cols-2 gap-1 text-[10px] text-text-muted font-mono">
            <div>Lat: ${node.latitude.toFixed(4)}</div>
            <div>Lng: ${node.longitude.toFixed(4)}</div>
          </div>
        </div>
      `);
    });

    // Render active shipments paths
    if (showShipments) {
      const activeShipments = shipments.filter(
        (s) => s.status === 'IN_TRANSIT' || s.status === 'DELAYED'
      );

      activeShipments.forEach((shipment) => {
        const start = nodeCoordsMap[shipment.sourceNodeId];
        const end = nodeCoordsMap[shipment.destinationNodeId];

        // Draw connections only if both nodes have coordinates
        if (start && end) {
          const polyline = L.polyline([start, end], {
            color: '#4F46E5', // Indigo-600
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 12',
          }).addTo(map);

          // Shipment details Popup on line click
          polyline.bindPopup(`
            <div class="p-2 font-sans text-2xs space-y-1.5 min-w-[200px]">
              <div class="border-b border-border pb-1">
                <span class="text-3xs font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-status-intransit-bg text-status-intransit-text border border-border/25">
                  Vận đơn: ${shipment.trackingCode}
                </span>
              </div>
              <div class="space-y-1 text-text-secondary">
                <div>
                  <span class="text-text-muted text-3xs block">Sản phẩm (Lô hàng)</span>
                  <span class="font-semibold">${shipment.batch?.product?.name || '—'}</span> 
                  <span class="text-3xs font-mono text-text-muted block">${shipment.batch?.batchCode || ''}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-3xs">
                  <div>
                    <span class="text-text-muted block">Số lượng</span>
                    <span class="font-bold text-text-primary font-mono">${shipment.quantityShipped} ${shipment.batch?.unit || ''}</span>
                  </div>
                  <div>
                    <span class="text-text-muted block">Trạng thái</span>
                    <span class="font-bold text-status-intransit-text">${t(`shipment.status.${shipment.status}`, shipment.status)}</span>
                  </div>
                </div>
                <div class="pt-1.5 border-t border-border text-[10px] space-y-0.5">
                  <div><span class="text-text-muted">Từ:</span> ${shipment.sourceNode?.name}</div>
                  <div><span class="text-text-muted">Đến:</span> ${shipment.destinationNode?.name}</div>
                </div>
              </div>
            </div>
          `);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [nodesData, shipmentsData, filterTypes, showShipments]);

  const isLoading = isLoadingNodes || isLoadingShipments;

  return (
    <div className="relative w-full h-[calc(100vh-100px)] rounded-xl border border-border overflow-hidden bg-background">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-surface/70 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-2xs font-semibold text-text-secondary">
              {t('common.loading')}
            </span>
          </div>
        </div>
      )}

      {/* Leaflet Map Div */}
      <div ref={mapRef} className="w-full h-full z-10" />

      {/* Floating Control Panel */}
      <div className="absolute top-4 left-4 z-20 w-64 glass-panel p-4 rounded-xl shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center gap-1.5 border-b border-border pb-2.5">
          <MapIcon className="h-4.5 w-4.5 text-text-secondary" />
          <div>
            <h2 className="text-2xs font-bold text-text-primary uppercase tracking-wider">
              {t('map.title')}
            </h2>
            <p className="text-4xs text-text-muted leading-none mt-0.5">
              Phân tích trực quan mạng lưới
            </p>
          </div>
        </div>

        {/* Node Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-text-muted text-3xs font-semibold uppercase tracking-wider">
            <FunnelIcon className="h-3 w-3" />
            <span>{t('map.filterNodes')}</span>
          </div>
          <div className="space-y-1.5">
            {['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'WAREHOUSE'].map((type) => {
              const active = filterTypes.includes(type);
              const color = NODE_COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleFilterType(type)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-3xs font-medium border transition-all ${
                    active
                      ? 'bg-muted border-border text-text-primary'
                      : 'border-transparent text-text-muted hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>{t(`node.types.${type}`)}</span>
                  </div>
                  {active && <span className="text-[10px] text-accent font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shipments filter */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-text-muted text-3xs font-semibold uppercase tracking-wider">
            <AdjustmentsHorizontalIcon className="h-3 w-3" />
            <span>Hiển thị luồng vận đơn</span>
          </div>
          <label className="flex items-center gap-2 px-1 text-3xs font-semibold text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showShipments}
              onChange={(e) => setShowShipments(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent-glow h-3.5 w-3.5 bg-surface"
            />
            <span>{t('map.activeShipments')}</span>
          </label>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel px-3 py-2 rounded-lg shadow-sm text-4xs space-y-1">
        <h2 className="font-bold text-text-muted uppercase tracking-widest leading-none mb-1">
          {t('map.legend')}
        </h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-text-secondary">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            <span>M: Sản xuất</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>D: Phân phối</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>W: Kho bãi</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>R: Cửa hàng</span>
          </div>
          <div className="col-span-2 border-t border-border pt-1 mt-1 flex items-center gap-1">
            <span className="h-0.5 w-3.5 bg-indigo-600 border-t border-dashed" />
            <span>Vận đơn đang chạy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
