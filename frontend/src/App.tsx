import './style/App.css';
import Rectangle from './components/Rectangle';
import { type movedObject } from './types';
import { useState, useRef, useEffect } from 'react';

interface elementPosition {
  id: string | number;
  isActive: boolean;
  x: number;
  y: number;
}

function App() {
  const [ position, setPosition ] = useState<elementPosition>({id: '', isActive: false, x: 0, y: 0});
  const [ isConnected, setIsConnected ] = useState<boolean>(false);
  const throttleRef = useRef<number | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cleanUp: (() => void) | null = null;

    const connectWithRetry = (attempt = 0) => {
      const maxRetries = 5;
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      const socket = new WebSocket('ws://localhost:8080');
      webSocketRef.current = socket;

      const handleOpen = () => {
        console.log("Connection established. Attempt: ", attempt);
        setIsConnected(true);
      };

      const handleClose = () => {
        setIsConnected(false);
        removeListeners();

        if (attempt < maxRetries) {
          console.log('WebSocket Closed')
          console.log(`Retry Connect WebSocket in ${delay}ms`)
          setTimeout(() => {
            connectWithRetry(attempt + 1);
          }, delay);
        } else {
          console.log('WebSocket Closed - No more attempts')
        }
      }

      const handleMessage = (event: MessageEvent) => {
        const parsedData = JSON.parse(event.data);

        setPosition({id: parsedData.id, isActive: true, x: parsedData.x, y: parsedData.y})
      };

      const handleError = (err: Event) => {
        console.error('WebSocket error: ', err);
        setIsConnected(false);
      };

      const removeListeners = () => {
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('error', handleError);
        socket.removeEventListener('open', handleOpen);
        socket.removeEventListener('close', handleClose);
      }

      socket.addEventListener('open', handleOpen);
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('error', handleError);
      socket.addEventListener('close', handleClose);
      
      cleanUp = () => {
        removeListeners();
        socket.close();
      }
    }

    connectWithRetry();
    
    return () => {
      // At this point, cleanUp its already done and it looks redundant (only unmount component if browser close)
      cleanUp?.();
    };
  }, []);

  const handlePositionChange = (info: movedObject) => {
    setPosition({id: info.id, isActive: true, x: info.x, y: info.y})
    
    if (!throttleRef.current) {
        throttleRef.current = setTimeout(() => {
          if (isConnected && webSocketRef.current?.readyState === WebSocket.OPEN) {
            webSocketRef.current?.send(JSON.stringify(info));
          }
          throttleRef.current = null;
        }, 16)
    }
  }

  return (
    <div>
      <Rectangle id="rect-1" className="green-rectangle" onPositionChange={handlePositionChange} newPosition={position}/>
      <Rectangle id="rect-2" className="red-rectangle" onPositionChange={handlePositionChange} newPosition={position}/>
      <Rectangle id="rect-3" className="blue-rectangle" onPositionChange={handlePositionChange} newPosition={position}/>

      <button
        onClick={() => {
          webSocketRef.current?.close();
        }}
      >
        Simulate socket close
      </button>
    </div>
  );
}

export default App;
