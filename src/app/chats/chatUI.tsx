"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/authcontext';

interface Message {
  _id: string;
  sender: 'user' | 'admin' | 'system';
  content: string;
  timestamp: Date;
  read: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }[];
}

interface Chat {
  _id: string;
  orderId?: string;
  subject?: string;
  isOrderChat: boolean;
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatInterfaceProps {
  apiBaseUrl?: string;
  socketUrl?: string;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiBaseUrl = 'https://galaxy-backend-imkz.onrender.com',
  socketUrl = 'wss://galaxy-backend-imkz.onrender.com',
  className = ''
}) => {
  const { token, user } = useAuth();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [showChatListOnMobile, setShowChatListOnMobile] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Socket connection
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !user?.role) return;

    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      query: { 
        userId: user.id, 
        role: user.role,
        chatId: activeChat?._id,
        orderId: activeChat?.orderId
      }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      socketInstance.emit('authenticate', { 
        userId: user.id, 
        role: user.role,  
        chatId: activeChat?._id,
        orderId: activeChat?.orderId
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setConnectionError('Connection error. Trying to reconnect...');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [socketUrl, user, activeChat]);

  // Fetch chats and messages
  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!token) return;

      const response = await axios.get(`${apiBaseUrl}/chats/v1/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.chats) {
        setChats(response.data.chats);
        if (response.data.chats.length > 0 && !activeChat) {
          setActiveChat(response.data.chats[0]);
          if (isMobile) setShowChatListOnMobile(false);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, token, activeChat, isMobile]);

  const fetchMessages = useCallback(async () => {
    if (!activeChat || !token) return;

    try {
      setIsLoading(true);
      const endpoint = activeChat.isOrderChat && activeChat.orderId 
        ? `${apiBaseUrl}/chats/v1/order/${activeChat.orderId}`
        : `${apiBaseUrl}/chats/v1/${activeChat._id}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.chat?.messages) {
        setMessages(response.data.chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, activeChat, token]);

  useEffect(() => {
    if (user?.id && token) {
      fetchChats();
    }
  }, [user, token, fetchChats]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat, fetchMessages]);

  // Handle socket messages
  useEffect(() => {
    if (!socket || !activeChat) return;

    const handleNewMessage = (message: any) => {
      if ((activeChat.orderId && message.orderId === activeChat.orderId) || 
          (!activeChat.orderId && message.chatId === activeChat._id)) {
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(message.timestamp),
          _id: message._id || `temp-${Date.now()}`
        }]);
      }

      setChats(prev => prev.map(chat => {
        if ((chat.orderId && message.orderId === chat.orderId) || 
            (!chat.orderId && message.chatId === chat._id)) {
          return {
            ...chat,
            lastMessage: {
              ...message,
              timestamp: new Date(message.timestamp)
            }
          };
        }
        return chat;
      }));
    };

    const handleTyping = (data: any) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, activeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message functions
  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !socket || isSending || !activeChat || !token) return;

    try {
      setIsSending(true);
      
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('content', newMessage);
        if (activeChat.orderId) {
          formData.append('orderId', activeChat.orderId);
        } else {
          formData.append('chatId', activeChat._id);
        }
        selectedFiles.forEach(file => formData.append('attachments', file));

        const endpoint = activeChat.orderId 
          ? `${apiBaseUrl}/chats/v1/send-with-attachment` 
          : `${apiBaseUrl}/chats/v1/${activeChat._id}/message`;

        await axios.post(endpoint, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setSelectedFiles([]);
      } else {
        const endpoint = activeChat.orderId 
          ? `${apiBaseUrl}/chats/v1/send`
          : `${apiBaseUrl}/chats/v1/${activeChat._id}/message`;

        const payload = activeChat.orderId 
          ? { orderId: activeChat.orderId, content: newMessage }
          : { content: newMessage };

        await axios.post(endpoint, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const createNewChat = async () => {
    if (!newChatSubject.trim() || !token) return;
  
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiBaseUrl}/chats/v1/create`, {
        subject: newChatSubject,
        message: newMessage.trim() || "New chat started"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.chat) {
        setChats(prev => [response.data.chat, ...prev]);
        setActiveChat(response.data.chat);
        setIsCreatingNewChat(false);
        setNewChatSubject('');
        setNewMessage('');
        if (isMobile) setShowChatListOnMobile(false);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', {
      chatId: activeChat._id,
      orderId: activeChat.orderId,
      isTyping
    });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };


  

  // UI helpers
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    if (isMobile) setShowChatListOnMobile(false);
  };

  const handleBackToChatList = () => setShowChatListOnMobile(true);

  return (
    <div className={`flex h-[calc(100vh-150px)] md:h-[calc(100vh-100px)] rounded-xl shadow-xl bg-white overflow-hidden ${className}`}>
      {/* Chat List Sidebar */}
      {(showChatListOnMobile || !isMobile) && (
        <div className={`${isMobile ? 'w-full' : 'w-full md:w-1/3 lg:w-1/4'} border-r border-gray-200 bg-gray-50 flex flex-col`}>
          <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              <button 
                onClick={() => setIsCreatingNewChat(true)}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {isCreatingNewChat && (
            <div className="p-4 border-b border-gray-200 bg-white">
              <input
                type="text"
                value={newChatSubject}
                onChange={(e) => setNewChatSubject(e.target.value)}
                placeholder="Chat subject..."
                className="w-full border rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Initial message..."
                className="w-full border rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewChat}
                  disabled={!newChatSubject.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    !newChatSubject.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreatingNewChat(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">No chats yet. Start a new conversation!</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                    activeChat?._id === chat._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">
                      {chat.isOrderChat ? `Order #${chat.orderId?.slice(-6)}` : chat.subject || 'General Chat'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage ? formatTime(new Date(chat.lastMessage.timestamp)) : ''}
                    </span>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {chat.lastMessage.sender === 'admin' ? 'Admin: ' : 'You: '}
                      {chat.lastMessage.content || 'Attachment'}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {(!showChatListOnMobile || !isMobile) && (
        <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : ''}`}>
          {activeChat ? (
            <>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center">
                  {isMobile && (
                    <button 
                      onClick={handleBackToChatList}
                      className="mr-2 text-white hover:text-indigo-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeChat.isOrderChat ? `Order #${activeChat.orderId?.slice(-6)}` : activeChat.subject || 'General Chat'}
                    </h2>
                    <div className="flex items-center mt-1">
                      <span className={`h-2 w-2 rounded-full mr-1 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </div>
                {typingUsers.size > 0 && (
                  <div className="text-sm italic mt-1">
                    {Array.from(typingUsers).join(', ')} is typing...
                  </div>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.sender === user?.role;
                    const showDate = index === 0 || 
                      new Date(msg.timestamp).toDateString() !== 
                      new Date(messages[index - 1].timestamp).toDateString();

                    return (
                      <div key={msg._id || index} className="mb-4">
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {formatDate(new Date(msg.timestamp))}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none shadow-md' 
                              : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                          }`}>
                            <p className="break-words">{msg.content}</p>
                            {msg.attachments?.map((attachment, idx) => (
                              <div key={idx} className="mt-2 p-2 bg-white bg-opacity-20 rounded">
                                <a 
                                  href={`${apiBaseUrl}/chats/v1/${activeChat._id}/messages/${msg._id}/attachments/${idx}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm flex items-center hover:underline"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  {attachment.filename} ({Math.round(attachment.size / 1024)} KB)
                                </a>
                              </div>
                            ))}
                            <div className="text-xs opacity-70 flex justify-end items-center mt-1">
                              {formatTime(new Date(msg.timestamp))}
                              {isCurrentUser && (
                                <span className="ml-1">
                                  {msg.read ? (
                                    <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.707 14.707a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 12.586l7.293-7.293a1 1 0 011.414 1.414l-8 8z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.707 14.707a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 12.586l7.293-7.293a1 1 0 011.414 1.414l-8 8z" />
                                    </svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

            
              <div className={`p-4 border-t bg-white sticky bottom-0 transition-all duration-300 ${isInputFocused ? 'shadow-lg' : ''}`}>
                {selectedFiles.length > 0 && (
                  <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-indigo-700">Attachments ({selectedFiles.length})</span>
                      <button 
                        onClick={() => setSelectedFiles([])}
                        className="text-indigo-500 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-xs bg-white p-2 rounded-lg border border-indigo-100 flex items-center shadow-sm">
                          <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate max-w-[120px] md:max-w-[180px]">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button 
                    className="text-gray-500 hover:text-indigo-600 p-2 transition-colors rounded-full hover:bg-indigo-50"
                    onClick={() => {}}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))}
                    multiple
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-indigo-600 p-2 transition-colors rounded-full hover:bg-indigo-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  
                  <div className={`flex-1 relative transition-all duration-300 ${isInputFocused ? 'ring-2 ring-indigo-300' : ''}`}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Type your message..."
                      className="w-full border rounded-full px-4 py-3 focus:outline-none transition-all pl-4 pr-12"
                      disabled={!isConnected || isSending}
                    />
                    {/* {newMessage.trim() && (
                      <button
                        onClick={() => setNewMessage('')}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )} */}
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || !isConnected || isSending}
                    className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      (!newMessage.trim() && selectedFiles.length === 0) || !isConnected || isSending
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100">
              <div className="text-center max-w-md">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No chat selected</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a chat from the sidebar or create a new one to start messaging.
                </p>
                <button
                  onClick={() => setIsCreatingNewChat(true)}
                  className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-colors shadow-md"
                >
                  New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;