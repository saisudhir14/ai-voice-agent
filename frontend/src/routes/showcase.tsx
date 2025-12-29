import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ArrowLeft, Sparkles, ShoppingBag, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GradientBackground, 
  OrbVisualizer, 
  AnimatedSection 
} from '@/components/shared'

export const Route = createFileRoute('/showcase')({
  component: ShowcasePage,
})

const DEMO_AGENTS = [
  {
    id: 'support',
    name: 'Sarah',
    role: 'Customer Support',
    description: 'Empathetic and efficient support agent that handles returns and FAQs.',
    icon: Headphones,
    color: 'text-cyan-400',
    transcript: "I'd be happy to help you with that return. Could you please provide your order number?",
  },
  {
    id: 'sales',
    name: 'Marcus',
    role: 'Sales Representative',
    description: 'Persuasive and knowledgeable product expert focused on conversion.',
    icon: ShoppingBag,
    color: 'text-purple-400',
    transcript: "Based on your usage patterns, the Pro plan would actually save you 20% annually. Shall we switch?",
  },
  {
    id: 'creative',
    name: 'Luna',
    role: 'Creative Assistant',
    description: 'Imaginative partner for brainstorming and content generation.',
    icon: Sparkles,
    color: 'text-pink-400',
    transcript: "That's a fascinating concept! What if we explored the angle of sustainability in that narrative?",
  },
]

function ShowcasePage() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = (id: string) => {
    if (activeAgent === id && isPlaying) {
      setIsPlaying(false)
      setActiveAgent(null)
    } else {
      setActiveAgent(id)
      setIsPlaying(true)
      // Simulate playback duration
      setTimeout(() => setIsPlaying(false), 4000)
    }
  }

  return (
    <div className="relative min-h-screen bg-nebula-deep text-slate-200 overflow-hidden">
      <GradientBackground intensity="medium" />
      
      {/* Header */}
      <header className="relative z-10 pt-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <AnimatedSection>
            <Badge className="mb-6 bg-white/5 border-white/10 text-cyan-400 backdrop-blur-md px-4 py-1.5 rounded-full">
              Showcase Gallery
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experience <span className="text-gradient-nebula">Human-Level</span> AI
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Listen to our specialized agents in action. No signup required.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visualizer Stage */}
          <div className="order-2 lg:order-1">
            <AnimatedSection delay={0.2} className="relative">
              <div className="glass-plus rounded-3xl p-8 md:p-12 aspect-square flex flex-col items-center justify-center relative overflow-hidden border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
                
                <OrbVisualizer 
                  size="lg" 
                  className={`transition-all duration-700 ${isPlaying ? 'scale-125' : 'scale-100 opacity-50'}`} 
                />

                <AnimatePresence mode="wait">
                  {activeAgent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute bottom-12 text-center w-full px-8"
                    >
                      <div className={`text-sm font-mono mb-2 ${DEMO_AGENTS.find(a => a.id === activeAgent)?.color}`}>
                        {isPlaying ? 'Speaking...' : 'Paused'}
                      </div>
                      <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                        "{DEMO_AGENTS.find(a => a.id === activeAgent)?.transcript}"
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-12 text-center text-slate-500"
                    >
                      Select an agent to hear them speak
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          </div>

          {/* Agent Selection */}
          <div className="order-1 lg:order-2 space-y-6">
            {DEMO_AGENTS.map((agent, index) => (
              <AnimatedSection key={agent.id} delay={0.1 * (index + 3)}>
                <Card 
                  className={`p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group ${activeAgent === agent.id ? 'ring-1 ring-cyan-500/50 bg-white/10' : ''}`}
                  onClick={() => handlePlay(agent.id)}
                >
                  <div className="flex items-start gap-5">
                    <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <agent.icon className={`h-6 w-6 ${agent.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                        <Badge variant="outline" className="border-white/10 text-xs text-slate-400">
                          {agent.role}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 group-hover:text-cyan-400 transition-colors">
                        {activeAgent === agent.id && isPlaying ? (
                          <>
                            <Pause className="h-3 w-3" /> Pause Demo
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" /> Play Demo
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            ))}

            <AnimatedSection delay={0.6}>
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-center">
                <p className="text-slate-300 mb-4">Want to build your own custom agent?</p>
                <Button asChild className="w-full bg-white text-black hover:bg-slate-200">
                  <Link to="/register">Start Building Free</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  )
}
