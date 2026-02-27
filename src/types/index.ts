export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  commands?: ParsedCommand[]
}

export interface ParsedCommand {
  command: string
  description?: string
  status: 'pending' | 'executing' | 'success' | 'error'
  response?: string
}

export interface ServerConfig {
  host: string
  port: number
  password: string
}

export interface AppSettings {
  apiKey: string
  model: string
  serverConfig: ServerConfig
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
