import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/state/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cpu, Key, ArrowRight, Loader2, Terminal } from 'lucide-react';

export function LoginPage() {
  const [token, setToken] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(token);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl glow-ai flex items-center justify-center mb-4 animate-pulse-glow">
          <Cpu className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-gradient-ai">DevOS</h1>
        <p className="text-muted-foreground mt-2">AI-Powered Developer Operating System</p>
      </div>

      {/* Login Form */}
      <div className="panel p-6">
        <div className="panel-header -mx-6 -mt-6 mb-6 rounded-t-lg">
          <div className="flex items-center gap-2 text-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">authenticate</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />
              Workspace Token
            </label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="devos_xxxxxxxxxxxxxxxxxx"
              className="font-mono bg-input border-border focus:ring-primary"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter your API key or workspace token to access DevOS
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full glow-primary group"
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
            )}
            {isLoading ? 'Authenticating...' : 'Access DevOS'}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        By connecting, you agree to the DevOS Terms of Service
      </p>
    </div>
  );
}
