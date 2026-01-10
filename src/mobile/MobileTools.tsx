import { useState, useEffect } from 'react'
import { type Instance } from '../api/instances'
import { MobileSearchPanel } from './MobileSearchPanel'
import { MobileFileBrowser } from './MobileFileBrowser'
import { MobileOrphanManager } from './MobileOrphanManager'
import { MobileRSSManager } from './MobileRSSManager'

type Tool = 'search' | 'files' | 'orphans' | 'rss' | null

interface Props {
	instances: Instance[]
}

export function MobileTools({ instances }: Props) {
	const [activeTool, setActiveTool] = useState<Tool>(null)
	const [filesEnabled, setFilesEnabled] = useState(false)

	useEffect(() => {
		fetch('/api/config')
			.then(r => r.json())
			.then(c => setFilesEnabled(c.filesEnabled))
			.catch(() => {})
	}, [])

	if (activeTool === 'search') {
		return <MobileSearchPanel instances={instances} onBack={() => setActiveTool(null)} />
	}

	if (activeTool === 'files') {
		return <MobileFileBrowser onBack={() => setActiveTool(null)} />
	}

	if (activeTool === 'orphans') {
		return <MobileOrphanManager instances={instances} onBack={() => setActiveTool(null)} />
	}

	if (activeTool === 'rss') {
		return <MobileRSSManager instances={instances} onBack={() => setActiveTool(null)} />
	}

	return (
		<div className="p-4 space-y-3">
			<button
				onClick={() => setActiveTool('search')}
				className="w-full p-4 rounded-2xl border text-left active:scale-[0.98] transition-transform"
				style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
			>
				<div className="flex items-start gap-4">
					<div
						className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
						style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
					>
						<svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Prowlarr Search</h3>
						<p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
							Search indexers and grab releases
						</p>
					</div>
					<svg className="w-5 h-5 mt-1 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</div>
			</button>

			{filesEnabled && (
				<button
					onClick={() => setActiveTool('files')}
					className="w-full p-4 rounded-2xl border text-left active:scale-[0.98] transition-transform"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<div className="flex items-start gap-4">
						<div
							className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
							style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)' }}
						>
							<svg className="w-6 h-6" style={{ color: 'var(--warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
							</svg>
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>File Browser</h3>
							<p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
								Browse, download, and manage files
							</p>
						</div>
						<svg className="w-5 h-5 mt-1 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</div>
				</button>
			)}

			<button
				onClick={() => setActiveTool('orphans')}
				className="w-full p-4 rounded-2xl border text-left active:scale-[0.98] transition-transform"
				style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
			>
				<div className="flex items-start gap-4">
					<div
						className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
						style={{ backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)' }}
					>
						<svg className="w-6 h-6" style={{ color: 'var(--error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Orphan Manager</h3>
						<p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
							Find torrents with missing files
						</p>
					</div>
					<svg className="w-5 h-5 mt-1 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</div>
			</button>

			<button
				onClick={() => setActiveTool('rss')}
				className="w-full p-4 rounded-2xl border text-left active:scale-[0.98] transition-transform"
				style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
			>
				<div className="flex items-start gap-4">
					<div
						className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
						style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
					>
						<svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>RSS Manager</h3>
						<p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
							Manage feeds and auto-download rules
						</p>
					</div>
					<svg className="w-5 h-5 mt-1 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</div>
			</button>
		</div>
	)
}
