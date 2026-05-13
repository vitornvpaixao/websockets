import { useEffect } from 'react'

import './style/App.css'

function App() {
    useEffect(() => {
        let cleanUp: (() => void) | null = null;

        const connect = () => {
        const socket = new WebSocket('ws://localhost:8080');
    
        const handleOpen = () => {
            console.log('WebSocket connected');
    
            let UUID = sessionStorage.getItem('userId');
    
            if (!UUID) {
                UUID = crypto.randomUUID();
                console.log('criou id');
            } else {
                console.log('já tinha id');
            }
    
            socket.send(JSON.stringify({
                type: 'identify',
                userId: UUID,
            }));
    
            sessionStorage.setItem('userId', UUID);
            console.log(UUID);
        }
    
        const handleClose = () => {
            sessionStorage.removeItem('userId');

            console.log('Socket Closed');
        }

        const handleMessage = (event: MessageEvent) => {
        }

        const handleError = (err: Event) => {
            console.error('WebSocket error: ', err);
        }
    
        socket.addEventListener('open', handleOpen);
        socket.addEventListener('close', handleClose);
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('error', handleError);

        cleanUp = () => {
            socket.removeEventListener('open', handleOpen);
            socket.removeEventListener('close', handleClose);
            socket.removeEventListener('message', handleMessage);
            socket.removeEventListener('error', handleError);
            socket.close();
        }
        }

        connect();

        return () => {
            cleanUp?.();
        }
    }, []);

    return (
        <section>
            <div id="left">
                <p>Socket Status: {socketStatus ? 'Opened' : 'Closed'}</p>
                <p>Connection Status: {isConnected ? 'User connected' : 'User disconnected'}</p>
                <p>User name: {userName || 'Disconnected'}</p>
    
                { !isConnected && <input value={userName} type="text" onChange={(e) => setUserName(e.target.value)}/> }
                { !isConnected && <button onClick={connectUser}>Connect</button> }
    
                { isConnected && <button onClick={disconnectUser}>Disconnect</button> }
            </div>
    
            <div></div>
        </section>
    );
}

export default App
