import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/state/ai.store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Cpu, 
  User, 
  Loader2, 
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIMessage } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface AICommandPanelProps {
  projectId: string;
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';

  return (
    <div className={cn(
      'flex gap-3 animate-fade-in',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-secondary' : 'glow-ai'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Cpu className="w-4 h-4 text-primary-foreground" />
        )}
      </div>
      
      <div className={cn(
        'flex-1 max-w-[80%]',
        isUser ? 'text-right' : 'text-left'
      )}>
        <div className={cn(
          'inline-block p-3 rounded-lg text-sm',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-card border border-border'
        )}>
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-typing" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function AICommandPanel({ projectId }: AICommandPanelProps) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isStreaming } = useAIStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    sendMessage(projectId, input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">AI Command Center</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl glow-ai flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Ready to assist
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Describe the changes you want to make to your codebase. 
              I'll analyze, plan, and help you apply them safely.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-sm">
              {[
                'Refactor the authentication module',
                'Add error handling to API calls',
                'Create unit tests for components',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the changes you want to make..."
            className="min-h-[80px] pr-24 bg-card border-border resize-none"
            disabled={isStreaming}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex text-muted-foreground">
              <span className="text-xs">⌘</span>↵
            </kbd>
            <Button 
              type="submit" 
              size="sm" 
              disabled={!input.trim() || isStreaming}
              className="glow-primary"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
