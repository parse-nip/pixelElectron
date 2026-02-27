import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { AppSettings } from '@/types'
import { AVAILABLE_MODELS } from '@/lib/openrouter'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenRouter API key and AI model.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenRouter API Key</label>
            <Input
              type="password"
              placeholder="sk-or-..."
              value={settings.apiKey}
              onChange={(e) => onSettingsChange({ ...settings, apiKey: e.target.value })}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <Separator />

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Model</label>
            <div className="grid grid-cols-1 gap-1.5">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSettingsChange({ ...settings, model: model.id })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                    settings.model === model.id
                      ? 'bg-primary/10 border border-primary/30 text-foreground'
                      : 'border border-transparent hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    settings.model === model.id ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                  <span>{model.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground font-mono">
                    {model.id.split('/')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
