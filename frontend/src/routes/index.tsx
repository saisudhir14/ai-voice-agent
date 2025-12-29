import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Mic, Zap, ArrowRight, MousePointer2, Sparkles, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection, SpotlightCard } from '@/components/shared'

// Lazy load heavy components for better initial load performance
const GradientBackground = lazy(() => 
  import('@/components/shared/gradient-background').then(m => ({ default: m.GradientBackground }))
)
const OrbVisualizer = lazy(() => 
  import('@/components/shared/orb-visualizer').then(m => ({ default: m.OrbVisualizer }))
)

export const Route = createFileRoute('/')({
  component: HomePage,
})

const features = [
  {
    icon: Mic,
    title: 'Neural Voice Synthesis',
    description: 'Ultra-low latency voices that sound indistinguishable from humans, powered by Cartesia.',
    color: 'text-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'Contextual Intelligence',
    description: 'Agents that understand nuance, emotion, and complex instructions in real-time.',
    color: 'text-purple-400',
  },
  {
    icon: Layers,
    title: 'Seamless Workflows',
    description: 'Connect your agent to any API, CRM, or database with zero-code integrations.',
    color: 'text-pink-400',
  },
]

const steps = [
  { title: 'Define Persona', desc: 'Set the tone, role, and knowledge.' },
  { title: 'Choose Voice', desc: 'Select from 100+ neural voices.' },
  { title: 'Deploy Anywhere', desc: 'Web, Mobile, or Phone lines.' },
]

export function HomePage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-nebula-deep text-slate-200">
      <Suspense fallback={null}>
        <GradientBackground intensity="high" />
      </Suspense>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <AnimatedSection delay={0.1}>
                <Badge className="mb-6 bg-white/5 border-white/10 text-cyan-400 backdrop-blur-md px-4 py-1.5 rounded-full">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    The Future of Voice AI is Here
                  </span>
                </Badge>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-[0.9] tracking-tighter">
                  Crafting 
                  <br />
                  <span className="text-gradient-nebula">Infinite</span>
                  <br />
                  Conversations
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
                  Deploy sophisticated, human-like voice agents that handle support, 
                  sales, and operations autonomously. Built for the next generation of business.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="flex flex-wrap items-center gap-6">
                  <Button size="lg" asChild className="bg-white text-black hover:bg-slate-200 rounded-full px-8 h-14 text-lg font-medium group">
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="text-slate-300 hover:text-white group">
                    View Showcase <MousePointer2 className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </AnimatedSection>
            </div>

            <div className="relative flex justify-center items-center">
              <AnimatedSection delay={0.5} className="w-full">
                <div className="relative aspect-square flex items-center justify-center">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                  <Suspense fallback={<div className="w-64 h-64 rounded-full bg-primary/20 animate-pulse" />}>
                    <OrbVisualizer size="lg" className="z-10" />
                  </Suspense>
                  
                  {/* Floating Labels */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-10 right-0 glass-plus p-4 rounded-2xl z-20"
                  >
                    <div className="text-xs text-cyan-400 font-mono mb-1">Latency</div>
                    <div className="text-xl font-bold text-white tracking-tight">42ms</div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-10 left-0 glass-plus p-4 rounded-2xl z-20"
                  >
                    <div className="text-xs text-purple-400 font-mono mb-1">Accuracy</div>
                    <div className="text-xl font-bold text-white tracking-tight">99.2%</div>
                  </motion.div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for Performance</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to scale your voice operations without the overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={0.1 * index}>
                <SpotlightCard>
                  <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative py-32 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">From Concept to <span className="text-cyan-400">Live</span> in Seconds</h2>
              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{step.title}</h4>
                      <p className="text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-plus rounded-3xl p-8 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse" />
                <div className="space-y-2 py-4">
                  <div className="h-12 w-full bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center px-4">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-3" />
                    <span className="text-sm font-mono text-cyan-400">system.initialize()</span>
                  </div>
                  <div className="h-12 w-full bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center px-4">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mr-3" />
                    <span className="text-sm font-mono text-purple-400">voice.load("Cartesia_Sonic")</span>
                  </div>
                </div>
                <div className="h-4 w-2/3 bg-white/5 rounded-full animate-pulse" />
              </div>
              {/* Interactive Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <SpotlightCard className="p-16 text-center border-white/10 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
            
            <Zap className="h-16 w-16 text-white mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Lift Off?</h2>
            <p className="text-slate-400 text-xl mb-10">
              Join the businesses shaping the future of voice technology.
            </p>
            <Button size="lg" asChild className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full px-10 h-16 text-lg font-bold">
              <Link to="/register">Create Your Agent Now</Link>
            </Button>
          </SpotlightCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">VoiceAI<span className="text-cyan-400">.</span></span>
          </div>
          <div className="flex gap-8 text-slate-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 VoiceAI Platform. Built with Cartesia.
          </p>
        </div>
      </footer>
    </div>
  )
}