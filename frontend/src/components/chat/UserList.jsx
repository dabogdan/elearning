import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const UserList = () => {
    const [users, setUsers] = useState([]); 
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/`, {
                    params: {
                        search: searchQuery,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                setUsers(response.data.results || []); 
            } catch (error) {
                console.error('Failed to fetch users', error);
                setUsers([]); 
            }
        };

        fetchUsers();
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        if (!messages[user.user.username]) {
            setMessages(prevMessages => ({ ...prevMessages, [user.user.username]: [] }));  // Initialize if not already set
        }
    };

    useEffect(() => {
        if (!selectedUser) return;

        // WS connection
        const wsUrl = `${process.env.REACT_APP_BASE_WS_URL}/ws/chat/${selectedUser.user.username}/?token=${localStorage.getItem('access_token')}`;
        console.log(wsUrl);
        const chatSocket = new WebSocket(wsUrl);

        chatSocket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages(prevMessages => ({
                ...prevMessages,
                [selectedUser.user.username]: [...(prevMessages[selectedUser.user.username] || []), data]
            }));
        };

        chatSocket.onclose = (e) => {
            console.error('Chat socket closed unexpectedly');
        };

        setSocket(chatSocket);

        // Clean up WebSocket connection on component unmount or when selectedUser changes
        return () => {
            chatSocket.close();
            setSocket(null); // Reset socket state
        };
    }, [selectedUser]);

    const sendMessage = () => {
        if (socket && newMessage.trim() !== '') {
            socket.send(JSON.stringify({
                'message': newMessage,
            }));
            setNewMessage('');  // Clear the input field
        } else {
            console.error('WebSocket is not open or message is empty. Cannot send message.');
        }
    };

    useEffect(() => {
        // Scroll to the latest message when a new message is added
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Start a Chat</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search users"
                        className="p-2 border rounded w-full text-black mb-2"
                    />
                </div>
                <ul className="space-y-2">
                    {users && users.length > 0 ? (
                        users.map(user => (
                            <li 
                                key={user.user.username+user.user.id}
                                className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                                onClick={() => handleUserClick(user)}
                            >
                                <div className="flex items-center">
                                    <img src={user.profile_photo} alt="Profile" className="inline-block mr-2 rounded-full h-8 w-8" />
                                    <div>
                                        <p className="font-bold">{user.user.username}</p>
                                        <p className="text-sm text-gray-400">{user.role}</p>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-center text-gray-400">No users found.</p>
                    )}
                </ul>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col p-4">
                {selectedUser ? (
                    <div className="flex flex-col h-full">
                        <h1 className="text-2xl font-bold mb-4">Chat with {selectedUser.user.username}</h1>
                        <div className="flex-1 overflow-y-auto mb-4">
                            {(messages[selectedUser.user.username] || []).map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`mb-2 p-2 rounded max-w-md ${
                                        msg.username === selectedUser.user.username 
                                        ? 'bg-gray-300 text-black self-end' 
                                        : 'bg-blue-500 text-white self-start'
                                    }`}
                                >
                                    <div className="text-sm">
                                        {msg.message}
                                    </div>
                                    <div className="text-xs text-right text-white mt-1">
                                        {msg.timestamp}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex space-x-4 items-end">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="w-full p-2 border rounded resize-none"
                                rows={3}
                                placeholder="Type your message here..."
                            />
                            <button onClick={sendMessage} className="bg-blue-600 text-white py-2 px-4 rounded">
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold">Select a user to start chatting</h1>
                )}
            </div>
        </div>
    );
};

export default UserList;


// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

// const UserList = () => {
//     const [users, setUsers] = useState([]); 
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [messages, setMessages] = useState({});
//     const [newMessage, setNewMessage] = useState('');
//     const [socket, setSocket] = useState(null);

//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/`, {
//                     params: {
//                         search: searchQuery,
//                     },
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('access_token')}`
//                     }
//                 });
//                 setUsers(response.data.results || []); 
//             } catch (error) {
//                 console.error('Failed to fetch users', error);
//                 setUsers([]); 
//             }
//         };

//         fetchUsers();
//     }, [searchQuery]);

//     const handleSearchChange = (e) => {
//         setSearchQuery(e.target.value);
//     };

//     const handleUserClick = (user) => {
//         setSelectedUser(user);
//         if (!messages[user.user.username]) {
//             setMessages(prevMessages => ({ ...prevMessages, [user.user.username]: [] }));  // Initialize if not already set
//         }
//     };

//     useEffect(() => {
//         if (!selectedUser) return;

//         // WS connection
//         const wsUrl = `ws://localhost:8000/ws/chat/${selectedUser.user.username}/?token=${localStorage.getItem('access_token')}`;
//         const chatSocket = new WebSocket(wsUrl);

//         chatSocket.onopen = () => {
//             console.log('WebSocket connection opened');
//         };

//         chatSocket.onmessage = (e) => {
//             const data = JSON.parse(e.data);
//             setMessages(prevMessages => ({
//                 ...prevMessages,
//                 [selectedUser.user.username]: [...(prevMessages[selectedUser.user.username] || []), data]
//             }));
//         };

//         chatSocket.onclose = (e) => {
//             console.log(e);
//             console.error('Chat socket closed unexpectedly');
//         };

//         setSocket(chatSocket);

//         // Clean up WebSocket connection on component unmount or when selectedUser changes
//         return () => {
//             chatSocket.close();
//             setSocket(null); // Reset socket state
//         };
//     }, [selectedUser]);

//     const sendMessage = () => {
//         if (socket && newMessage.trim() !== '') {
//             socket.send(JSON.stringify({
//                 'message': newMessage,
//             }));
//             setNewMessage('');  // Clear the input field
//         } else {
//             console.error('WebSocket is not open or message is empty. Cannot send message.');
//         }
//     };

//     useEffect(() => {
//         // Scroll to the latest message when a new message is added
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     return (
//         <div className="flex h-screen">
//             {/* Sidebar */}
//             <div className="w-1/4 bg-gray-800 text-white p-4">
//                 <h2 className="text-xl font-bold mb-4">Start a Chat</h2>
//                 <div className="mb-4">
//                     <input
//                         type="text"
//                         value={searchQuery}
//                         onChange={handleSearchChange}
//                         placeholder="Search users"
//                         className="p-2 border rounded w-full text-black mb-2"
//                     />
//                 </div>
//                 <ul className="space-y-2">
//                     {users && users.length > 0 ? (
//                         users.map(user => (
//                             <li 
//                                 key={user.user.username+user.user.id}  // Ensure this key is unique for each user
//                                 className="p-2 hover:bg-gray-700 rounded cursor-pointer"
//                                 onClick={() => handleUserClick(user)}
//                             >
//                                 <div className="flex items-center">
//                                     <img src={user.profile_photo} alt="Profile" className="inline-block mr-2 rounded-full h-8 w-8" />
//                                     <div>
//                                         <p className="font-bold">{user.user.username}</p>
//                                         <p className="text-sm text-gray-400">{user.role}</p>
//                                     </div>
//                                 </div>
//                             </li>
//                         ))
//                     ) : (
//                         <p className="text-center text-gray-400">No users found.</p>
//                     )}
//                 </ul>
//             </div>

//             {/* Main Chat Area */}
//             <div className="flex-1 flex flex-col p-4">
//                 {selectedUser ? (
//                     <div className="flex flex-col h-full">
//                         <h1 className="text-2xl font-bold mb-4">Chat with {selectedUser.user.username}</h1>
//                         <div className="flex-1 overflow-y-auto mb-4">
//                             {(messages[selectedUser.user.username] || []).map((msg, index) => (
//                                 <div 
//                                     key={index} 
//                                     className={`mb-2 p-2 rounded max-w-md ${
//                                         msg.username === selectedUser.user.username 
//                                         ? 'bg-gray-300 text-black self-end' 
//                                         : 'bg-blue-500 text-white self-start'
//                                     }`}
//                                 >
//                                     <div className="text-sm">
//                                         {msg.message}
//                                     </div>
//                                     <div className="text-xs text-right text-white mt-1">
//                                         {msg.timestamp}
//                                     </div>
//                                 </div>
//                             ))}
//                             <div ref={messagesEndRef} />
//                         </div>
//                         <div className="flex space-x-4 items-end">
//                             <textarea
//                                 value={newMessage}
//                                 onChange={(e) => setNewMessage(e.target.value)}
//                                 className="w-full p-2 border rounded resize-none"
//                                 rows={3}
//                                 placeholder="Type your message here..."
//                             />
//                             <button onClick={sendMessage} className="bg-blue-600 text-white py-2 px-4 rounded">
//                                 Send
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <h1 className="text-2xl font-bold">Select a user to start chatting</h1>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserList;
