import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface DemoStep {
  id: string
  title: string
  description: string
  narration: string
  highlight?: {
    element: string
    position: { x: number; y: number; width: number; height: number }
  }
  screenshot?: string
}

const demoSteps: DemoStep[] = [
  {
    id: 'intro',
    title: 'Welcome to Voice AI Platform',
    description: 'Create intelligent voice assistants in minutes',
    narration: 'Welcome to Voice AI Platform. I\'m going to show you how easy it is to create intelligent voice assistants for your business. No coding required - just select your industry, customize your agent, and start having conversations.',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Manage all your voice agents from one place',
    narration: 'This is your dashboard. Here you can see all your voice agents, track conversations, and monitor performance. Everything is organized and easy to navigate.',
  },
  {
    id: 'create-agent',
    title: 'Create Your Agent',
    description: 'Choose an industry template or build custom',
    narration: 'To create a new agent, simply click "Create Agent". You can choose from pre-built industry templates like customer support, sales, healthcare, or create a completely custom agent tailored to your needs.',
  },
  {
    id: 'customize',
    title: 'Customize Your Agent',
    description: 'Set personality, voice, and behavior',
    narration: 'Customize your agent\'s personality, voice, and behavior. Set the system prompt to define how your agent responds, choose a voice that matches your brand, and configure advanced settings like temperature for more creative or focused responses.',
  },
  {
    id: 'voice-chat',
    title: 'Start Voice Conversations',
    description: 'Real-time voice interactions with your agent',
    narration: 'Once your agent is ready, you can start voice conversations instantly. Click the microphone button to begin. The agent uses state-of-the-art speech recognition and natural language processing to understand and respond naturally.',
  },
  {
    id: 'analytics',
    title: 'Track Performance',
    description: 'Monitor conversations and improve over time',
    narration: 'Track all your conversations, see how long they lasted, and analyze performance. Use these insights to continuously improve your agents and provide better customer experiences.',
  },
]

interface DemoWalkthroughProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoWalkthrough({ isOpen, onClose }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const step = demoSteps[currentStep]
  const progress = ((currentStep + 1) / demoSteps.length) * 100

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Play narration
  const playNarration = async () => {
    if (!step) return

    // Stop any existing speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }

    // Try to use Web Speech API for voice narration
    if (synthRef.current && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(step.narration)
      
      // Try to use a natural-sounding voice
      const voices = synthRef.current.getVoices()
      const preferredVoice = voices.find(
        (v) => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')
      ) || voices.find((v) => v.lang.startsWith('en'))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      utterance.rate = 0.95 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        setIsPlaying(false)
        // Auto-advance to next step after a short delay
        setTimeout(() => {
          if (currentStep < demoSteps.length - 1) {
            handleNext()
          }
        }, 1000)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
      }

      synthRef.current.speak(utterance)
      setIsPlaying(true)
    } else {
      // Fallback: just show text without voice
      setIsPlaying(true)
      // Simulate narration duration
      const duration = step.narration.length * 50 // ~50ms per character
      setTimeout(() => {
        setIsPlaying(false)
        if (currentStep < demoSteps.length - 1) {
          setTimeout(() => handleNext(), 1000)
        }
      }, duration)
    }
  }

  // Stop narration
  const stopNarration = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsPlaying(false)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (isPlaying) {
      stopNarration()
      if (!isMuted) {
        // Unmuted, restart
        setTimeout(playNarration, 100)
      }
    }
  }

  // Handle step change
  const handleStepChange = (newStep: number) => {
    stopNarration()
    setCurrentStep(newStep)
    setTimeout(() => {
      if (isOpen) {
        playNarration()
      }
    }, 500)
  }

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      handleStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1)
    }
  }

  // Auto-play when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setTimeout(() => {
        playNarration()
      }, 500)
    } else {
      stopNarration()
    }

    return () => {
      stopNarration()
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNarration()
    }
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary/20 to-accent/20 p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Product Demo</h2>
                <p className="text-muted-foreground text-sm">
                  Step {currentStep + 1} of {demoSteps.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-background/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="relative p-8 min-h-[500px]">
            {/* Simulated Screen/Video Area */}
            <div className="relative mb-6 rounded-lg overflow-hidden bg-muted/30 border-2 border-border">
              <div className="aspect-video bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center relative">
                {/* Simulated browser/app interface */}
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full p-8"
                >
                  {/* Simulated UI based on step */}
                  {step.id === 'intro' && (
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                      >
                        <span className="text-4xl">🎤</span>
                      </motion.div>
                      <h3 className="text-3xl font-bold">Voice AI Platform</h3>
                      <p className="text-muted-foreground">Create intelligent voice assistants</p>
                    </div>
                  )}

                  {step.id === 'dashboard' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-48 bg-primary/20 rounded"></div>
                        <div className="h-8 w-32 bg-accent/20 rounded"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-24 bg-card rounded-lg border"></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-32 bg-card rounded-lg border"></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.id === 'create-agent' && (
                    <div className="space-y-4">
                      <div className="h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold">Create New Agent</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {['Customer Support', 'Sales', 'Healthcare', 'Custom'].map((name) => (
                          <div
                            key={name}
                            className="h-24 bg-card rounded-lg border border-primary/20 hover:border-primary transition-colors flex items-center justify-center"
                          >
                            <span className="font-medium">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.id === 'customize' && (
                    <div className="space-y-4">
                      <div className="h-10 bg-muted rounded"></div>
                      <div className="space-y-3">
                        <div className="h-12 bg-card rounded border"></div>
                        <div className="h-32 bg-card rounded border"></div>
                        <div className="h-12 bg-card rounded border"></div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-10 flex-1 bg-primary/20 rounded"></div>
                        <div className="h-10 w-24 bg-accent/20 rounded"></div>
                      </div>
                    </div>
                  )}

                  {step.id === 'voice-chat' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center h-32">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                        >
                          <span className="text-4xl">🎤</span>
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-12 bg-card rounded-lg border-l-4 border-primary"></div>
                        <div className="h-12 bg-primary/20 rounded-lg border-l-4 border-accent ml-auto w-3/4"></div>
                      </div>
                    </div>
                  )}

                  {step.id === 'analytics' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {['Total', 'Active', 'Avg Time'].map((label) => (
                          <div key={label} className="h-20 bg-card rounded-lg border text-center flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-sm text-muted-foreground">{label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="h-48 bg-card rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Conversation Timeline</span>
                      </div>
                    </div>
                  )}

                  {/* Highlight overlay */}
                  {step.highlight && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute border-2 border-primary rounded-lg shadow-lg shadow-primary/50"
                      style={{
                        left: `${step.highlight.position.x}%`,
                        top: `${step.highlight.position.y}%`,
                        width: `${step.highlight.position.width}%`,
                        height: `${step.highlight.position.height}%`,
                      }}
                    >
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Step Info */}
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {step.description}
              </p>
              {isPlaying && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Playing narration...</span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="border-t bg-muted/30 p-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={isPlaying ? stopNarration : playNarration}
                  disabled={!step}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {demoSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleStepChange(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        index === currentStep
                          ? 'bg-primary w-8'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentStep === demoSteps.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
