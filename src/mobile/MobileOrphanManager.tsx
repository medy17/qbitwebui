import { useState } from 'react'
import { type Instance } from '../api/instances'
import { deleteTorrents } from '../api/qbittorrent'
import { formatSize } from '../utils/format'

interface OrphanTorrent {
	instanceId: number
	instanceLabel: string
	hash: string
	name: string
	size: number
	reason: 'missingFiles' | 'unregistered'
	trackerMessage?: string
}

interface Props {
	instances: Instance[]
	onBack: () => void
}

export function MobileOrphanManager({ instances, onBack }: Props) {
	const [scanning, setScanning] = useState(false)
	const [orphans, setOrphans] = useState<OrphanTorrent[]>([])
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [scanned, setScanned] = useState(false)
	const [error, setError] = useState('')
	const [deleteFiles, setDeleteFiles] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	async function scan() {
		setScanning(true)
		setOrphans([])
		setSelected(new Set())
		setScanned(false)
		setError('')
		try {
			const res = await fetch('/api/tools/orphans/scan', {
				method: 'POST',
				credentials: 'include',
			})
			if (!res.ok) throw new Error('Scan failed')
			const data = await res.json()
			setOrphans(data.orphans)
			setScanned(true)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Scan failed')
		} finally {
			setScanning(false)
		}
	}

	function toggleSelect(key: string) {
		setSelected(prev => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}

	function selectAll() {
		if (selected.size === orphans.length) {
			setSelected(new Set())
		} else {
			setSelected(new Set(orphans.map(o => `${o.instanceId}:${o.hash}`)))
		}
	}

	async function handleDelete() {
		setDeleting(true)
		try {
			const byInstance = new Map<number, string[]>()
			for (const key of selected) {
				const [instanceId, hash] = key.split(':')
				const id = parseInt(instanceId, 10)
				if (!byInstance.has(id)) byInstance.set(id, [])
				byInstance.get(id)!.push(hash)
			}
			for (const [instanceId, hashes] of byInstance) {
				await deleteTorrents(instanceId, hashes, deleteFiles)
			}
			setOrphans(prev => prev.filter(o => !selected.has(`${o.instanceId}:${o.hash}`)))
			setSelected(new Set())
			setShowConfirm(false)
		} finally {
			setDeleting(false)
		}
	}

	const groupedByInstance = orphans.reduce((acc, o) => {
		if (!acc[o.instanceLabel]) acc[o.instanceLabel] = []
		acc[o.instanceLabel].push(o)
		return acc
	}, {} as Record<string, OrphanTorrent[]>)

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 space-y-3">
				<div className="flex items-center gap-3">
					<button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-[var(--bg-tertiary)]">
						<svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					<div className="flex-1">
						<h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Orphan Manager</h2>
						<p className="text-xs" style={{ color: 'var(--text-muted)' }}>Find torrents with missing files</p>
					</div>
				</div>

				<button
					onClick={scan}
					disabled={scanning || instances.length === 0}
					className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
					style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
				>
					{scanning ? (
						<>
							<div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-contrast)', borderTopColor: 'transparent' }} />
							Scanning...
						</>
					) : (
						<>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
							</svg>
							Scan All Instances
						</>
					)}
				</button>

				{error && (
					<div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)', color: 'var(--error)' }}>
						{error}
					</div>
				)}
			</div>

			<div className="flex-1 overflow-y-auto px-4 pb-4">
				{scanning && (
					<div
						className="p-4 rounded-xl border flex items-center gap-3"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
						<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scanning instances...</span>
					</div>
				)}

				{instances.length === 0 && (
					<div className="text-center py-12 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
						<div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
							<svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
							</svg>
						</div>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>No instances configured</p>
					</div>
				)}

				{scanned && orphans.length === 0 && (
					<div className="text-center py-12 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
						<div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, #a6e3a1 15%, transparent)' }}>
							<svg className="w-8 h-8" style={{ color: '#a6e3a1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All clear!</p>
						<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No orphaned torrents found</p>
					</div>
				)}

				{orphans.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<button
								onClick={selectAll}
								className="text-sm"
								style={{ color: 'var(--accent)' }}
							>
								{selected.size === orphans.length ? 'Deselect all' : 'Select all'}
							</button>
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								{selected.size} of {orphans.length} selected
							</span>
						</div>

						{Object.entries(groupedByInstance).map(([instanceLabel, items]) => (
							<div key={instanceLabel}>
								<div className="flex items-center gap-2 px-1 py-2">
									<svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
									</svg>
									<span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{instanceLabel}</span>
									<span className="text-xs" style={{ color: 'var(--text-muted)' }}>({items.length})</span>
								</div>
								<div className="space-y-1">
									{items.map((item) => {
										const key = `${item.instanceId}:${item.hash}`
										return (
											<div
												key={key}
												onClick={() => toggleSelect(key)}
												className="flex items-start gap-3 p-3 rounded-xl active:scale-[0.99] transition-transform cursor-pointer"
												style={{ backgroundColor: selected.has(key) ? 'var(--bg-tertiary)' : 'var(--bg-secondary)' }}
											>
												<div
													className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border"
													style={{
														backgroundColor: selected.has(key) ? 'var(--accent)' : 'transparent',
														borderColor: selected.has(key) ? 'var(--accent)' : 'var(--text-muted)',
													}}
												>
													{selected.has(key) && (
														<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
														</svg>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
														{item.name}
													</div>
													<div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
														<span>{formatSize(item.size)}</span>
														<span>•</span>
														{item.reason === 'missingFiles' ? (
															<span style={{ color: 'var(--warning)' }}>Missing files</span>
														) : (
															<span style={{ color: 'var(--error)' }} title={item.trackerMessage}>
																Unregistered
															</span>
														)}
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{selected.size > 0 && (
				<div
					className="sticky bottom-0 p-4 border-t"
					style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', paddingBottom: 'calc(70px + env(safe-area-inset-bottom, 1rem))' }}
				>
					<button
						onClick={() => setShowConfirm(true)}
						className="w-full py-3 rounded-xl text-sm font-medium"
						style={{ backgroundColor: 'var(--error)', color: 'white' }}
					>
						Delete {selected.size} Torrent{selected.size > 1 ? 's' : ''}
					</button>
				</div>
			)}

			{showConfirm && (
				<>
					<div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowConfirm(false)} />
					<div
						className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl border p-5"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Torrents</h3>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>
							Delete <strong style={{ color: 'var(--text-primary)' }}>{selected.size}</strong> torrent{selected.size > 1 ? 's' : ''}?
						</p>
						<label className="flex items-center gap-3 mt-4 cursor-pointer">
							<div
								onClick={(e) => { e.stopPropagation(); setDeleteFiles(!deleteFiles) }}
								className="w-5 h-5 rounded flex items-center justify-center border shrink-0"
								style={{
									backgroundColor: deleteFiles ? 'var(--error)' : 'transparent',
									borderColor: deleteFiles ? 'var(--error)' : 'var(--text-muted)',
								}}
							>
								{deleteFiles && (
									<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								)}
							</div>
							<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Also delete files</span>
						</label>
						<div className="flex gap-3 mt-5">
							<button
								onClick={() => setShowConfirm(false)}
								disabled={deleting}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--error)', color: 'white' }}
							>
								{deleting ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
