import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon path issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  address: string;
  position: [number, number]; // [latitude, longitude]
  interactive: boolean; // Thêm thuộc tính interactive để kiểm soát tương tác
}

const MapComponent: React.FC<MapComponentProps> = ({
  address,
  position,
  interactive,
}) => {
  const UpdateInteractive = () => {
    const map = useMap();
    map.dragging[interactive ? "enable" : "disable"]();
    map.scrollWheelZoom[interactive ? "enable" : "disable"]();
    map.doubleClickZoom[interactive ? "enable" : "disable"]();
    map.touchZoom[interactive ? "enable" : "disable"]();
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ width: "100%", height: 400 }}
      dragging={interactive} // Khởi tạo tương tác theo giá trị của interactive
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>{address}</Popup>
      </Marker>
      <UpdateInteractive />
    </MapContainer>
  );
};

export default MapComponent;
