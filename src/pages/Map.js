import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const FarmMap = () => {
  const [position, setPosition] = useState(null);
  const [landData, setLandData] = useState({
    certificate: null,
    certificateName: '',
    area: '',
    cropType: '',
    description: ''
  });
  const [lands, setLands] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLandData({
        ...landData,
        certificate: file,
        certificateName: file.name
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLandData({ ...landData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!position || !landData.certificate) return;

    const newLand = {
      id: Date.now(),
      position,
      ...landData,
      date: new Date().toLocaleString()
    };

    setLands([...lands, newLand]);
    setPosition(null);
    setLandData({
      certificate: null,
      certificateName: '',
      area: '',
      cropType: '',
      description: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? (
      <Marker position={position}>
        <Popup>Your selected location</Popup>
      </Marker>
    ) : null;
  };

  return (
    <div className="farm-map-container">
      
      <div className="map-content">
        <h1>Interactive Farm Land Map</h1>
        <p className="user-status">Connected Farmer</p>

        <div className="map-section">
          <div className="map-wrapper">
            <MapContainer
              center={[34, 9]}
              zoom={6}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
              {lands.map(land => (
                <Marker key={land.id} position={land.position}>
                  <Popup>
                    <div>
                      <h3>Farm Land</h3>
                      <p>Area: {land.area}</p>
                      <p>Crop: {land.cropType}</p>
                      <p>Registered: {land.date}</p>
                      {land.certificateName && (
                        <p>Certificate: {land.certificateName}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="land-form">
            <h2>Register Your Land</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Click on the map to select your land location</label>
                {position && (
                  <p className="coordinates">
                    Selected: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Land Certificate (PDF/Image)</label>
                <div className="file-upload">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    required
                  />
                  <span>{landData.certificateName || 'No file chosen'}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Area (acres)</label>
                <input
                  type="number"
                  name="area"
                  value={landData.area}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Crop Type</label>
                <select
                  name="cropType"
                  value={landData.cropType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Corn">Corn</option>
                  <option value="Soybeans">Soybeans</option>
                  <option value="Rice">Rice</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={landData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-btn">
                Register Land
              </button>
            </form>
          </div>
        </div>

        <div className="registered-lands">
          <h2>Your Registered Lands</h2>
          {lands.length === 0 ? (
            <p className="no-lands">No lands registered yet</p>
          ) : (
            <div className="lands-list">
              {lands.map(land => (
                <div key={land.id} className="land-card">
                  <h3>
                    {land.area} acres of {land.cropType || 'crops'}
                  </h3>
                  <p>
                    Location: {land.position.lat.toFixed(4)}, {land.position.lng.toFixed(4)}
                  </p>
                  <p>Registered: {land.date}</p>
                  {land.certificateName && (
                    <p className="certificate">Certificate: {land.certificateName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FarmMap;