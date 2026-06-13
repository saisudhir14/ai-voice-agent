import { PageHeader } from '../shell/PageHeader'
import { EmptyState } from '../primitives/misc'
import { Icon } from '../icons'

export function ApiKeysScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="API Keys"
        subtitle="Manage API credentials for accessing the Lattice platform"
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={<Icon.key size={36} stroke="var(--lattice-text-3)" />}
          title="API key management coming soon"
          description="Programmatic API key creation and management will be available in a future release. Use the backend configuration to manage access tokens for now."
          action={
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <a
                href="/agents"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--lattice-accent)', color: 'var(--lattice-accent-fg)', borderRadius: 'var(--lattice-radius)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
              >
                <Icon.agents size={13} /> Manage Agents
              </a>
            </div>
          }
        />
      </div>
    </div>
  )
}
