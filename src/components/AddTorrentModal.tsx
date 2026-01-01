import { useState, useRef } from 'react'
import { useAddTorrent, useCategories } from '../hooks/useTorrents'

interface Props {
	open: boolean
	onClose: () => void
}

type Tab = 'link' | 'file'

export function AddTorrentModal({ open, onClose }: Props) {
	const [tab, setTab] = useState<Tab>('link')
	const [url, setUrl] = useState('')
	const [file, setFile] = useState<File | null>(null)
	const [category, setCategory] = useState('')
	const [savepath, setSavepath] = useState('')
	const [startTorrent, setStartTorrent] = useState(true)
	const [sequential, setSequential] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { data: categories = {} } = useCategories()
	const addMutation = useAddTorrent()

	if (!open) return null

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (tab === 'link' && !url.trim()) return
		if (tab === 'file' && !file) return

		addMutation.mutate({
			options: {
				urls: tab === 'link' ? url.trim() : undefined,
				category: category || undefined,
				savepath: savepath || undefined,
				paused: !startTorrent,
				sequentialDownload: sequential,
			},
			file: tab === 'file' ? file ?? undefined : undefined,
		}, {
			onSuccess: () => {
				setUrl('')
				setFile(null)
				setCategory('')
				setSavepath('')
				setStartTorrent(true)
				setSequential(false)
				onClose()
			},
		})
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0]
		if (f) setFile(f)
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault()
		const f = e.dataTransfer.files?.[0]
		if (f && f.name.endsWith('.torrent')) {
			setFile(f)
			setTab('file')
		}
	}

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
			<div className="relative w-full max-w-md mx-4 opacity-0 animate-in">
				<div className="absolute -inset-px rounded-2xl" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 20%, transparent), transparent)' }} />
				<div className="relative rounded-2xl border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
					<div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
								<svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
							</div>
							<h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Add Torrent</h3>
						</div>
						<button onClick={onClose} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<form onSubmit={handleSubmit} className="p-5 space-y-4">
						<div className="flex p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
							<button
								type="button"
								onClick={() => setTab('link')}
								className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
								style={{
									backgroundColor: tab === 'link' ? 'var(--accent)' : 'transparent',
									color: tab === 'link' ? 'var(--accent-contrast)' : 'var(--text-muted)',
								}}
							>
								Magnet / URL
							</button>
							<button
								type="button"
								onClick={() => setTab('file')}
								className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
								style={{
									backgroundColor: tab === 'file' ? 'var(--accent)' : 'transparent',
									color: tab === 'file' ? 'var(--accent-contrast)' : 'var(--text-muted)',
								}}
							>
								Torrent File
							</button>
						</div>

						{tab === 'link' ? (
							<div>
								<label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Magnet link or URL</label>
								<textarea
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="magnet:?xt=urn:btih:... or https://..."
									rows={3}
									className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none transition-colors"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								/>
							</div>
						) : (
							<div>
								<label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Torrent file</label>
								<input
									ref={fileInputRef}
									type="file"
									accept=".torrent"
									onChange={handleFileChange}
									className="hidden"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="w-full py-6 px-4 rounded-xl border border-dashed text-sm transition-colors hover:opacity-80"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									{file ? (
										<div className="flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)' }}>
											<svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span className="truncate max-w-[200px]">{file.name}</span>
										</div>
									) : (
										<div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
											<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
											</svg>
											<span>Click or drop .torrent file</span>
										</div>
									)}
								</button>
							</div>
						)}

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								>
									<option value="">None</option>
									{Object.keys(categories).map((cat) => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Save path</label>
								<input
									type="text"
									value={savepath}
									onChange={(e) => setSavepath(e.target.value)}
									placeholder="Default"
									className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								/>
							</div>
						</div>

						<div className="flex items-center gap-4 pt-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={startTorrent}
									onChange={(e) => setStartTorrent(e.target.checked)}
									className="sr-only peer"
								/>
								<div
									className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
									style={{
										borderColor: startTorrent ? 'var(--accent)' : 'var(--border)',
										backgroundColor: startTorrent ? 'var(--accent)' : 'transparent',
									}}
								>
									{startTorrent && (
										<svg className="w-2.5 h-2.5" style={{ color: 'var(--accent-contrast)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									)}
								</div>
								<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Start torrent</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={sequential}
									onChange={(e) => setSequential(e.target.checked)}
									className="sr-only peer"
								/>
								<div
									className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
									style={{
										borderColor: sequential ? 'var(--accent)' : 'var(--border)',
										backgroundColor: sequential ? 'var(--accent)' : 'transparent',
									}}
								>
									{sequential && (
										<svg className="w-2.5 h-2.5" style={{ color: 'var(--accent-contrast)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									)}
								</div>
								<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sequential</span>
							</label>
						</div>

						<div className="flex gap-3 pt-2">
							<button
								type="button"
								onClick={onClose}
								className="flex-1 py-3 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
								style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={addMutation.isPending || (tab === 'link' && !url.trim()) || (tab === 'file' && !file)}
								className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
							>
								{addMutation.isPending ? 'Adding...' : 'Add Torrent'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
