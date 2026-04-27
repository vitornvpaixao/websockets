import './style/App.css';
import Rectangle from './components/Rectangle';
import { type movedObject } from './types';
import { useState } from 'react';

function App() {
  // Will set position for rectangle component update postion on ws msg
  const [position, setPosition] = useState({isActive: false, x: 0, y: 0});
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.addEventListener("open", () => {
    console.log("Connection established");
  });

  ws.addEventListener("message", (event) => {
    console.log("Text message:", event.data);
  });

  const handlePositionChange = (info: movedObject) => {
    ws.send(JSON.stringify(info));
  }

  return (
    <div>
      <Rectangle id="rect-1" className="red-rectangle" onPositionChange={handlePositionChange} newPosition={position}/>
    </div>
  );
}

export default App;
