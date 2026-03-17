import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { UserProfile, Message } from '@/types';
import { quickReplies } from '@/data';
import { useHaptics } from '@/hooks/useHaptics';

interface ChatScreenProps {
  profile: UserProfile;
}

export function ChatScreen({ profile }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lightTap, mediumTap, error: errorHaptic } = useHaptics();

  // Load messages from database
  useEffect(() => {
    loadMessages();
  }, []);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMessage = payload.new;
        if (userId && newMessage.user_id === userId) {
          setMessages(prev => [...prev, {
            id: newMessage.id,
            text: newMessage.message,
            sender: newMessage.sender,
            timestamp: new Date(newMessage.created_at).toISOString(),
          }]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadMessages = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.id) {
        setUserId(userData.user.id);

        // Load messages directly from Supabase
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (!error && messages) {
          const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.sender as 'user' | 'ai',
            timestamp: new Date(msg.created_at).toISOString(),
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessages: Record<UserProfile, string> = {
        military: 'Привіт, побратиме. Я тут, щоб допомогти. Що відбувається?',
        elderly: 'Добрий день. Я радий, що ви тут. Чим можу допомогти?',
        children: 'Привіт, маленький друже! Я твій помічник. Що тебе турбує?',
        teenager: 'Йо. Я тут, якщо тобі потрібно поговорити.',
        civilian: 'Привіт. Я готовий послухати. Що у тебе на думці?',
      };

      setMessages([
        {
          id: 'welcome',
          text: welcomeMessages[profile],
          sender: 'ai',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [profile, messages.length, setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAPI = async (message: string, history: Message[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call Supabase Edge Function for Gemini chat
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: {
          message,
          profile,
          history: history.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            content: msg.text,
          })),
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.response || 'Вибачте, не отримав відповідь.';
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!isOnline) {
      setError('Немає з\'єднання з інтернетом. Перевірте підключення.');
      errorHaptic();
      return;
    }

    mediumTap();
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await sendMessageToAPI(userMessage.text, updatedMessages);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setError('Не вдалося отримати відповідь. Спробуй ще раз.');
      errorHaptic();
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    mediumTap();
    setInputText(reply);
    setError(null);
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const replies = quickReplies[profile] || quickReplies.civilian;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 bg-df2b-bg-secondary/80 backdrop-blur-lg border-b border-df2b-accent/10 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-df2b-accent/20 flex items-center justify-center">
            <Sparkles size={20} className="text-df2b-accent" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-df2b-text">AI-Психолог</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-df2b-success animate-pulse' : 'bg-df2b-error'}`} />
              <span className="text-xs text-df2b-text-secondary">
                {isOnline ? 'Онлайн' : 'Офлайн'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-df2b-error/10 border border-df2b-error/30 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle size={18} className="text-df2b-error shrink-0" />
          <p className="text-sm text-df2b-text-secondary">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-df2b-text-muted hover:text-df2b-text"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-df2b-accent text-df2b-bg-primary rounded-br-md'
                  : 'bg-df2b-bg-card text-df2b-text rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  message.sender === 'user'
                    ? 'text-df2b-bg-primary/70'
                    : 'text-df2b-text-muted'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-df2b-bg-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-df2b-accent typing-dot" />
                <span className="w-2 h-2 rounded-full bg-df2b-accent typing-dot" />
                <span className="w-2 h-2 rounded-full bg-df2b-accent typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-6 py-2 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {replies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-df2b-bg-card text-df2b-text-secondary text-xs hover:bg-df2b-accent/20 hover:text-df2b-accent transition-colors whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-df2b-bg-secondary/80 backdrop-blur-lg border-t border-df2b-accent/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => lightTap()}
            className="w-10 h-10 rounded-full bg-df2b-bg-card flex items-center justify-center hover:bg-df2b-accent/20 transition-colors"
            aria-label="Голосове повідомлення"
          >
            <Mic size={18} className="text-df2b-accent" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOnline ? 'Напишіть повідомлення...' : 'Немає з\'єднання...'}
            disabled={!isOnline || isTyping}
            className="flex-1 df2b-input text-sm disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || !isOnline || isTyping}
            className="w-10 h-10 rounded-full bg-df2b-accent flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            aria-label="Відправити"
          >
            <Send size={18} className="text-df2b-bg-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
