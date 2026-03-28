'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Plus,
  ArrowLeft,
  User,
  Search,
} from 'lucide-react';
import { useSocket } from '@/providers/socket-provider';
import { useAuth } from '@/providers/auth-provider';

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageSectionProps {
  employees?: Array<{
    id: number;
    username: string;
    email: string;
    status: string;
  }>;
  admin?: Admin | null;
}

export default function MessageSection({
  employees = [],
  admin = null,
}: MessageSectionProps) {
  const { user, isAdmin } = useAuth();

  const {
    isConnected,
    conversations,
    currentConversation,
    messages,
    joinConversation,
    leaveConversation,
    sendMessage,
    createNewConversation,
  } = useSocket();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.participant?.deletedAt
      ? 'Deleted User'
      : conv.participant?.username
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase() || ''),
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleCreateConversationWithEmployee = () => {
    if (!selectedEmployee) return;

    const employee = employees.find((emp) => emp.username === selectedEmployee);
    if (employee) {
      createNewConversation(employee.id, employee.username);
      setShowNewChatModal(false);
      setSelectedEmployee('');

      // Success will be handled by socket provider when conversation_created event is received
    }
  };

  const handleCreateConversationWithAdmin = () => {
    if (!selectedAdmin) return;

    const userAdmin = admin;
    if (userAdmin) {
      createNewConversation(userAdmin.id, userAdmin.username);
      setShowNewChatModal(false);
      setSelectedAdmin('');
    }
  };

  const handleSelectConversation = (conversationId: number) => {
    joinConversation(conversationId);
  };

  const handleLeaveConversation = () => {
    leaveConversation();
    toast.info('Left conversation');
  };

  return (
    <div className="flex h-full bg-white dark:bg-zinc-900">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </h2>
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Button
            onClick={() => setShowNewChatModal(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-500 dark:text-zinc-400">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-l-2 transition-colors ${
                    currentConversation?.id === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {conversation.participant.username}
                          </p>
                          {conversation.lastMessage && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {formatDate(conversation.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {currentConversation.participant.username}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {isConnected ? 'Connected' : 'Connecting...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveConversation}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Leave
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-zinc-500 dark:text-zinc-400">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-sm">
                    No messages yet. Start conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {message.type === 'system' ? (
                        <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-medium">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.senderName} •{' '}
                            {formatTime(message.createdAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Select a conversation
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Choose a conversation from sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewChatModal &&
        (() => {
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Start New Conversation
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">
                        {isAdmin ? 'Select Employee' : 'Select Admin'}
                      </Label>

                      <select
                        id="user"
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        value={isAdmin ? selectedEmployee : selectedAdmin}
                        onChange={(e) => {
                          if (isAdmin) {
                            setSelectedEmployee(e.target.value);
                          } else {
                            setSelectedAdmin(e.target.value);
                          }
                        }}
                      >
                        <option value="">
                          {isAdmin ? 'Select an employee' : 'Select admin'}
                        </option>

                        {isAdmin &&
                          employees.map((employee) => (
                            <option key={employee.id} value={employee.username}>
                              {employee.username} ({employee.email})
                            </option>
                          ))}

                        {!isAdmin && admin && (
                          <option value={admin.username}>
                            {admin.username} ({admin.email})
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewChatModal(false);
                        setSelectedEmployee('');
                        setSelectedAdmin('');
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={
                        isAdmin
                          ? handleCreateConversationWithEmployee
                          : handleCreateConversationWithAdmin
                      }
                      disabled={isAdmin ? !selectedEmployee : !selectedAdmin}
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
