import { useEffect, useState } from 'react';
import { devosApi } from '@/api/devos.api';
import { Settings, LLMProvider } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Bot,
  Shield,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader2,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

const llmProviders: { id: LLMProvider; name: string; description: string }[] = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 3, Claude 2' },
  { id: 'local', name: 'Local Model', description: 'Self-hosted LLM' },
];

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await devosApi.getSettings();
      if (response.data) {
        setSettings(response.data);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    await devosApi.updateSettings(settings);
    setIsSaving(false);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tokenPercentage = (settings.tokenUsage.used / settings.tokenUsage.limit) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your DevOS preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="glow-primary w-full md:w-auto">
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* LLM Provider */}
        <Card className="panel">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle>LLM Provider</CardTitle>
            </div>
            <CardDescription>
              Select your preferred language model provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {llmProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSettings({ ...settings, llmProvider: provider.id })}
                  className={cn(
                    'p-4 rounded-lg border text-left transition-all',
                    settings.llmProvider === provider.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="font-medium text-foreground">{provider.name}</div>
                  <div className="text-sm text-muted-foreground">{provider.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Usage */}
        <Card className="panel">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <CardTitle>Token Usage</CardTitle>
            </div>
            <CardDescription>
              Monitor your API token consumption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {settings.tokenUsage.used.toLocaleString()} / {settings.tokenUsage.limit.toLocaleString()} tokens
              </span>
              <span className="text-foreground font-medium">
                {tokenPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={tokenPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Resets on the 1st of each month
            </p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="panel">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Privacy & Context</CardTitle>
            </div>
            <CardDescription>
              Control how your code is processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Send Code Context</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to access your codebase for better suggestions
                </p>
              </div>
              <Switch
                checked={settings.privacy.sendCodeContext}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, sendCodeContext: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Anonymize Data</Label>
                <p className="text-sm text-muted-foreground">
                  Strip sensitive information before processing
                </p>
              </div>
              <Switch
                checked={settings.privacy.anonymizeData}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, anonymizeData: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* IDE Connection */}
        <Card className="panel">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <CardTitle>IDE Connection</CardTitle>
            </div>
            <CardDescription>
              Status of your IDE integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                {settings.ideConnection.status === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {settings.ideConnection.ideName || 'No IDE Connected'}
                  </p>
                  {settings.ideConnection.version && (
                    <p className="text-sm text-muted-foreground">
                      Version {settings.ideConnection.version}
                    </p>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  settings.ideConnection.status === 'connected'
                    ? 'text-success border-success/30'
                    : 'text-destructive border-destructive/30'
                )}
              >
                {settings.ideConnection.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
