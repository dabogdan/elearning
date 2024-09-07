import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
    const { username } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const wsUrl = `${process.env.REACT_APP_BASE_WS_URL}/ws/chat/${username}/`;
        const chatSocket = new WebSocket(wsUrl);

        chatSocket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        chatSocket.onclose = (e) => {
            console.error('Chat socket closed unexpectedly');
        };

        setSocket(chatSocket);

        return () => {
            chatSocket.close();
        };
    }, [username]);

    const sendMessage = () => {
        if (socket && newMessage.trim()) {
            socket.send(JSON.stringify({
                'message': newMessage,
            }));
            setNewMessage('');
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Chat with {username}</h1>
            <div className="mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-200 rounded">
                        <strong>{msg.username}</strong> [{msg.timestamp}]: {msg.message}
                    </div>
                ))}
            </div>
            <div className="flex space-x-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Type your message here..."
                />
                <button onClick={sendMessage} className="bg-blue-600 text-white py-2 px-4 rounded">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;
