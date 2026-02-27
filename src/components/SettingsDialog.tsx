import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
      <DialogContent className="sm:max-w-[440px] bg-[hsl(0,0%,12%)] border-border/50">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">Settings</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            Configure your AI model and API key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* API Key */}
          <div>
            <label className="text-[12px] font-medium text-foreground/80 block mb-1.5">
              OpenRouter API Key
            </label>
            <Input
              type="password"
              placeholder="sk-or-..."
              value={settings.apiKey}
              onChange={(e) => onSettingsChange({ ...settings, apiKey: e.target.value })}
              className="h-8 text-[12px] bg-[hsl(0,0%,9%)] border-border/40"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Free tier available at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400/80 hover:text-emerald-400 underline"
              >
                openrouter.ai/keys
              </a>
              {' '}&mdash; no credit card required for free models.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/30" />

          {/* Model Selection */}
          <div>
            <label className="text-[12px] font-medium text-foreground/80 block mb-2">
              AI Model <span className="text-emerald-400/60 font-normal ml-1">all free</span>
            </label>
            <div className="space-y-0.5">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSettingsChange({ ...settings, model: model.id })}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] text-left transition-colors ${
                    settings.model === model.id
                      ? 'bg-emerald-500/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    settings.model === model.id ? 'bg-emerald-400' : 'bg-muted-foreground/20'
                  }`} />
                  <span className="flex-1">{model.name}</span>
                  <span className="text-[10px] text-muted-foreground/60 font-mono">{model.provider}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
