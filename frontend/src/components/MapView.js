import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapView({ lat, lon, locationName }) {
  // Set a default position in case coordinates are not available
  const position = [lat || 9.005401, lon || 38.763611]; // Default to Addis Ababa

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Last seen near {locationName || 'this area'}.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapView;