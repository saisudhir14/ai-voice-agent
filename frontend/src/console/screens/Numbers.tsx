import { PageHeader } from '../shell/PageHeader'
import { EmptyState } from '../primitives/misc'
import { Icon } from '../icons'

export function NumbersScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Phone Numbers"
        subtitle="Manage inbound and outbound phone numbers for your agents"
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={<Icon.hash size={36} stroke="var(--lattice-text-3)" />}
          title="Phone numbers not configured"
          description="Connect a telephony provider (Twilio, Telnyx, Vonage) to assign phone numbers to your agents. This feature requires backend telephony integration."
          action={
            <a
              href="https://docs.twilio.com"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 14px', background: 'var(--lattice-surface-2)', border: '1px solid var(--lattice-border)', borderRadius: 'var(--lattice-radius)', fontSize: 13, color: 'var(--lattice-text)', textDecoration: 'none' }}
            >
              <Icon.external size={13} /> View Twilio docs
            </a>
          }
        />
      </div>
    </div>
  )
}
