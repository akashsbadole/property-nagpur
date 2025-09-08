import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Video, MoreVertical, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document';
  attachment_url?: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  recipientInfo: {
    id: string;
    name: string;
    avatar_url?: string;
    phone?: string;
    last_seen?: string;
    is_online?: boolean;
  };
  onSendMessage: (content: string, type?: 'text' | 'image' | 'document') => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  loading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserId,
  recipientInfo,
  onSendMessage,
  onCall,
  onVideoCall,
  loading = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={recipientInfo.avatar_url} />
                <AvatarFallback>
                  {recipientInfo.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {recipientInfo.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-lg">{recipientInfo.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {recipientInfo.is_online ? (
                  <span className="text-green-500">Online</span>
                ) : recipientInfo.last_seen ? (
                  `Last seen ${getMessageTime(recipientInfo.last_seen)}`
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {recipientInfo.phone && (
              <Button variant="ghost" size="sm" onClick={onCall}>
                <Phone className="h-4 w-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={onVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <Badge variant="secondary" className="text-xs">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Badge>
                </div>

                {/* Messages for this date */}
                {dayMessages.map((message, index) => {
                  const isOwnMessage = message.sender_id === currentUserId;
                  const showAvatar = !isOwnMessage && (
                    index === 0 || 
                    dayMessages[index - 1]?.sender_id !== message.sender_id
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                        {!isOwnMessage && (
                          <Avatar className={`w-8 h-8 ${showAvatar ? 'visible' : 'invisible'}`}>
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {message.sender?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`rounded-lg px-3 py-2 max-w-full ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {message.message_type === 'text' ? (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm">
                                {message.message_type === 'image' ? 'Image' : 'Document'}
                              </span>
                            </div>
                          )}
                          
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                          }`}>
                            <span>{getMessageTime(message.created_at)}</span>
                            {isOwnMessage && (
                              <span className="ml-2">
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={recipientInfo.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {recipientInfo.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Button type="button" variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={loading}
          />
          
          <Button type="submit" disabled={!newMessage.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};