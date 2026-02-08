import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/state/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Key, ArrowRight, Loader2, Terminal, User, Mail, Lock } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/utils/toast-utils';

export function LoginPage() {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      showErrorToast('Please fill in all fields');
      return;
    }
    
    const success = await login(loginData);
    if (success) {
      showSuccessToast('Login successful! Welcome back to DevOS');
      console.log('Login successful, navigating to dashboard...');
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      showErrorToast('Please fill in all required fields');
      return;
    }
    
    // Validate password length (backend requires 6-100 characters)
    if (registerData.password.length < 6) {
      showErrorToast('Password must be between 6 and 100 characters');
      return;
    }
    
    // Validate username length (backend requires 3-50 characters)
    if (registerData.username.length < 3 || registerData.username.length > 50) {
      showErrorToast('Username must be between 3 and 50 characters');
      return;
    }
    
    const { confirmPassword, ...userData } = registerData;
    const success = await register(userData);
    if (success) {
      showSuccessToast('Account created successfully! Welcome to DevOS');
      console.log('Registration successful, navigating to dashboard...');
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
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

      {/* Auth Form */}
      <div className="panel p-6">
        <div className="panel-header -mx-6 -mt-6 mb-6 rounded-t-lg">
          <div className="flex items-center gap-2 text-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">authenticate</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  className="font-mono bg-input border-border focus:ring-primary"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="font-mono bg-input border-border focus:ring-primary"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full glow-primary group"
                disabled={isLoading || !loginData.username || !loginData.password}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                )}
                {isLoading ? 'Authenticating...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-muted-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                    className="bg-input border-border focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-muted-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                    className="bg-input border-border focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-username" className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="reg-username"
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Choose a username (3-50 characters)"
                  className="font-mono bg-input border-border focus:ring-primary"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Username must be between 3 and 50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="bg-input border-border focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password (min 6 characters)"
                  className="bg-input border-border focus:ring-primary"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be between 6 and 100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  className="bg-input border-border focus:ring-primary"
                  required
                />
                {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full glow-primary group"
                disabled={isLoading || !registerData.username || !registerData.email || !registerData.password || registerData.password !== registerData.confirmPassword}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                )}
                {isLoading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        By connecting, you agree to the DevOS Terms of Service
      </p>
    </div>
  );
}
