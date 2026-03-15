'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, User } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

interface MessageSectionProps {
  employees: Array<{
    id: number;
    username: string;
    email: string;
    status: string;
  }>;
}

// Mock data
export default function MessageSection({ employees }: MessageSectionProps) {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      name: 'Employee 1',
      lastMessage: 'Hello.',
      timestamp: '2 mins ago',
      unread: 2,
    },
    {
      id: 2,
      name: 'Employee 2',
      lastMessage: 'Can you review the project?',
      timestamp: '1 hour ago',
      unread: 0,
    },
    {
      id: 3,
      name: 'Employee 3',
      lastMessage: 'Thanks for the update!',
      timestamp: '2 hours ago',
      unread: 1,
    },
    {
      id: 4,
      name: 'Employee 4',
      lastMessage: 'Meeting at 3pm today',
      timestamp: '3 hours ago',
      unread: 0,
    },
  ];

  // Mock messages for selected conversation
  const messages: Message[] = [
    {
      id: 1,
      sender: 'Employee 1',
      content: 'Hello.',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Hi! How can I help you today?',
      timestamp: '10:32 AM',
      isOwn: true,
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    // send the message via socket.io later
    // console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const selectedConv = conversations.find(
    (conv) => conv.id === selectedConversation,
  );

  return (
    <div className="flex h-full">
      {/* Left Panel - Conversation List */}
      <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-2">All Message</h2>
          <div className="relative">
            <Search className="w-full pl-10" size={16} />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
              <Search size={16} />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                selectedConversation === conversation.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                  <User
                    size={20}
                    className="text-zinc-600 dark:text-zinc-300"
                  />
                </div>
                {conversation.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conversation.unread}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {conversation.name}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                  {conversation.lastMessage}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  {conversation.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat Window */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                  <User
                    size={20}
                    className="text-zinc-600 dark:text-zinc-300"
                  />
                </div>
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedConv?.name}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Active now
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isOwn && (
                    <div className="w-8 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center mr-3">
                      <User
                        size={16}
                        className="text-zinc-600 dark:text-zinc-300"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp}
                    </div>
                  </div>

                  {message.isOwn && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                      <div className="text-white text-xs font-medium">Y</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Reply message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Select a conversation
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Choose a conversation from the left to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
