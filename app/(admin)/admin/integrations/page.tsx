import { GhlSetupPanel } from '@/components/admin/GhlSetupPanel'

export default function IntegrationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500">Connect external services to your pipeline</p>
      </div>

      <GhlSetupPanel />
    </div>
  )
}
