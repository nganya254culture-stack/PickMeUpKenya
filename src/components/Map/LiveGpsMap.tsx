import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useRide } from '../../context/RideContext';
import { Shield, EyeOff, Navigation, Compass, Layers, MapPin } from 'lucide-react';

interface LiveGpsMapProps {
  className?: string;
  focusPoint?: { lat: number; lng: number };
  showAllDrivers?: boolean;
}

export const LiveGpsMap: React.FC<LiveGpsMapProps> = ({
  className = '',
  focusPoint,
  showAllDrivers = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const { activeTrip, allDrivers, isLocationSharingEnabled, gpsTelemetry } = useRide();
  const [mapReady, setMapReady] = useState(false);
  const [mapTheme, setMapTheme] = useState<'voyager' | 'carto_light' | 'osm'>('voyager');

  // Initialize Leaflet Map centered on Nairobi CBD
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Nairobi Central coordinates
    const initialCenter: [number, number] = [-1.2864, 36.8250];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update theme tiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapTheme === 'carto_light') {
      newUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    } else if (mapTheme === 'osm') {
      newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(newUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapTheme]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (activeTrip?.currentPosition) {
      mapInstanceRef.current.flyTo([activeTrip.currentPosition.lat, activeTrip.currentPosition.lng], 15, {
        duration: 0.8
      });
    } else if (focusPoint) {
      mapInstanceRef.current.flyTo([focusPoint.lat, focusPoint.lng], 15, { duration: 0.8 });
    } else {
      mapInstanceRef.current.flyTo([-1.2864, 36.8250], 14, { duration: 0.8 });
    }
  };

  // Synchronize Markers & Polylines
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (activeTrip) {
      const { pickup, dropoff, currentPosition, status, routePolyline } = activeTrip;

      // Pickup Marker
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping"></span>
            <div class="w-6 h-6 bg-emerald-600 border-2 border-white text-white rounded-full flex items-center justify-center shadow-lg font-bold text-[10px]">
              P
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900/95 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-md border border-neutral-700">
              ${pickup.name}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(layer);

      // Dropoff Marker
      const dropoffIcon = L.divIcon({
        className: 'custom-dropoff-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 bg-rose-600 border-2 border-white text-white rounded-full flex items-center justify-center shadow-lg font-bold text-[10px]">
              D
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900/95 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-md border border-neutral-700">
              ${dropoff.name}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(layer);

      // Moving Vehicle Marker (Boda, Matatu, Taxi, etc.)
      if (currentPosition) {
        const vehiclePlate = activeTrip.driver?.vehiclePlate || 'KDM 482B';
        const isBoda = activeTrip.vehicleCategory === 'bodaboda';
        const isMatatu = activeTrip.vehicleCategory === 'matatu';
        const isLorry = activeTrip.vehicleCategory === 'lorry' || activeTrip.vehicleCategory === 'pickup';

        const vehicleBadgeColor = isBoda ? 'bg-amber-600' : isMatatu ? 'bg-purple-600' : isLorry ? 'bg-blue-600' : 'bg-emerald-600';

        const carIcon = L.divIcon({
          className: 'custom-car-marker transition-all duration-700 ease-out',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-10 h-10 ${vehicleBadgeColor} text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-emerald-500/20">
                ${isBoda ? `
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="5.5" cy="17.5" r="3.5"/>
                    <circle cx="18.5" cy="17.5" r="3.5"/>
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l3-3 3 5 2.5-1.5"/>
                  </svg>
                ` : `
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <path d="M9 17h6"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                `}
              </div>
              <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-950 text-amber-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-700 shadow-md">
                ${vehiclePlate}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        L.marker([currentPosition.lat, currentPosition.lng], { icon: carIcon }).addTo(layer);
      }

      if (routePolyline && routePolyline.length > 0) {
        const polyline = L.polyline(routePolyline, {
          color: '#059669', // Emerald green for Kenyan transit / M-Pesa theme
          weight: 5,
          opacity: 0.9,
          dashArray: status === 'driver_arriving' ? '8, 8' : undefined,
          lineJoin: 'round'
        }).addTo(mapInstanceRef.current);

        routePolylineRef.current = polyline;

        mapInstanceRef.current.fitBounds(polyline.getBounds(), {
          padding: [60, 60],
          maxZoom: 15
        });
      }
    } else {
      // Show available Kenyan fleet wandering Nairobi
      if (showAllDrivers) {
        allDrivers
          .filter(d => d.isOnline)
          .forEach(driver => {
            const isBoda = driver.vehicleCategory === 'bodaboda';
            const isMatatu = driver.vehicleCategory === 'matatu';
            const isLorry = driver.vehicleCategory === 'lorry' || driver.vehicleCategory === 'pickup';

            const bgClass = isBoda ? 'bg-amber-600' : isMatatu ? 'bg-purple-700' : isLorry ? 'bg-blue-600' : 'bg-neutral-900';

            const idleCarIcon = L.divIcon({
              className: 'idle-car-marker',
              html: `
                <div class="relative group cursor-pointer">
                  <div class="w-8 h-8 ${bgClass} hover:scale-110 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all">
                    <span class="text-[10px] font-black">${isBoda ? '🏍️' : isMatatu ? '🚐' : isLorry ? '🚛' : '🚕'}</span>
                  </div>
                  <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-neutral-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-neutral-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    ${driver.fullName.split(' ')[0]} • ${driver.vehiclePlate} (${driver.rating}★)
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            L.marker([driver.currentLocation.lat, driver.currentLocation.lng], { icon: idleCarIcon })
              .bindPopup(`
                <div class="text-xs p-1">
                  <strong class="font-bold text-neutral-900">${driver.fullName}</strong><br/>
                  <span class="text-emerald-700 font-semibold">${driver.vehicleMakeModel}</span><br/>
                  <span class="font-mono text-neutral-600">${driver.vehiclePlate} • ${driver.saccoOrFleet || 'PickMeUp'}</span><br/>
                  <span class="text-amber-500 font-bold">${driver.rating} ★</span> (${driver.totalTrips} trips)
                </div>
              `)
              .addTo(layer);
          });
      }
    }
  }, [mapReady, activeTrip, allDrivers, showAllDrivers]);

  return (
    <div id="live-gps-map-container" className={`relative w-full h-full overflow-hidden rounded-xl bg-neutral-100 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

      {/* Privacy Notice */}
      {!isLocationSharingEnabled && (
        <div
          id="location-privacy-banner"
          className="absolute top-4 left-4 right-4 md:right-auto bg-neutral-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-lg shadow-lg border border-neutral-700 flex items-center gap-2.5 z-20"
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold flex items-center gap-1.5">
              <span>Location Masked</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.2 rounded">Privacy Active</span>
            </div>
            <div className="text-[11px] text-neutral-300">
              Only approximate Nairobi sector shown. Real-time GPS coordinates are protected.
            </div>
          </div>
        </div>
      )}

      {/* Map Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          id="btn-recenter-map"
          onClick={handleRecenter}
          title="Recenter Nairobi GPS"
          className="w-10 h-10 bg-white hover:bg-neutral-50 text-neutral-700 rounded-lg shadow-md border border-neutral-200 flex items-center justify-center transition-transform active:scale-95"
        >
          <Navigation className="w-5 h-5 text-emerald-600" />
        </button>

        <button
          id="btn-cycle-map-style"
          onClick={() => {
            setMapTheme(curr => curr === 'voyager' ? 'carto_light' : curr === 'carto_light' ? 'osm' : 'voyager');
          }}
          title="Toggle Map Style"
          className="w-10 h-10 bg-white hover:bg-neutral-50 text-neutral-700 rounded-lg shadow-md border border-neutral-200 flex items-center justify-center transition-transform active:scale-95"
        >
          <Layers className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Active Trip Telemetry Card */}
      {activeTrip && (
        <div
          id="trip-telemetry-badge"
          className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-xl border border-neutral-200 z-20 flex items-center justify-between gap-4 max-w-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                {activeTrip.status === 'driver_arriving' ? 'Driver En Route' : activeTrip.status === 'arrived' ? 'Waiting at Pickup' : 'Safari In Progress'}
              </div>
              <div className="text-sm font-extrabold text-neutral-900">
                {activeTrip.status === 'driver_arriving' ? 'Arriving in ~2-4 mins' : activeTrip.status === 'arrived' ? 'Ready for boarding' : `${activeTrip.distanceKm} km to dropoff`}
              </div>
            </div>
          </div>

          <div className="text-right border-l border-neutral-200 pl-4">
            <div className="text-xs text-neutral-500 font-medium">M-PESA Total</div>
            <div className="text-base font-black text-emerald-700">
              KSh {activeTrip.fare.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Nairobi Live GPS & Geofencing Distance Filter Telemetry */}
      <div className="absolute bottom-4 right-16 z-20 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-[11px] font-medium text-neutral-800 border border-neutral-200 shadow-sm">
        <span
          className={`w-2 h-2 rounded-full ${
            gpsTelemetry.mode === 'in_transit'
              ? 'bg-emerald-500 animate-pulse'
              : gpsTelemetry.mode === 'stationary'
              ? 'bg-amber-500'
              : 'bg-neutral-400'
          }`}
        />
        <span>
          {gpsTelemetry.mode === 'in_transit'
            ? 'Geofence Filter: Moving (>15m active)'
            : gpsTelemetry.mode === 'stationary'
            ? 'Geofence: Stationary Stage (<15m throttled)'
            : 'GPS Offline (0s polling)'}
        </span>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-200">
          {gpsTelemetry.filteredUpdatesCount} updates saved
        </span>
      </div>
    </div>
  );
};
