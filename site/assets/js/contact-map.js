/* AUTO N°1 — carte d'accès (Leaflet + fond sombre CARTO) */
(function () {
  const el = document.getElementById('contact-map'); if (!el || !window.L) return;
  const lat = parseFloat(el.dataset.lat), lng = parseFloat(el.dataset.lng);
  const narrow = window.innerWidth < 640; // sur mobile, le repère est décalé à gauche pour laisser la place à son étiquette
  const map = L.map(el, { center: [lat + 0.0015, lng + (narrow ? 0.0045 : 0)], zoom: 15, scrollWheelZoom: false, zoomControl: false, attributionControl: true });
  map.attributionControl.setPrefix(false);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  // Fond OpenStreetMap, assombri en CSS pour rester dans la charte (voir .map-live .leaflet-tile-pane)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
  const icon = L.divIcon({ className: 'map-pin', html: '<i class="map-pin__ring"></i><i class="map-pin__ring map-pin__ring--2"></i><b class="map-pin__mark"></b><span class="map-pin__label">AUTO N°1<small>Showroom &amp; atelier</small></span>', iconSize: [0, 0], iconAnchor: [0, 0] });
  L.marker([lat, lng], { icon, keyboard: false }).addTo(map);
  el.addEventListener('click', () => map.scrollWheelZoom.enable(), { once: true });
  map.on('mouseout', () => map.scrollWheelZoom.disable());
})();
