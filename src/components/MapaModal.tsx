import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

const PERU: L.LatLngLiteral = { lat: -9.19, lng: -75.01 };

function makePinIcon(size = 24) {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size}" height="${size * 1.5}">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z" fill="#16a34a" stroke="white" stroke-width="2.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5],
  });
}

export default function MapaModal({ isOpen, onClose, onConfirm, initialCoords }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setPending(initialCoords ?? null);
  }, [initialCoords]);

  useEffect(() => {
    if (!isOpen || !divRef.current) return;
    const center: L.LatLngExpression = initialCoords
      ? [initialCoords.lat, initialCoords.lng]
      : [PERU.lat, PERU.lng];
    const zoom = initialCoords ? 13 : 6;
    const map = L.map(divRef.current, { center, zoom });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    const icon = makePinIcon();
    if (initialCoords) {
      markerRef.current = L.marker([initialCoords.lat, initialCoords.lng], { icon }).addTo(map);
    }
    map.on('click', (e) => {
      const c = { lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) };
      setPending(c);
      if (markerRef.current) {
        markerRef.current.setLatLng([c.lat, c.lng]);
      } else {
        markerRef.current = L.marker([c.lat, c.lng], { icon }).addTo(map);
      }
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col w-full max-w-4xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-brand-600" />
            <div>
              <p className="font-bold text-heading text-sm">Seleccionar ubicación</p>
              <p className="text-xs text-muted">Haz clic en cualquier punto del mapa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pending && (
              <code className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                {pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}
              </code>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div ref={divRef} className="flex-1" style={{ height: '58vh', minHeight: 380 }} />

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-muted">
            {pending
              ? `${pending.lat.toFixed(5)}° lat, ${pending.lng.toFixed(5)}° lng`
              : 'Ningún punto seleccionado'}
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => { if (pending) { onConfirm(pending); onClose(); } }}
              disabled={!pending}
              className="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Usar esta ubicación
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
