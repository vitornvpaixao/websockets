import { useEffect } from 'react'

import './style/App.css'

function App() {
    const [ isConnected, setIsConnected ] = useState<boolean>(false);
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
