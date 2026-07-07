import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapaModal from './MapaModal';

interface Props {
  value: string;
  onChange?: (v: string) => void;
}

export function parseCoords(v?: string | null): { lat: number; lng: number } | null {
  if (!v) return null;
  try {
    const p = JSON.parse(v);
    if (typeof p?.lat === 'number' && typeof p?.lng === 'number') return p;
  } catch { /* noop */ }
  return null;
}

const MINI_PIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30" width="20" height="30">
  <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 20 10 20S20 17.5 20 10C20 4.5 15.5 0 10 0z" fill="#16a34a" stroke="white" stroke-width="2"/>
  <circle cx="10" cy="10" r="4" fill="white"/>
</svg>`;

function MiniMap({ coords }: { coords: { lat: number; lng: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.marker([coords.lat, coords.lng], {
      icon: L.divIcon({ className: '', html: MINI_PIN, iconSize: [20, 30], iconAnchor: [10, 30] }),
    }).addTo(map);
    return () => { map.remove(); };
  }, [coords.lat, coords.lng]);
  // pointer-events none hace que los clicks pasen al wrapper
  return <div ref={ref} className="w-full h-full" style={{ pointerEvents: 'none' }} />;
}

export default function CampoCoordenadasInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const coords = parseCoords(value);

  return (
    <>
      <div onClick={(e) => e.stopPropagation()}>
        {coords ? (
          <div
            className={`rounded-lg overflow-hidden border border-gray-200 ${onChange ? 'cursor-pointer hover:border-brand-400' : ''} transition-colors`}
            onClick={() => onChange && setOpen(true)}
          >
            <div style={{ height: 110, position: 'relative' }}>
              <MiniMap coords={coords} />
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border-t border-gray-100">
              <span className="text-[11px] font-mono text-gray-500">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
              {onChange && (
                <span className="text-[11px] text-brand-600 font-medium">Cambiar ›</span>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => onChange && setOpen(true)}
            disabled={!onChange}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-default"
          >
            <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4" />
            <span className="text-xs font-medium">Seleccionar en el mapa</span>
          </button>
        )}
      </div>
      {onChange && (
        <MapaModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={(c) => onChange(JSON.stringify(c))}
          initialCoords={coords}
        />
      )}
    </>
  );
}
