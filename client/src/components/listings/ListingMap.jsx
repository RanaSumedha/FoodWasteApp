import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ListingCard from './ListingCard';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const urgentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

function isUrgent(expiryAt) {
  return (new Date(expiryAt) - new Date()) < 2 * 3600 * 1000;
}

export default function ListingMap({ listings, onClaim, center = [20.5937, 78.9629] }) {
  return (
    <MapContainer center={center} zoom={12} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map(listing => {
        const [lng, lat] = listing.location.coordinates;
        return (
          <Marker key={listing._id} position={[lat, lng]} icon={isUrgent(listing.expiryAt) ? urgentIcon : new L.Icon.Default()}>
            <Popup maxWidth={300}>
              <ListingCard listing={listing} onClaim={onClaim} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
