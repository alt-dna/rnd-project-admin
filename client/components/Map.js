import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix the default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// HCMC
const defaultLocation = {
  lat: 10.8231,
  lng: 106.6297
};

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

export default function Map({ onLocationSelect, address }) {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && !mapRef.current) {
        const mapInstance = L.map('map').setView([selectedLocation.lat, selectedLocation.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        const geocoder = L.Control.geocoder().addTo(mapInstance);

        // Hide the search bar
        setTimeout(() => {
          const geocoderContainer = document.querySelector('.leaflet-control-geocoder.leaflet-bar');
          if (geocoderContainer) {
            geocoderContainer.style.display = 'none';
          }
        }, 500);

        geocoder.markGeocode = function (result) {
          const latlng = result.center;
          setSelectedLocation(latlng);
          onLocationSelect({ lat: latlng.lat, lng: latlng.lng, address: result.name });
          if (marker) {
            mapInstance.removeLayer(marker);
          }
          const newMarker = L.marker(latlng).addTo(mapInstance).bindPopup(result.name).openPopup();
          setMarker(newMarker);
          mapInstance.setView(latlng, 13);
        };

        mapRef.current = mapInstance;
        setMap(mapInstance);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (map && address) {
      const geocoder = L.Control.Geocoder.nominatim();
      geocoder.geocode(address, (results) => {
        if (results.length > 0) {
          const latlng = results[0].center;
          setSelectedLocation(latlng);
          onLocationSelect({ lat: latlng.lat, lng: latlng.lng, address });
          if (marker) {
            map.removeLayer(marker);
          }
          const newMarker = L.marker(latlng).addTo(map).bindPopup(address).openPopup();
          setMarker(newMarker);
          map.setView(latlng, 13);
        }
      });
    }
  }, [address, map]);

  useEffect(() => {
    if (map) {
      map.on('click', function(e) {
        const latlng = e.latlng;
        setSelectedLocation(latlng);
        onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
        if (marker) {
          map.removeLayer(marker);
        }
        const newMarker = L.marker(latlng).addTo(map).bindPopup(`Lat: ${latlng.lat}, Lng: ${latlng.lng}`).openPopup();
        setMarker(newMarker);
      });
    }
  }, [map]);

  return (
    <div id="map" style={{ height: '400px', width: '100%' }}></div>
  );
}
