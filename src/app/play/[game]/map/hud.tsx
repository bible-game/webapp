
import React from 'react';

interface HudProps {
  time: number;
  onTimeChange: (time: number) => void;
  latitude: number;
  onLatitudeChange: (latitude: number) => void;
  fov: number;
  onFovChange: (fov: number) => void;
  toggleLabels: () => void;
  toggleConstellations: () => void;
}

const Hud: React.FC<HudProps> = ({ time, onTimeChange, latitude, onLatitudeChange, fov, onFovChange, toggleLabels, toggleConstellations }) => {
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 1 }}>
      <div>
        <label>Time</label>
        <input type="range" min="0" max="24" value={time} onChange={(e) => onTimeChange(parseFloat(e.target.value))} />
      </div>
      <div>
        <label>Latitude</label>
        <input type="range" min="-90" max="90" value={latitude} onChange={(e) => onLatitudeChange(parseFloat(e.target.value))} />
      </div>
      <div>
        <label>FOV</label>
        <input type="range" min="1" max="175" value={fov} onChange={(e) => onFovChange(parseFloat(e.target.value))} />
      </div>
      <div>
        <button onClick={toggleLabels}>Toggle Labels</button>
      </div>
      <div>
        <button onClick={toggleConstellations}>Toggle Constellations</button>
      </div>
    </div>
  );
};

export default Hud;
