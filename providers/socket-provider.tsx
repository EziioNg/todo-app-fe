'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { API_ROOT } from '@/utils/constants';

interface Message {
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

interface NewMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: 'text' | 'system';
}

interface Participant {
  id: number;
  username: string;
  email: string;
}

interface LastMessage {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
  type: string;
}

interface Conversation {
  id: number;
  participant: Participant; // Single participant object
  createdAt: string;
  updatedAt: string;
  lastMessage?: LastMessage;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: NewMessage[];
  joinConversation: (conversationId: number) => void;
  leaveConversation: () => void;
  sendMessage: (content: string) => void;
  createNewConversation: (employeeId: number, employeeName: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<NewMessage[]>([]);
  const { user } = useAuth();
  const conversationsRef = useRef(conversations);

  // Update ref when conversations change
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // API Functions
  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/chat/conversations');
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await axiosInstance.get(
        `/chat/messages/${conversationId}`,
      );
      setMessages(response.data.data || []);
      console.log('message after fetching: ', messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const socketRef = useRef<Socket | null>(null);
  const joinConversation = (conversationId: number) => {
    console.log('socketRef id from joinConversation:', socketRef.current?.id);

    const s = socketRef.current;
    if (!s) return;
    console.log('socketRef current from joinConversation:', s);

    console.log('Joining conversation:', conversationId);

    s.emit('join_conversation', { conversationId });

    fetchMessages(conversationId);

    const conversation = conversationsRef.current.find(
      (conv) => conv.id === conversationId,
    );

    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const leaveConversation = useCallback(() => {
    if (!socket) return;

    if (currentConversation) {
      console.log('Leaving conversation:', currentConversation.id);
      socket.emit('leave_conversation', {
        conversationId: currentConversation.id,
      });
    }

    setCurrentConversation(null);
    setMessages([]);
  }, [socket, currentConversation]);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const newSocket = io(API_ROOT, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socketRef.current = newSocket;
      setSocket(newSocket);
      console.log('newSocket: ', newSocket);

      // Fetch conversations when socket connects
      fetchConversations();
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setSocket(null);
    });

    newSocket.on('conversations_list', (data: Conversation[]) => {
      console.log('Received conversations:', data);
      setConversations(data);
    });

    newSocket.on('conversation_messages', (data: NewMessage[]) => {
      console.log('Received messages:', data);
      setMessages(data);
    });

    newSocket.on('new_message', (message: NewMessage) => {
      console.log('New message received:', message);
      setMessages((prev) => [...prev, message]);

      // Update conversation list with new message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  createdAt: message.createdAt,
                  type: message.type,
                },
                updatedAt: message.updatedAt,
              }
            : conv,
        ),
      );
    });

    newSocket.on('new_conversation', (conversation: Conversation) => {
      console.log('New conversation:', conversation);
      setConversations((prev) => [conversation, ...prev]);
    });

    newSocket.on('conversation_created', (response: { id: number }) => {
      console.log('Conversation created response:', response);

      fetchConversations();

      newSocket.emit('join_conversation', { conversationId: response.id });

      fetchMessages(response.id);

      toast.success('Conversation created successfully');
    });

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = (content: string) => {
    if (!socket || !currentConversation || !user) return;

    const message: Message = {
      conversationId: currentConversation.id,
      senderId: user.id,
      senderName: user.username || 'Unknown',
      content,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    console.log('Sending message:', message);
    socket.emit('send_message', message);
  };

  const createNewConversation = (employeeId: number, employeeName: string) => {
    if (!socket) return;

    console.log('Creating new conversation with:', employeeName);
    socket.emit('create_conversation', {
      employeeId,
      employeeName,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        conversations,
        currentConversation,
        messages,
        joinConversation,
        leaveConversation,
        sendMessage,
        createNewConversation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used inside SocketProvider');
  }
  return ctx;
};
