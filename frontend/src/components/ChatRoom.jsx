import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
    const { roomName } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isSocketOpen, setIsSocketOpen] = useState(false); // Track WebSocket state

    useEffect(() => {
        const wsUrl = `${process.env.REACT_APP_BASE_WS_URL}/ws/chat/${roomName}/`;
        console.log(`${process.env.REACT_APP_BASE_WS_URL}`);
    
        const chatSocket = new WebSocket(wsUrl);
    
        chatSocket.onopen = () => {
            console.log('WebSocket connection opened');
            setIsSocketOpen(true);
        };
    
        chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
        };
    
        chatSocket.onclose = (e) => {
            console.error('Chat socket closed unexpectedly');
            setIsSocketOpen(false);
        };
    
        setSocket(chatSocket);
    
        return () => {
            chatSocket.close();
        };
    }, [roomName]);
    

    // const sendMessage = () => {
    //     if (isSocketOpen && socket) {
    //         socket.send(JSON.stringify({
    //             'message': newMessage
    //         }));
    //         setNewMessage('');  // Clear the input field
    //     } else {
    //         console.error('WebSocket is not open. Cannot send message.');
    //     }
    // };

    const sendMessage = () => {
        if (isSocketOpen && socket) {
            if (newMessage.trim() !== '') {  // Ensure the message is not empty
                socket.send(JSON.stringify({
                    'message': newMessage
                }));
                setNewMessage('');  // Clear the input field
            } else {
                console.error('Cannot send an empty message');
            }
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    };
    

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Chat Room: {roomName}</h1>
            <div className="mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-200 rounded">
                        {msg}
                    </div>
                ))}
            </div>
            <div className="flex space-x-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <button onClick={sendMessage} className="bg-blue-600 text-white py-2 px-4 rounded">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;
