import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';

interface ApiKeyManagerProps {
  apiKey: string;
  accessToken: string;  // Add accessToken to props
  onRegenerate: (accessToken: string) => Promise<string | undefined>;
  loading: boolean;
}

export default function ApiKeyManager({ 
  apiKey, 
  accessToken, 
  onRegenerate, 
  loading 
}: ApiKeyManagerProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerate = async () => {
    try {
      await onRegenerate(accessToken);  // Pass the accessToken here
      toast.success('API key regenerated successfully');
    } catch (error) {
      toast.error('Failed to regenerate API key');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Emission Lab API Key</Label>
        <div className="flex items-center gap-2">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            readOnly
            className="flex-1 font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyApiKey}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={handleRegenerate}
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Regenerate API Key
      </Button>
    </div>
  );
}