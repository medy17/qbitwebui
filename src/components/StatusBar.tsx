import { useTransferInfo } from '../hooks/useTransferInfo'
import { formatSpeed } from '../utils/format'

export function StatusBar() {
	const { data } = useTransferInfo()

	const statusConfig = {
		connected: { label: 'Connected', type: 'success' as const },
		firewalled: { label: 'Firewalled', type: 'warning' as const },
		disconnected: { label: 'Disconnected', type: 'error' as const },
	}[data?.connection_status ?? 'disconnected']

	const statusColors = {
		success: 'var(--accent)',
		warning: 'var(--warning)',
		error: 'var(--error)',
	}

	return (
		<div className="relative flex items-center justify-between px-6 py-3 backdrop-blur-md border-t" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)', borderColor: 'var(--border)' }}>
			<div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 1%, transparent), transparent)' }} />

			<div className="relative flex items-center gap-6">
				<div className="flex items-center gap-2.5">
					<div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: statusColors[statusConfig.type], boxShadow: `0 0 10px ${statusColors[statusConfig.type]}50` }} />
					<span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{statusConfig.label}</span>
				</div>

				<div className="h-4 w-px" style={{ backgroundColor: 'var(--border)' }} />

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
						</svg>
						<span className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>
							{formatSpeed(data?.dl_info_speed ?? 0)}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
						</svg>
						<span className="text-xs font-mono font-medium" style={{ color: 'var(--warning)' }}>
							{formatSpeed(data?.up_info_speed ?? 0)}
						</span>
					</div>
				</div>
			</div>

			<div className="relative flex items-center gap-4">
				<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
					<span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>DHT</span>
					<span className="text-xs font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{data?.dht_nodes ?? 0}</span>
				</div>
			</div>
		</div>
	)
}
