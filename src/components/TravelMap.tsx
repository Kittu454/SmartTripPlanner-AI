import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from '@/types/travel';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TravelMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const markerColors: Record<string, string> = {
  attraction: '#e85d4c',
  restaurant: '#22c55e',
  hotel: '#3b82f6',
  transport: '#f59e0b',
};

export function TravelMap({ markers, center, zoom = 12, className = '' }: TravelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Calculate center from markers if not provided
    let mapCenter = center;
    if (!mapCenter && markers.length > 0) {
      const validMarkers = markers.filter(m => m.coordinates?.lat && m.coordinates?.lng);
      if (validMarkers.length > 0) {
        const avgLat = validMarkers.reduce((sum, m) => sum + m.coordinates.lat, 0) / validMarkers.length;
        const avgLng = validMarkers.reduce((sum, m) => sum + m.coordinates.lng, 0) / validMarkers.length;
        mapCenter = { lat: avgLat, lng: avgLng };
      }
    }

    // Default to Delhi if no center
    if (!mapCenter) {
      mapCenter = { lat: 28.6139, lng: 77.2090 };
    }

    const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add markers
    markers.forEach((marker) => {
      if (!marker.coordinates?.lat || !marker.coordinates?.lng) return;

      const color = markerColors[marker.type] || '#e85d4c';
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <div style="
              transform: rotate(45deg);
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
            ">
              ${marker.type === 'attraction' ? '📍' : 
                marker.type === 'restaurant' ? '🍽️' : 
                marker.type === 'hotel' ? '🏨' : '🚌'}
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });

      L.marker([marker.coordinates.lat, marker.coordinates.lng], { icon: customIcon })
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${marker.name}</strong>
            ${marker.description ? `<p style="margin: 8px 0 0; font-size: 12px; color: #666;">${marker.description}</p>` : ''}
          </div>
        `)
        .addTo(map);
    });

    // Fit bounds if multiple markers
    const validMarkers = markers.filter(m => m.coordinates?.lat && m.coordinates?.lng);
    if (validMarkers.length > 1) {
      const bounds = L.latLngBounds(
        validMarkers.map(m => [m.coordinates.lat, m.coordinates.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [markers, center, zoom]);

  return (
    <div 
      ref={mapRef} 
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
