import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { type Instance } from '../api/instances'
import { getLog, getPeerLog, type LogEntry, type PeerLogEntry } from '../api/qbittorrent'
import { Select } from './ui'

const LOG_TYPES = {
	1: { label: 'Normal', color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
	2: { label: 'Info', color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 12%, transparent)' },
	4: { label: 'Warning', color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 12%, transparent)' },
	8: { label: 'Critical', color: 'var(--error)', bg: 'color-mix(in srgb, var(--error) 12%, transparent)' },
} as const

type LogTab = 'main' | 'peers'
type SortOrder = 'newest' | 'oldest'

interface Props {
	instances: Instance[]
}

export function LogViewer({ instances }: Props) {
	const [selectedInstance, setSelectedInstance] = useState<number>(instances[0]?.id ?? 0)
	const [tab, setTab] = useState<LogTab>('main')
	const [mainLogs, setMainLogs] = useState<LogEntry[]>([])
	const [peerLogs, setPeerLogs] = useState<PeerLogEntry[]>([])
	const [loading, setLoading] = useState(false)
	const [autoRefresh, setAutoRefresh] = useState(false)
	const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
	const [filters, setFilters] = useState({ normal: true, info: true, warning: true, critical: true })
	const lastMainIdRef = useRef(-1)
	const lastPeerIdRef = useRef(-1)
	const containerRef = useRef<HTMLDivElement>(null)

	const fetchLogs = useCallback(async (incremental = false) => {
		if (!selectedInstance) return
		setLoading(true)
		try {
			if (tab === 'main') {
				const lastId = incremental ? lastMainIdRef.current : -1
				const entries = await getLog(selectedInstance, { ...filters, lastKnownId: lastId })
				if (entries.length > 0) {
					lastMainIdRef.current = Math.max(...entries.map(e => e.id))
					if (incremental) {
						setMainLogs(prev => [...prev, ...entries])
					} else {
						setMainLogs(entries)
					}
				} else if (!incremental) {
					setMainLogs([])
				}
			} else {
				const lastId = incremental ? lastPeerIdRef.current : -1
				const entries = await getPeerLog(selectedInstance, lastId === -1 ? undefined : lastId)
				if (entries.length > 0) {
					lastPeerIdRef.current = Math.max(...entries.map(e => e.id))
					if (incremental) {
						setPeerLogs(prev => [...prev, ...entries])
					} else {
						setPeerLogs(entries)
					}
				} else if (!incremental) {
					setPeerLogs([])
				}
			}
		} catch {
			if (!incremental) {
				if (tab === 'main') setMainLogs([])
				else setPeerLogs([])
			}
		} finally {
			setLoading(false)
		}
	}, [selectedInstance, tab, filters])

	useEffect(() => {
		if (tab === 'main') {
			lastMainIdRef.current = -1
			setMainLogs([])
		} else {
			lastPeerIdRef.current = -1
			setPeerLogs([])
		}
		if (selectedInstance) fetchLogs()
	}, [selectedInstance, tab, filters, fetchLogs])

	useEffect(() => {
		if (!autoRefresh || !selectedInstance) return
		const interval = setInterval(() => fetchLogs(true), 5000)
		return () => clearInterval(interval)
	}, [autoRefresh, selectedInstance, fetchLogs])

	useEffect(() => {
		if (autoRefresh && containerRef.current) {
			containerRef.current.scrollTop = sortOrder === 'newest' ? 0 : containerRef.current.scrollHeight
		}
	}, [mainLogs, peerLogs, autoRefresh, sortOrder])

	const sortedMainLogs = useMemo(() => {
		return sortOrder === 'newest' ? [...mainLogs].reverse() : mainLogs
	}, [mainLogs, sortOrder])

	const sortedPeerLogs = useMemo(() => {
		return sortOrder === 'newest' ? [...peerLogs].reverse() : peerLogs
	}, [peerLogs, sortOrder])

	const logCount = tab === 'main' ? sortedMainLogs.length : sortedPeerLogs.length

	const instanceOptions = useMemo(() =>
		instances.map(i => ({ value: i.id, label: i.label })),
		[instances]
	)

	const sortOptions: { value: SortOrder; label: string }[] = [
		{ value: 'newest', label: 'Newest first' },
		{ value: 'oldest', label: 'Oldest first' },
	]

	function formatTime(ts: number) {
		return new Date(ts * 1000).toLocaleString()
	}

	function toggleFilter(key: keyof typeof filters) {
		setFilters(f => ({ ...f, [key]: !f[key] }))
	}

	const activeFilterCount = Object.values(filters).filter(Boolean).length

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Log Viewer</h1>
					<p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
						View qBittorrent application and peer logs
					</p>
				</div>
				<button
					onClick={() => fetchLogs()}
					disabled={loading || !selectedInstance}
					className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
					style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
				>
					{loading ? (
						<span className="flex items-center gap-2">
							<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Loading
						</span>
					) : 'Refresh'}
				</button>
			</div>

			<div
				className="rounded-xl border p-4 mb-4 space-y-4"
				style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
			>
				<div className="flex flex-wrap items-center gap-4">
					<div className="flex items-center gap-2">
						<label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
							Instance
						</label>
						<Select
							value={selectedInstance}
							options={instanceOptions}
							onChange={setSelectedInstance}
							minWidth="160px"
						/>
					</div>

					<div className="flex items-center gap-2">
						<label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
							Sort
						</label>
						<Select
							value={sortOrder}
							options={sortOptions}
							onChange={setSortOrder}
							minWidth="130px"
						/>
					</div>

					<div className="flex items-center gap-1 p-1 rounded-lg ml-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
						{(['main', 'peers'] as const).map(t => (
							<button
								key={t}
								onClick={() => setTab(t)}
								className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
								style={{
									backgroundColor: tab === t ? 'var(--bg-secondary)' : 'transparent',
									color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
									boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,0.15), 0 0 0 1px var(--border)' : 'none',
								}}
							>
								{t === 'main' ? 'Application' : 'Peers'}
							</button>
						))}
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
					{tab === 'main' && (
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium uppercase tracking-wider mr-1" style={{ color: 'var(--text-muted)' }}>
								Types
							</span>
							{Object.entries(LOG_TYPES).map(([type, { label, color, bg }]) => {
								const key = label.toLowerCase() as keyof typeof filters
								const active = filters[key]
								return (
									<button
										key={type}
										onClick={() => toggleFilter(key)}
										className="px-2.5 py-1 rounded-md text-xs font-medium transition-all border"
										style={{
											backgroundColor: active ? bg : 'transparent',
											borderColor: active ? color : 'var(--border)',
											color: active ? color : 'var(--text-muted)',
											opacity: active ? 1 : 0.6,
										}}
									>
										{label}
									</button>
								)
							})}
							{activeFilterCount < 4 && (
								<button
									onClick={() => setFilters({ normal: true, info: true, warning: true, critical: true })}
									className="text-xs underline ml-1"
									style={{ color: 'var(--text-muted)' }}
								>
									Reset
								</button>
							)}
						</div>
					)}

					<label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
						<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Auto-refresh</span>
						<div
							className="w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer"
							style={{ backgroundColor: autoRefresh ? 'var(--accent)' : 'var(--bg-tertiary)' }}
							onClick={() => setAutoRefresh(!autoRefresh)}
						>
							<div
								className="w-4 h-4 rounded-full shadow transition-transform"
								style={{
									backgroundColor: 'white',
									transform: autoRefresh ? 'translateX(16px)' : 'translateX(0)',
								}}
							/>
						</div>
					</label>
				</div>
			</div>

			{!selectedInstance ? (
				<div className="text-center py-16 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
					<svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
					</svg>
					<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No instances configured</p>
					<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add an instance to view logs</p>
				</div>
			) : logCount === 0 && !loading ? (
				<div className="text-center py-16 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
					<svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
					</svg>
					<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No log entries</p>
					<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
						{tab === 'main' && activeFilterCount < 4 ? 'Try adjusting your filters' : 'Logs will appear here'}
					</p>
				</div>
			) : (
				<div
					ref={containerRef}
					className="rounded-xl border overflow-hidden"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', maxHeight: '60vh' }}
				>
					<div className="overflow-auto" style={{ maxHeight: '60vh' }}>
						<table className="w-full text-xs">
							<thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
								<tr>
									<th className="text-left px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)', width: '150px' }}>
										Timestamp
									</th>
									{tab === 'main' ? (
										<th className="text-left px-4 py-2.5 font-medium" style={{ color: 'var(--text-muted)', width: '90px' }}>
											Level
										</th>
									) : (
										<th className="text-left px-4 py-2.5 font-medium" style={{ color: 'var(--text-muted)', width: '90px' }}>
											Status
										</th>
									)}
									<th className="text-left px-4 py-2.5 font-medium" style={{ color: 'var(--text-muted)' }}>
										{tab === 'main' ? 'Message' : 'IP Address'}
									</th>
									{tab === 'peers' && (
										<th className="text-left px-4 py-2.5 font-medium" style={{ color: 'var(--text-muted)' }}>
											Reason
										</th>
									)}
								</tr>
							</thead>
							<tbody className="font-mono">
								{tab === 'main' ? sortedMainLogs.map((entry) => {
									const typeInfo = LOG_TYPES[entry.type as keyof typeof LOG_TYPES] || LOG_TYPES[1]
									return (
										<tr
											key={entry.id}
											className="border-t transition-colors hover:bg-[var(--bg-tertiary)]"
											style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
										>
											<td className="px-4 py-2 whitespace-nowrap tabular-nums" style={{ color: 'var(--text-muted)' }}>
												{formatTime(entry.timestamp)}
											</td>
											<td className="px-4 py-2">
												<span
													className="inline-block px-2 py-0.5 rounded text-xs font-medium"
													style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
												>
													{typeInfo.label}
												</span>
											</td>
											<td className="px-4 py-2 break-all" style={{ color: 'var(--text-primary)' }}>
												{entry.message}
											</td>
										</tr>
									)
								}) : sortedPeerLogs.map((entry) => (
									<tr
										key={entry.id}
										className="border-t transition-colors hover:bg-[var(--bg-tertiary)]"
										style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
									>
										<td className="px-4 py-2 whitespace-nowrap tabular-nums" style={{ color: 'var(--text-muted)' }}>
											{formatTime(entry.timestamp)}
										</td>
										<td className="px-4 py-2">
											<span
												className="inline-block px-2 py-0.5 rounded text-xs font-medium"
												style={{
													backgroundColor: entry.blocked
														? 'color-mix(in srgb, var(--error) 12%, transparent)'
														: 'color-mix(in srgb, var(--accent) 12%, transparent)',
													color: entry.blocked ? 'var(--error)' : 'var(--accent)'
												}}
											>
												{entry.blocked ? 'Blocked' : 'Connected'}
											</span>
										</td>
										<td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>
											{entry.ip}
										</td>
										<td className="px-4 py-2 break-all" style={{ color: 'var(--text-muted)' }}>
											{entry.reason || '—'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div
						className="px-4 py-2 text-xs border-t flex items-center justify-between"
						style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
					>
						<span>{logCount} entries</span>
						{autoRefresh && (
							<span className="flex items-center gap-1.5">
								<span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
								Live
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
