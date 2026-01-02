import { useState, useRef, useEffect, type ReactNode } from 'react'
import type { TorrentFilter } from '../types/qbittorrent'
import type { Category } from '../api/qbittorrent'
import type { ColumnDef } from './columns'

const filters: { value: TorrentFilter; label: string; icon: ReactNode }[] = [
	{
		value: 'all',
		label: 'All',
		icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
	},
	{
		value: 'downloading',
		label: 'Downloading',
		icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
	},
	{
		value: 'seeding',
		label: 'Seeding',
		icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
	},
	{
		value: 'completed',
		label: 'Completed',
		icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
	},
	{
		value: 'stopped',
		label: 'Stopped',
		icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />,
	},
	{
		value: 'active',
		label: 'Active',
		icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
	},
]

interface Props {
	filter: TorrentFilter
	onFilterChange: (f: TorrentFilter) => void
}

export function FilterBar({ filter, onFilterChange }: Props) {
	return (
		<>
			{filters.map((f) => (
				<button
					key={f.value}
					onClick={() => onFilterChange(f.value)}
					className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
					style={{
						color: filter === f.value ? 'var(--accent-contrast)' : 'var(--text-muted)',
					}}
				>
					{filter === f.value && (
						<div className="absolute inset-0 rounded-lg shadow-lg" style={{ background: 'linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 80%, black))', boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 20%, transparent)' }} />
					)}
					<svg className="relative w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						{f.icon}
					</svg>
					<span className="relative">{f.label}</span>
				</button>
			))}
		</>
	)
}

export function SearchInput({ value, onChange }: { value: string; onChange: (s: string) => void }) {
	return (
		<div className="relative">
			<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
			</svg>
			<input
				type="text"
				placeholder="Search torrents..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-64 pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200"
				style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
			/>
		</div>
	)
}

interface DropdownProps<T extends string> {
	value: T | null
	onChange: (v: T | null) => void
	options: { value: T; label: string; count?: number }[]
	placeholder: string
	icon: ReactNode
}

function Dropdown<T extends string>({ value, onChange, options, placeholder, icon }: DropdownProps<T>) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const selected = options.find((o) => o.value === value)

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
				style={{
					color: value ? 'var(--accent)' : 'var(--text-muted)',
					backgroundColor: value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
				}}
			>
				<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					{icon}
				</svg>
				<span className="max-w-[100px] truncate">{selected?.label ?? placeholder}</span>
				<svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			{open && (
				<div
					className="absolute top-full left-0 mt-1 min-w-[180px] max-h-[300px] overflow-auto rounded-lg border shadow-xl z-[100]"
					style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
				>
					<button
						onClick={() => { onChange(null); setOpen(false) }}
						className="w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors"
						style={{
							color: !value ? 'var(--accent)' : 'var(--text-muted)',
							backgroundColor: !value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
						}}
					>
						<span>All</span>
					</button>
					{options.map((o) => (
						<button
							key={o.value}
							onClick={() => { onChange(o.value); setOpen(false) }}
							className="w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors"
							style={{
								color: value === o.value ? 'var(--accent)' : 'var(--text-muted)',
								backgroundColor: value === o.value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
							}}
						>
							<span className="truncate">{o.label}</span>
							{o.count !== undefined && <span style={{ color: 'var(--text-muted)' }} className="ml-2">{o.count}</span>}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

interface CategoryDropdownProps {
	value: string | null
	onChange: (v: string | null) => void
	categories: Record<string, Category>
	onCreate?: (name: string) => void
	onDelete?: (name: string) => void
}

export function CategoryDropdown({ value, onChange, categories, onCreate, onDelete }: CategoryDropdownProps) {
	const [open, setOpen] = useState(false)
	const [creating, setCreating] = useState(false)
	const [newName, setNewName] = useState('')
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
				setCreating(false)
				setNewName('')
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	function handleCreate() {
		if (newName.trim() && onCreate) {
			onCreate(newName.trim())
			setNewName('')
			setCreating(false)
		}
	}

	const names = Object.keys(categories)
	const selected = names.find((n) => n === value)

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
				style={{
					color: value ? 'var(--accent)' : 'var(--text-muted)',
					backgroundColor: value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
				}}
			>
				<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
				</svg>
				<span className="max-w-[100px] truncate">{selected ?? 'Category'}</span>
				<svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			{open && (
				<div className="absolute top-full left-0 mt-1 min-w-[180px] max-h-[300px] overflow-auto rounded-lg border shadow-xl z-[100]" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
					<button
						onClick={() => { onChange(null); setOpen(false) }}
						className="w-full flex items-center px-3 py-2 text-xs text-left transition-colors"
						style={{ color: !value ? 'var(--accent)' : 'var(--text-muted)', backgroundColor: !value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent' }}
					>
						All
					</button>
					{names.map((name) => (
						<div key={name} className="group flex items-center">
							<button
								onClick={() => { onChange(name); setOpen(false) }}
								className="flex-1 px-3 py-2 text-xs text-left transition-colors truncate"
								style={{ color: value === name ? 'var(--accent)' : 'var(--text-muted)', backgroundColor: value === name ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent' }}
							>
								{name}
							</button>
							{onDelete && (
								<button
									onClick={(e) => { e.stopPropagation(); onDelete(name); if (value === name) onChange(null) }}
									className="opacity-0 group-hover:opacity-100 px-2 py-2 transition-opacity"
									style={{ color: 'var(--error)' }}
								>
									<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
						</div>
					))}
					{onCreate && (
						<div className="border-t" style={{ borderColor: 'var(--border)' }}>
							{creating ? (
								<div className="flex items-center gap-1 p-1.5">
									<input
										type="text"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
										placeholder="Name"
										className="flex-1 px-2 py-1 rounded text-xs border"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
										autoFocus
									/>
									<button onClick={handleCreate} className="p-1 rounded" style={{ color: 'var(--accent)' }}>
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									</button>
								</div>
							) : (
								<button onClick={() => setCreating(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs" style={{ color: 'var(--accent)' }}>
									<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
									</svg>
									New category
								</button>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}

interface TagDropdownProps {
	value: string | null
	onChange: (v: string | null) => void
	tags: string[]
	onCreate?: (name: string) => void
	onDelete?: (name: string) => void
}

export function TagDropdown({ value, onChange, tags, onCreate, onDelete }: TagDropdownProps) {
	const [open, setOpen] = useState(false)
	const [creating, setCreating] = useState(false)
	const [newName, setNewName] = useState('')
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
				setCreating(false)
				setNewName('')
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	function handleCreate() {
		if (newName.trim() && onCreate) {
			onCreate(newName.trim())
			setNewName('')
			setCreating(false)
		}
	}

	const selected = tags.find((t) => t === value)

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
				style={{
					color: value ? 'var(--accent)' : 'var(--text-muted)',
					backgroundColor: value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
				}}
			>
				<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
				</svg>
				<span className="max-w-[100px] truncate">{selected ?? 'Tag'}</span>
				<svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			{open && (
				<div className="absolute top-full left-0 mt-1 min-w-[180px] max-h-[300px] overflow-auto rounded-lg border shadow-xl z-[100]" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
					<button
						onClick={() => { onChange(null); setOpen(false) }}
						className="w-full flex items-center px-3 py-2 text-xs text-left transition-colors"
						style={{ color: !value ? 'var(--accent)' : 'var(--text-muted)', backgroundColor: !value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent' }}
					>
						All
					</button>
					{tags.map((tag) => (
						<div key={tag} className="group flex items-center">
							<button
								onClick={() => { onChange(tag); setOpen(false) }}
								className="flex-1 px-3 py-2 text-xs text-left transition-colors truncate"
								style={{ color: value === tag ? 'var(--accent)' : 'var(--text-muted)', backgroundColor: value === tag ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent' }}
							>
								{tag}
							</button>
							{onDelete && (
								<button
									onClick={(e) => { e.stopPropagation(); onDelete(tag); if (value === tag) onChange(null) }}
									className="opacity-0 group-hover:opacity-100 px-2 py-2 transition-opacity"
									style={{ color: 'var(--error)' }}
								>
									<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
						</div>
					))}
					{onCreate && (
						<div className="border-t" style={{ borderColor: 'var(--border)' }}>
							{creating ? (
								<div className="flex items-center gap-1 p-1.5">
									<input
										type="text"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
										placeholder="Name"
										className="flex-1 px-2 py-1 rounded text-xs border"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
										autoFocus
									/>
									<button onClick={handleCreate} className="p-1 rounded" style={{ color: 'var(--accent)' }}>
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									</button>
								</div>
							) : (
								<button onClick={() => setCreating(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs" style={{ color: 'var(--accent)' }}>
									<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
									</svg>
									New tag
								</button>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}

interface TrackerDropdownProps {
	value: string | null
	onChange: (v: string | null) => void
	trackers: string[]
}

export function TrackerDropdown({ value, onChange, trackers }: TrackerDropdownProps) {
	const options = trackers.map((t) => {
		try {
			const url = new URL(t)
			return { value: t, label: url.hostname }
		} catch {
			return { value: t, label: t }
		}
	})
	return (
		<Dropdown
			value={value}
			onChange={onChange}
			options={options}
			placeholder="Tracker"
			icon={<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />}
		/>
	)
}

interface ColumnSelectorProps {
	columns: ColumnDef[]
	visible: Set<string>
	onChange: (visible: Set<string>) => void
	columnOrder: string[]
	onReorder: (order: string[]) => void
	onReset: () => void
}

export function ColumnSelector({ columns, visible, onChange, columnOrder, onReorder, onReset }: ColumnSelectorProps) {
	const [open, setOpen] = useState(false)
	const [draggedId, setDraggedId] = useState<string | null>(null)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	function toggle(id: string) {
		const next = new Set(visible)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		onChange(next)
	}

	function handleDragStart(e: React.DragEvent, id: string) {
		setDraggedId(id)
		e.dataTransfer.effectAllowed = 'move'
	}

	function handleDragOver(e: React.DragEvent, targetId: string) {
		e.preventDefault()
		if (!draggedId || draggedId === targetId) return
		const dragIdx = columnOrder.indexOf(draggedId)
		const targetIdx = columnOrder.indexOf(targetId)
		if (dragIdx === -1 || targetIdx === -1) return
		const newOrder = [...columnOrder]
		newOrder.splice(dragIdx, 1)
		newOrder.splice(targetIdx, 0, draggedId)
		onReorder(newOrder)
	}

	function handleDragEnd() {
		setDraggedId(null)
	}

	const orderedColumns = columnOrder.map(id => columns.find(c => c.id === id)).filter((c): c is ColumnDef => c !== undefined)

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
				style={{ color: 'var(--text-muted)' }}
				title="Configure columns"
			>
				<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25v9.75m0 0h9.75" />
				</svg>
				<svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			{open && (
				<div
					className="absolute top-full right-0 mt-1 min-w-[200px] max-h-[400px] overflow-auto rounded-lg border shadow-xl z-[100]"
					style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
				>
					<div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
						<span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>Columns</span>
						<button
							onClick={() => { onReset(); setOpen(false) }}
							className="text-[10px] transition-colors hover:opacity-80"
							style={{ color: 'var(--accent)' }}
						>
							Reset
						</button>
					</div>
					{orderedColumns.map((col) => (
						<div
							key={col.id}
							draggable
							onDragStart={(e) => handleDragStart(e, col.id)}
							onDragOver={(e) => handleDragOver(e, col.id)}
							onDragEnd={handleDragEnd}
							className={`flex items-center gap-2 px-2 py-2 text-xs transition-colors hover:bg-white/5 cursor-move ${draggedId === col.id ? 'opacity-50' : ''}`}
							style={{ color: 'var(--text-primary)' }}
						>
							<svg className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
							</svg>
							<button
								onClick={() => toggle(col.id)}
								className="flex-1 flex items-center justify-between text-left"
							>
								<span>{col.label}</span>
								{visible.has(col.id) && (
									<svg className="w-3 h-3" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
									</svg>
								)}
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
