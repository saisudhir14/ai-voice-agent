import { createFileRoute, Link } from '@tanstack/react-router'
import { Mic, Zap, Shield, Globe, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-8">
            <Zap className="h-3 w-3 mr-1" />
            Powered by Cartesia AI
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Build Voice AI Agents
            <br />
            <span className="gradient-text">In Minutes</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create intelligent voice assistants for your business. 
            No coding required. Just select your industry, customize the behavior, 
            and deploy instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* Voice Animation Card */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-slow">
                  <Mic className="h-12 w-12 text-white" />
                </div>
                <div className="voice-wave justify-center mb-4">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="text-muted-foreground italic">
                  "Hello! How can I help you today?"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Build, deploy, and manage voice agents with ease
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <div className={`h-14 w-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="relative py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every Industry
            </h2>
            <p className="text-muted-foreground text-lg">
              Pre-configured templates for common use cases
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <Card key={industry.name} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{industry.icon}</div>
                  <div className="font-medium">{industry.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-12">
              <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of businesses using AI voice agents to 
                improve customer experience.
              </p>
              <Button size="lg" asChild>
                <Link to="/register">
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
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
