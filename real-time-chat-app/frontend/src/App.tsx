import { useEffect, useRef, useState } from 'react'

import './style/App.css'

function App() {
    let socketRef = useRef<WebSocket | null>(null);
    const [ socketStatus, setSocketStatus ] = useState<boolean>(false);
    const [ isConnected, setIsConnected ] = useState<boolean>(false);
    const [ userName, setUserName ] = useState<string | number>('')

    function connectUser() {
        let UUID = sessionStorage.getItem('userId');
    
        if (!UUID) {
            UUID = crypto.randomUUID();
            console.log('criou id');
        } else {
            console.log('já tinha id');
        }

        socketRef.current?.send(JSON.stringify({
            type: 'connect_user',
            userId: UUID,
            name: userName
        }));

        sessionStorage.setItem('userId', UUID);
        console.log(UUID);

        console.log('Testing sending message!')
    }

    function disconnectUser() {
        let UUID = sessionStorage.getItem('userId');

        socketRef.current?.send(JSON.stringify({
            type: 'disconnect_user',
            userId: UUID,
            name: userName
        }));

        setIsConnected(false);
    }

    useEffect(() => {
        let cleanUp: (() => void) | null = null;

        const connectSocket = () => {
            const socket = new WebSocket('ws://localhost:8080');
            socketRef.current = socket;
        
            const handleOpen = () => {
                console.log('WebSocket connected');
                setSocketStatus(true);
            }
        
            const handleClose = () => {
                sessionStorage.removeItem('userId');
                setIsConnected(false);
                setSocketStatus(false);
                console.log('Socket Closed');
            }

            const handleMessage = (event: MessageEvent) => {
                const { type, users, status } = JSON.parse(event.data);

                if (type === 'connect_user') {
                    setIsConnected(true);

                    return;
                }

                if (type === 'disconnect_user') {
                    setIsConnected(false);

                    return;
                }

                if (type === 'available_users') {
                    console.log('Available Users: ', users)
                }
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

        connectSocket();

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
