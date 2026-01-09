import { useState, useEffect, useCallback } from 'react'
import { listFiles, getDownloadUrl, checkWritable, deleteFiles, moveFiles, copyFiles, renameFile, type FileEntry } from '../api/files'
import { formatSize } from '../utils/format'

function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface Props {
	onBack: () => void
}

export function MobileFileBrowser({ onBack }: Props) {
	const [path, setPath] = useState('/')
	const [files, setFiles] = useState<FileEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [writable, setWritable] = useState(false)
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [selectionMode, setSelectionMode] = useState(false)
	const [showActionSheet, setShowActionSheet] = useState(false)
	const [showFolderPicker, setShowFolderPicker] = useState<'move' | 'copy' | null>(null)
	const [pickerPath, setPickerPath] = useState('/')
	const [pickerFolders, setPickerFolders] = useState<FileEntry[]>([])
	const [pickerLoading, setPickerLoading] = useState(false)
	const [showRenameModal, setShowRenameModal] = useState(false)
	const [renameValue, setRenameValue] = useState('')
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [actionLoading, setActionLoading] = useState(false)

	useEffect(() => {
		checkWritable().then(setWritable)
	}, [])

	const loadFiles = useCallback(async () => {
		setLoading(true)
		setError('')
		try {
			const data = await listFiles(path)
			setFiles(data)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load')
			setFiles([])
		} finally {
			setLoading(false)
		}
	}, [path])

	useEffect(() => {
		loadFiles()
		setSelected(new Set())
		setSelectionMode(false)
	}, [loadFiles])

	useEffect(() => {
		if (showFolderPicker) {
			setPickerLoading(true)
			listFiles(pickerPath)
				.then(files => setPickerFolders(files.filter(f => f.isDirectory)))
				.catch(() => setPickerFolders([]))
				.finally(() => setPickerLoading(false))
		}
	}, [showFolderPicker, pickerPath])

	function handleNavigate(name: string) {
		if (selectionMode) return
		setPath(path === '/' ? `/${name}` : `${path}/${name}`)
	}

	function handleBack() {
		const parts = path.split('/').filter(Boolean)
		parts.pop()
		setPath(parts.length ? `/${parts.join('/')}` : '/')
	}

	function getFullPath(name: string) {
		return path === '/' ? `/${name}` : `${path}/${name}`
	}

	function toggleSelect(name: string) {
		const next = new Set(selected)
		if (next.has(name)) next.delete(name)
		else next.add(name)
		setSelected(next)
		if (next.size === 0) setSelectionMode(false)
	}

	function selectAll() {
		if (selected.size === files.length) {
			setSelected(new Set())
			setSelectionMode(false)
		} else {
			setSelected(new Set(files.map(f => f.name)))
		}
	}

	function startSelection(name: string) {
		setSelectionMode(true)
		setSelected(new Set([name]))
	}

	async function handleDelete() {
		setActionLoading(true)
		setError('')
		try {
			await deleteFiles(Array.from(selected).map(getFullPath))
			setSelected(new Set())
			setSelectionMode(false)
			setShowDeleteConfirm(false)
			setShowActionSheet(false)
			await loadFiles()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Delete failed')
		} finally {
			setActionLoading(false)
		}
	}

	async function handleMoveOrCopy(destination: string) {
		const mode = showFolderPicker
		setActionLoading(true)
		setError('')
		try {
			const paths = Array.from(selected).map(getFullPath)
			if (mode === 'move') await moveFiles(paths, destination)
			else await copyFiles(paths, destination)
			setSelected(new Set())
			setSelectionMode(false)
			setShowFolderPicker(null)
			setShowActionSheet(false)
			setPickerPath('/')
			await loadFiles()
		} catch (e) {
			setError(e instanceof Error ? e.message : `${mode} failed`)
		} finally {
			setActionLoading(false)
		}
	}

	async function handleRename() {
		if (!renameValue.trim()) return
		const name = Array.from(selected)[0]
		setActionLoading(true)
		setError('')
		try {
			await renameFile(getFullPath(name), renameValue.trim())
			setSelected(new Set())
			setSelectionMode(false)
			setShowRenameModal(false)
			setShowActionSheet(false)
			await loadFiles()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Rename failed')
		} finally {
			setActionLoading(false)
		}
	}

	function openRename() {
		const name = Array.from(selected)[0]
		setRenameValue(name)
		setShowRenameModal(true)
		setShowActionSheet(false)
	}

	function openFolderPicker(mode: 'move' | 'copy') {
		setPickerPath('/')
		setShowFolderPicker(mode)
		setShowActionSheet(false)
	}

	const pathParts = path.split('/').filter(Boolean)
	const pickerPathParts = pickerPath.split('/').filter(Boolean)

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 space-y-3">
				<div className="flex items-center gap-3">
					<button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-[var(--bg-tertiary)]">
						<svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					<h2 className="text-lg font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>Files</h2>
					{selectionMode && (
						<button
							onClick={() => { setSelectionMode(false); setSelected(new Set()) }}
							className="text-sm font-medium"
							style={{ color: 'var(--accent)' }}
						>
							Cancel
						</button>
					)}
				</div>

				<div
					className="flex items-center gap-2 p-3 rounded-xl border overflow-x-auto"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<button
						onClick={handleBack}
						disabled={path === '/'}
						className="p-1.5 rounded-lg shrink-0 disabled:opacity-30"
						style={{ backgroundColor: 'var(--bg-tertiary)' }}
					>
						<svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					<div className="flex items-center text-sm overflow-x-auto scrollbar-none">
						<button
							onClick={() => setPath('/')}
							className="px-1 py-0.5 rounded shrink-0"
							style={{ color: path === '/' ? 'var(--text-primary)' : 'var(--text-muted)' }}
						>
							/
						</button>
						{pathParts.map((part, i) => (
							<div key={i} className="flex items-center shrink-0">
								<button
									onClick={() => setPath(`/${pathParts.slice(0, i + 1).join('/')}`)}
									className="px-1 py-0.5 rounded truncate max-w-[120px]"
									style={{ color: i === pathParts.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}
								>
									{part}
								</button>
								{i < pathParts.length - 1 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
							</div>
						))}
					</div>
					<button
						onClick={loadFiles}
						className="ml-auto p-1.5 rounded-lg shrink-0"
						style={{ backgroundColor: 'var(--bg-tertiary)' }}
					>
						<svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
						</svg>
					</button>
				</div>

				{error && (
					<div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)', color: 'var(--error)' }}>
						{error}
					</div>
				)}
			</div>

			<div className="flex-1 overflow-y-auto px-4 pb-4">
				{loading && files.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
					</div>
				) : files.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
							<svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
							</svg>
						</div>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>Empty folder</p>
					</div>
				) : (
					<div className="space-y-1">
						{selectionMode && writable && (
							<button
								onClick={selectAll}
								className="w-full text-left px-3 py-2 text-sm"
								style={{ color: 'var(--accent)' }}
							>
								{selected.size === files.length ? 'Deselect All' : 'Select All'}
							</button>
						)}
						{files.map((file) => (
							<div
								key={file.name}
								onClick={() => {
									if (selectionMode && writable) toggleSelect(file.name)
									else if (file.isDirectory) handleNavigate(file.name)
								}}
								onContextMenu={(e) => {
									if (writable) {
										e.preventDefault()
										startSelection(file.name)
									}
								}}
								className="flex items-center gap-3 p-3 rounded-xl active:bg-[var(--bg-tertiary)] transition-colors"
								style={{ backgroundColor: selected.has(file.name) ? 'var(--bg-tertiary)' : 'var(--bg-secondary)' }}
							>
								{selectionMode && writable && (
									<div
										className="w-5 h-5 rounded flex items-center justify-center shrink-0 border"
										style={{
											backgroundColor: selected.has(file.name) ? 'var(--accent)' : 'transparent',
											borderColor: selected.has(file.name) ? 'var(--accent)' : 'var(--text-muted)',
										}}
									>
										{selected.has(file.name) && (
											<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										)}
									</div>
								)}
								{file.isDirectory ? (
									<svg className="w-5 h-5 shrink-0" style={{ color: 'var(--warning)' }} fill="currentColor" viewBox="0 0 24 24">
										<path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
									</svg>
								) : (
									<svg className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 24 24">
										<path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V7.875L14.25 1.5H5.625z" />
									</svg>
								)}
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
										{file.name}
									</div>
									<div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
										{!file.isDirectory && <span>{formatSize(file.size)}</span>}
										<span>{formatDate(file.modified)}</span>
									</div>
								</div>
								{!selectionMode && (
									<a
										href={getDownloadUrl(getFullPath(file.name))}
										onClick={(e) => e.stopPropagation()}
										className="p-2 rounded-lg shrink-0"
										style={{ backgroundColor: 'var(--bg-tertiary)' }}
									>
										<svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
										</svg>
									</a>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{selectionMode && selected.size > 0 && writable && (
				<div
					className="sticky bottom-0 p-4 border-t"
					style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', paddingBottom: 'calc(70px + env(safe-area-inset-bottom, 1rem))' }}
				>
					<button
						onClick={() => setShowActionSheet(true)}
						className="w-full py-3 rounded-xl text-sm font-medium"
						style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
					>
						Actions ({selected.size} selected)
					</button>
				</div>
			)}

			{showActionSheet && (
				<>
					<div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowActionSheet(false)} />
					<div
						className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t"
						style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
					>
						<div className="flex justify-center pt-3 pb-2">
							<div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
						</div>
						<div className="px-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
							<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.size} item{selected.size > 1 ? 's' : ''} selected</h3>
						</div>
						<div className="p-4 space-y-2">
							{selected.size === 1 && (
								<button
									onClick={openRename}
									className="w-full flex items-center gap-4 px-4 py-3 rounded-xl active:bg-[var(--bg-tertiary)]"
									style={{ backgroundColor: 'var(--bg-secondary)' }}
								>
									<svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
									</svg>
									<span style={{ color: 'var(--text-primary)' }}>Rename</span>
								</button>
							)}
							<button
								onClick={() => openFolderPicker('move')}
								className="w-full flex items-center gap-4 px-4 py-3 rounded-xl active:bg-[var(--bg-tertiary)]"
								style={{ backgroundColor: 'var(--bg-secondary)' }}
							>
								<svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
								</svg>
								<span style={{ color: 'var(--text-primary)' }}>Move to...</span>
							</button>
							<button
								onClick={() => openFolderPicker('copy')}
								className="w-full flex items-center gap-4 px-4 py-3 rounded-xl active:bg-[var(--bg-tertiary)]"
								style={{ backgroundColor: 'var(--bg-secondary)' }}
							>
								<svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
								</svg>
								<span style={{ color: 'var(--text-primary)' }}>Copy to...</span>
							</button>
							<button
								onClick={() => { setShowActionSheet(false); setShowDeleteConfirm(true) }}
								className="w-full flex items-center gap-4 px-4 py-3 rounded-xl active:bg-[var(--bg-tertiary)]"
								style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, var(--bg-secondary))' }}
							>
								<svg className="w-5 h-5" style={{ color: 'var(--error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
								</svg>
								<span style={{ color: 'var(--error)' }}>Delete</span>
							</button>
						</div>
					</div>
				</>
			)}

			{showFolderPicker && (
				<>
					<div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowFolderPicker(null)} />
					<div
						className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t max-h-[80vh] flex flex-col"
						style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
					>
						<div className="flex justify-center pt-3 pb-2 shrink-0">
							<div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
						</div>
						<div className="px-5 pb-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
							<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
								{showFolderPicker === 'move' ? 'Move to' : 'Copy to'}
							</h3>
						</div>
						<div className="px-4 py-3 border-b shrink-0 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
							<div className="flex items-center text-sm">
								<button
									onClick={() => setPickerPath('/')}
									className="px-1 py-0.5 rounded shrink-0"
									style={{ color: pickerPath === '/' ? 'var(--text-primary)' : 'var(--text-muted)' }}
								>
									/
								</button>
								{pickerPathParts.map((part, i) => (
									<div key={i} className="flex items-center shrink-0">
										<button
											onClick={() => setPickerPath(`/${pickerPathParts.slice(0, i + 1).join('/')}`)}
											className="px-1 py-0.5 rounded"
											style={{ color: i === pickerPathParts.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}
										>
											{part}
										</button>
										{i < pickerPathParts.length - 1 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
									</div>
								))}
							</div>
						</div>
						<div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
							{pickerLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
								</div>
							) : pickerFolders.length === 0 ? (
								<div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
									No subfolders
								</div>
							) : (
								<div className="space-y-1">
									{pickerFolders.map((folder) => (
										<button
											key={folder.name}
											onClick={() => setPickerPath(pickerPath === '/' ? `/${folder.name}` : `${pickerPath}/${folder.name}`)}
											className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl active:bg-[var(--bg-tertiary)]"
											style={{ backgroundColor: 'var(--bg-secondary)' }}
										>
											<svg className="w-5 h-5 shrink-0" style={{ color: 'var(--warning)' }} fill="currentColor" viewBox="0 0 24 24">
												<path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
											</svg>
											<span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{folder.name}</span>
										</button>
									))}
								</div>
							)}
						</div>
						<div className="p-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
							<button
								onClick={() => handleMoveOrCopy(pickerPath)}
								disabled={actionLoading}
								className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
							>
								{actionLoading ? 'Working...' : `${showFolderPicker === 'move' ? 'Move' : 'Copy'} here`}
							</button>
						</div>
					</div>
				</>
			)}

			{showRenameModal && (
				<>
					<div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowRenameModal(false)} />
					<div
						className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl border p-5"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Rename</h3>
						<input
							type="text"
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							className="w-full px-4 py-3 rounded-xl border text-base"
							style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
							autoFocus
						/>
						<div className="flex gap-3 mt-5">
							<button
								onClick={() => setShowRenameModal(false)}
								className="flex-1 py-3 rounded-xl text-sm font-medium"
								style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
							>
								Cancel
							</button>
							<button
								onClick={handleRename}
								disabled={!renameValue.trim() || actionLoading}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
							>
								{actionLoading ? 'Renaming...' : 'Rename'}
							</button>
						</div>
					</div>
				</>
			)}

			{showDeleteConfirm && (
				<>
					<div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowDeleteConfirm(false)} />
					<div
						className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl border p-5"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Files</h3>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>
							Delete {selected.size} item{selected.size > 1 ? 's' : ''}? This cannot be undone.
						</p>
						{selected.size <= 3 && (
							<ul className="mt-3 text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
								{Array.from(selected).map(name => (
									<li key={name} className="truncate">• {name}</li>
								))}
							</ul>
						)}
						<div className="flex gap-3 mt-5">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="flex-1 py-3 rounded-xl text-sm font-medium"
								style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								disabled={actionLoading}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--error)', color: 'white' }}
							>
								{actionLoading ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
