import { AnimatedSection } from '@/components/shared'

const integrations = [
  { name: 'Twilio', category: 'Telephony' },
  { name: 'Vonage', category: 'Telephony' },
  { name: 'Telnyx', category: 'SIP' },
  { name: 'Epic', category: 'EHR' },
  { name: 'Cerner', category: 'EHR' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'HubSpot', category: 'CRM' },
  { name: 'Zendesk', category: 'Support' },
  { name: 'Intercom', category: 'Support' },
  { name: 'Snowflake', category: 'Data' },
  { name: 'Segment', category: 'Data' },
  { name: 'Make', category: 'Workflow' },
  { name: 'n8n', category: 'Workflow' },
  { name: 'Zapier', category: 'Workflow' },
  { name: 'Cal.com', category: 'Scheduling' },
  { name: 'Calendly', category: 'Scheduling' },
]

export function IntegrationsGrid() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3 md:grid-cols-4">
      {integrations.map((integration, i) => (
        <AnimatedSection key={integration.name} delay={0.02 * i}>
          <div className="group flex h-full flex-col justify-between bg-paper p-6 transition-colors hover:bg-paper-2">
            <div className="text-eyebrow uppercase text-ink-3">{integration.category}</div>
            <div className="mt-8 font-display text-lg font-semibold tracking-tight text-ink-2 transition-colors group-hover:text-ink">
              {integration.name}
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  )
}
