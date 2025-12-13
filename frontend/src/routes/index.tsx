import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Mic, Zap, Shield, Globe, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection, AnimatedCard, GradientBackground, DemoWalkthrough } from '@/components/shared'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const features = [
  {
    icon: Mic,
    title: 'Natural Conversations',
    description: 'State-of-the-art speech recognition and synthesis for human-like conversations.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'Choose your industry, customize prompts, and deploy your agent in minutes.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Secure, scalable, and reliable infrastructure for businesses of all sizes.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
]

const industries = [
  { name: 'Customer Support', icon: '🎧' },
  { name: 'Sales', icon: '📈' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Real Estate', icon: '🏠' },
  { name: 'Restaurant', icon: '🍽️' },
  { name: 'Legal', icon: '⚖️' },
  { name: 'Education', icon: '🎓' },
  { name: 'Custom', icon: '⚙️' },
]

export function HomePage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  return (
    <div className="relative overflow-hidden min-h-screen">
      <DemoWalkthrough isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      {/* Enhanced Animated Background */}
      <GradientBackground intensity="medium" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <AnimatedSection delay={0.1}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Badge variant="secondary" className="mb-8 inline-flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Powered by Cartesia AI
              </Badge>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Build Voice AI Agents
              <br />
              <motion.span 
                className="gradient-text inline-block"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                In Minutes
              </motion.span>
            </motion.h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Create intelligent voice assistants for your business. 
              No coding required. Just select your industry, customize the behavior, 
              and deploy instantly.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="group">
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="group"
                  onClick={() => setIsDemoOpen(true)}
                >
                  <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Enhanced Voice Animation Card */}
          <AnimatedSection delay={0.5}>
            <motion.div 
              className="relative max-w-md mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Card className="relative glass hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Mic className="h-12 w-12 text-white" />
                  </motion.div>
                  <div className="voice-wave justify-center mb-4">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <motion.p 
                    className="text-muted-foreground italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    "Hello! How can I help you today?"
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground text-lg">
                Build, deploy, and manage voice agents with ease
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard
                key={feature.title}
                delay={0.1 * index}
                hover={true}
              >
                <motion.div
                  className={`h-14 w-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="relative py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Every Industry
              </h2>
              <p className="text-muted-foreground text-lg">
                Pre-configured templates for common use cases
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="cursor-pointer"
              >
                <Card className="hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 h-full">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className="text-4xl mb-3"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {industry.icon}
                    </motion.div>
                    <div className="font-medium">{industry.name}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection delay={0.2}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 glass hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="p-12">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Transform Your Business?
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    Join thousands of businesses using AI voice agents to 
                    improve customer experience.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" asChild className="group">
                      <Link to="/register">
                        Start Building Free
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">VoiceAI Platform</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 AI Voice Agent Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
