import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { School } from '../../types/school';
import type { SchoolType } from '../../types/school';

const TYPE_COLORS: Record<SchoolType, string> = {
  '大学': '#3b82f6',
  '短期大学': '#a855f7',
  '専門学校': '#f97316',
};

interface SchoolMapProps {
  schools: School[];
  selectedId: string | null;
  onSelect: (school: School) => void;
  onDblClick?: (school: School) => void;
}

const HIROSHIMA_CENTER: [number, number] = [34.3963, 132.4596];
const COLOCATE_OFFSET = 22; // 同座標時の横ずれpx

function makeIcon(color: string, isSelected: boolean, anchorOffsetX = 0): L.Icon {
  const r = isSelected ? 14 : 10;
  const border = isSelected ? 3 : 2;
  const outline = 2;
  const w = (r + border + outline) * 2;
  const h = w + 10;
  const cx = w / 2;
  const cy = r + border + outline;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><circle cx="${cx}" cy="${cy}" r="${r + border}" fill="%231e293b"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${encodeURIComponent(color)}" stroke="white" stroke-width="${border}"/><circle cx="${cx}" cy="${cy}" r="${isSelected ? 5 : 3}" fill="white" opacity="0.9"/><polygon points="${cx - 5},${cy + r + border - 2} ${cx + 5},${cy + r + border - 2} ${cx},${h}" fill="${encodeURIComponent(color)}" stroke="%231e293b" stroke-width="1"/></svg>`;

  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [w, h],
    iconAnchor: [w / 2 + anchorOffsetX, h],
  });
}

export function SchoolMap({ schools, selectedId, onSelect, onDblClick }: SchoolMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const labelRef = useRef<L.Marker | null>(null);
  const zoomedToIdRef = useRef<string | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  const onDblClickRef = useRef(onDblClick);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onDblClickRef.current = onDblClick; }, [onDblClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    if ((mapRef.current as any)._leaflet_id) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(HIROSHIMA_CENTER, 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      updateWhenZooming: false,
      keepBuffer: 4,
      className: 'map-tiles',
    }).addTo(map);

    leafletMapRef.current = map;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(mapRef.current);
    (map as any)._resizeObserver = observer;

    return () => {
      observer.disconnect();
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (labelRef.current) { labelRef.current.remove(); labelRef.current = null; }

    // 同座標グループを検出
    const locationGroups = new Map<string, School[]>();
    schools.filter((s) => s.lat && s.lng).forEach((s) => {
      const key = `${s.lat},${s.lng}`;
      if (!locationGroups.has(key)) locationGroups.set(key, []);
      locationGroups.get(key)!.push(s);
    });

    const sorted = [...schools.filter((s) => s.lat && s.lng)].sort((a, b) =>
      a.id === selectedId ? 1 : b.id === selectedId ? -1 : 0
    );

    sorted.forEach((school) => {
      const isSelected = school.id === selectedId;
      const color = TYPE_COLORS[school.type] ?? '#94a3b8';

      // 同座標グループ内でのピンオフセット計算
      const key = `${school.lat},${school.lng}`;
      const group = locationGroups.get(key)!;
      const idx = group.indexOf(school);
      const total = group.length;
      const anchorOffsetX = total > 1
        ? (idx - (total - 1) / 2) * COLOCATE_OFFSET * -1
        : 0;

      const icon = makeIcon(color, isSelected, anchorOffsetX);

      const marker = L.marker([school.lat, school.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);

      let clickTimer: ReturnType<typeof setTimeout> | null = null;
      marker.on('click', () => {
        if (clickTimer) return;
        clickTimer = setTimeout(() => {
          clickTimer = null;
          onSelectRef.current(school);
        }, 250);
      });
      marker.on('dblclick', (e) => {
        L.DomEvent.stopPropagation(e);
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        onDblClickRef.current?.(school);
      });
      markersRef.current.push(marker);

      // 選択中のみラベル表示（ピンのオフセットに合わせてラベルもずらす）
      if (isSelected) {
        const labelShift = anchorOffsetX * -1;
        const lbl = L.marker([school.lat, school.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="position:relative;left:${labelShift}px;transform:translateX(-50%);background:#0f172a;color:${color};font-size:13px;font-weight:700;padding:3px 9px;border-radius:5px;border:1px solid ${color};white-space:nowrap;width:max-content;box-shadow:0 2px 6px rgba(0,0,0,0.5);margin-top:4px;">${school.name}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, -6],
          }),
          interactive: false,
          zIndexOffset: 999,
        }).addTo(map);
        labelRef.current = lbl;
      }
    });

    // ズーム制御
    if (selectedId && zoomedToIdRef.current !== selectedId) {
      const sel = schools.find((s) => s.id === selectedId);
      if (sel?.lat && sel?.lng) {
        const targetZoom = Math.max(map.getZoom(), 14);
        const inBounds = map.getBounds().contains([sel.lat, sel.lng] as [number, number]);
        if (!inBounds) {
          map.setView([sel.lat, sel.lng], targetZoom, { animate: true, duration: 0.4 });
        } else if (map.getZoom() < 14) {
          map.setZoomAround([sel.lat, sel.lng] as [number, number], targetZoom, { animate: true });
        }
        zoomedToIdRef.current = selectedId;
      }
      prevSelectedIdRef.current = selectedId;
    } else if (!selectedId && prevSelectedIdRef.current !== null) {
      zoomedToIdRef.current = null;
      prevSelectedIdRef.current = null;
      map.setView(HIROSHIMA_CENTER, 11, { animate: true, duration: 0.5 });
    }
  }, [schools, selectedId]);

  return <div ref={mapRef} className="w-full h-full" />;
}
