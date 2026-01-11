import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { type Instance } from '../api/instances'
import { getLog, getPeerLog, type LogEntry, type PeerLogEntry } from '../api/qbittorrent'

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
	onBack: () => void
}

export function MobileLogViewer({ instances, onBack }: Props) {
	const [selectedInstance, setSelectedInstance] = useState<number>(instances[0]?.id ?? 0)
	const [tab, setTab] = useState<LogTab>('main')
	const [mainLogs, setMainLogs] = useState<LogEntry[]>([])
	const [peerLogs, setPeerLogs] = useState<PeerLogEntry[]>([])
	const [loading, setLoading] = useState(false)
	const [autoRefresh, setAutoRefresh] = useState(false)
	const [showFilters, setShowFilters] = useState(false)
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

	function formatTime(ts: number) {
		return new Date(ts * 1000).toLocaleTimeString()
	}

	function formatDate(ts: number) {
		return new Date(ts * 1000).toLocaleDateString()
	}

	function toggleFilter(key: keyof typeof filters) {
		setFilters(f => ({ ...f, [key]: !f[key] }))
	}

	const activeFilterCount = Object.values(filters).filter(Boolean).length

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
				<button
					onClick={onBack}
					className="p-2 -ml-2 rounded-xl active:scale-95 transition-transform"
					style={{ color: 'var(--text-muted)' }}
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div className="flex-1">
					<h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Log Viewer</h1>
					{autoRefresh && (
						<span className="text-xs flex items-center gap-1" style={{ color: 'var(--accent)' }}>
							<span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
							Live
						</span>
					)}
				</div>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className="p-2 rounded-xl active:scale-95 transition-transform relative"
					style={{
						color: showFilters ? 'var(--accent)' : 'var(--text-muted)',
						backgroundColor: showFilters ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent'
					}}
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
					</svg>
					{activeFilterCount < 4 && (
						<span
							className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-medium"
							style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
						>
							{activeFilterCount}
						</span>
					)}
				</button>
				<button
					onClick={() => fetchLogs()}
					disabled={loading || !selectedInstance}
					className="p-2 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
					style={{ color: 'var(--accent)' }}
				>
					<svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
				</button>
			</div>

			{showFilters && (
				<div className="p-4 border-b space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
					<div className="space-y-2">
						<label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
							Instance
						</label>
						<select
							value={selectedInstance}
							onChange={(e) => setSelectedInstance(Number(e.target.value))}
							className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none"
							style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
						>
							{instances.map(i => (
								<option key={i.id} value={i.id}>{i.label}</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
							Sort Order
						</label>
						<div className="flex gap-2">
							{[
								{ value: 'newest' as const, label: 'Newest first' },
								{ value: 'oldest' as const, label: 'Oldest first' },
							].map(opt => (
								<button
									key={opt.value}
									onClick={() => setSortOrder(opt.value)}
									className="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border"
									style={{
										backgroundColor: sortOrder === opt.value ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
										borderColor: sortOrder === opt.value ? 'var(--accent)' : 'var(--border)',
										color: sortOrder === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
									}}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					{tab === 'main' && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
									Log Types
								</label>
								{activeFilterCount < 4 && (
									<button
										onClick={() => setFilters({ normal: true, info: true, warning: true, critical: true })}
										className="text-xs"
										style={{ color: 'var(--accent)' }}
									>
										Reset
									</button>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								{Object.entries(LOG_TYPES).map(([type, { label, color, bg }]) => {
									const key = label.toLowerCase() as keyof typeof filters
									const active = filters[key]
									return (
										<button
											key={type}
											onClick={() => toggleFilter(key)}
											className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
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
							</div>
						</div>
					)}

					<div className="flex items-center justify-between pt-2">
						<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Auto-refresh</span>
						<div
							className="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer"
							style={{ backgroundColor: autoRefresh ? 'var(--accent)' : 'var(--bg-tertiary)' }}
							onClick={() => setAutoRefresh(!autoRefresh)}
						>
							<div
								className="w-5 h-5 rounded-full shadow-md transition-transform"
								style={{
									backgroundColor: 'white',
									transform: autoRefresh ? 'translateX(20px)' : 'translateX(0)',
								}}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-center gap-1 p-1.5 mx-4 my-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
				{(['main', 'peers'] as const).map(t => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className="flex-1 px-4 py-2 text-sm font-medium transition-all rounded-md"
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

			<div ref={containerRef} className="flex-1 overflow-auto">
				{!selectedInstance ? (
					<div className="text-center py-16">
						<svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
						</svg>
						<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No instances</p>
					</div>
				) : logCount === 0 && !loading ? (
					<div className="text-center py-16">
						<svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
						</svg>
						<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No logs</p>
						<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
							{tab === 'main' && activeFilterCount < 4 ? 'Adjust filters' : 'Pull to refresh'}
						</p>
					</div>
				) : (
					<div>
						{tab === 'main' ? sortedMainLogs.map((entry, idx) => {
							const typeInfo = LOG_TYPES[entry.type as keyof typeof LOG_TYPES] || LOG_TYPES[1]
							const prevEntry = sortedMainLogs[idx - 1]
							const showDate = !prevEntry || formatDate(entry.timestamp) !== formatDate(prevEntry.timestamp)

							return (
								<div key={entry.id}>
									{showDate && (
										<div
											className="px-4 py-2 text-xs font-medium sticky top-0"
											style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
										>
											{formatDate(entry.timestamp)}
										</div>
									)}
									<div
										className="px-4 py-3 border-b"
										style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
									>
										<div className="flex items-center gap-2 mb-1.5">
											<span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
												{formatTime(entry.timestamp)}
											</span>
											<span
												className="px-2 py-0.5 rounded text-xs font-medium"
												style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
											>
												{typeInfo.label}
											</span>
										</div>
										<p className="text-sm break-words font-mono" style={{ color: 'var(--text-primary)' }}>
											{entry.message}
										</p>
									</div>
								</div>
							)
						}) : sortedPeerLogs.map((entry, idx) => {
							const prevEntry = sortedPeerLogs[idx - 1]
							const showDate = !prevEntry || formatDate(entry.timestamp) !== formatDate(prevEntry.timestamp)

							return (
								<div key={entry.id}>
									{showDate && (
										<div
											className="px-4 py-2 text-xs font-medium sticky top-0"
											style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
										>
											{formatDate(entry.timestamp)}
										</div>
									)}
									<div
										className="px-4 py-3 border-b"
										style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
									>
										<div className="flex items-center gap-2 mb-1.5">
											<span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
												{formatTime(entry.timestamp)}
											</span>
											<span
												className="px-2 py-0.5 rounded text-xs font-medium"
												style={{
													backgroundColor: entry.blocked
														? 'color-mix(in srgb, var(--error) 12%, transparent)'
														: 'color-mix(in srgb, var(--accent) 12%, transparent)',
													color: entry.blocked ? 'var(--error)' : 'var(--accent)'
												}}
											>
												{entry.blocked ? 'Blocked' : 'Connected'}
											</span>
										</div>
										<p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
											{entry.ip}
										</p>
										{entry.reason && (
											<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
												{entry.reason}
											</p>
										)}
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{logCount > 0 && (
				<div
					className="px-4 py-2 text-xs border-t flex items-center justify-between"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
				>
					<span>{logCount} entries</span>
					<span>{instances.find(i => i.id === selectedInstance)?.label}</span>
				</div>
			)}
		</div>
	)
}
