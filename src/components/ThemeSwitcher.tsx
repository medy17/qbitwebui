import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { ThemeCreator } from './ThemeCreator'
import type { Theme } from '../themes'

export function ThemeSwitcher() {
	const { theme, setTheme, themes, customThemes, deleteTheme, addTheme, updateTheme } = useTheme()
	const [open, setOpen] = useState(false)
	const [showCreator, setShowCreator] = useState(false)
	// Track which theme we're editing (null = creating new)
	const [editingTheme, setEditingTheme] = useState<{ theme: Theme; isCustom: boolean } | null>(null)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<>
			<div ref={ref} className="relative">
				<button
					onClick={() => setOpen(!open)}
					className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors"
					style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
				>
					<div className="w-3 h-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: theme.colors.accent }} />
					<span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
						{theme.name}
					</span>
					<svg
						className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
						style={{ color: 'var(--text-muted)' }}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				</button>

				{open && (
					<div
						className="absolute top-full right-0 mt-2 w-48 py-1 rounded-lg border shadow-xl z-[100] max-h-[80vh] overflow-y-auto"
						style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
					>
						{/* Official Themes */}
						<div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50 select-none text-[var(--text-muted)]">
							Official
						</div>
						{themes.map((t) => (
							<div key={t.id} className="relative group">
								<button
									onClick={() => {
										setTheme(t.id)
										setOpen(false)
									}}
									className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
									style={{
										backgroundColor:
											theme.id === t.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
										color: theme.id === t.id ? 'var(--accent)' : 'var(--text-secondary)',
									}}
								>
									<div className="flex gap-1 shrink-0">
										<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.bgPrimary }} />
										<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.accent }} />
										<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.warning }} />
									</div>
									<span className="text-xs font-medium truncate">{t.name}</span>
									{theme.id === t.id && (
										<svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									)}
								</button>
								{/* Edit button for official themes (opens as preset) */}
								<button
									onClick={(e) => {
										e.stopPropagation()
										setOpen(false)
										setEditingTheme({ theme: t, isCustom: false })
										setShowCreator(true)
									}}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-tertiary)] rounded shadow-sm"
									title="Use as preset"
								>
									<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
								</button>
							</div>
						))}

						{/* Custom Themes Section */}
						<div className="my-1 border-t border-[var(--border)]" />

						{customThemes.length > 0 && (
							<>
								<div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50 select-none text-[var(--text-muted)]">
									Custom
								</div>
								{customThemes.map((t) => (
									<div key={t.id} className="relative group/item">
										<button
											onClick={() => {
												setTheme(t.id)
												setOpen(false)
											}}
											className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
											style={{
												backgroundColor:
													theme.id === t.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
												color: theme.id === t.id ? 'var(--accent)' : 'var(--text-secondary)',
											}}
										>
											<div className="flex gap-1 shrink-0">
												<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.bgPrimary }} />
												<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.accent }} />
												<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.warning }} />
											</div>
											<span className="text-xs font-medium truncate">{t.name}</span>
											{theme.id === t.id && (
												<svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
												</svg>
											)}
										</button>
										{/* Edit Button */}
										<button
											onClick={(e) => {
												e.stopPropagation()
												setOpen(false)
												setEditingTheme({ theme: t, isCustom: true })
												setShowCreator(true)
											}}
											className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover/item:opacity-100 transition-opacity bg-[var(--bg-tertiary)] rounded shadow-sm"
											title="Edit Theme"
										>
											<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
											</svg>
										</button>
										{/* Delete Button */}
										<button
											onClick={(e) => {
												e.stopPropagation()
												deleteTheme(t.id)
											}}
											className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--error)] opacity-0 group-hover/item:opacity-100 transition-opacity bg-[var(--bg-tertiary)] rounded shadow-sm"
											title="Delete Theme"
										>
											<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								))}
							</>
						)}

						<button
							onClick={() => {
								setOpen(false)
								setShowCreator(true)
							}}
							className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[var(--accent)] hover:bg-[var(--bg-primary)] transition-colors"
						>
							<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Make Theme
						</button>
					</div>
				)}
			</div>

			{showCreator && (
				<ThemeCreator
					onClose={() => {
						setShowCreator(false)
						setEditingTheme(null)
					}}
					initialTheme={editingTheme?.theme}
					editingId={editingTheme?.isCustom ? editingTheme.theme.id : undefined}
					existingNames={[...themes.map((t) => t.name), ...customThemes.map((t) => t.name)]}
					onSave={(savedTheme) => {
						if (editingTheme?.isCustom) {
							updateTheme(savedTheme)
						} else {
							addTheme(savedTheme)
						}
						setShowCreator(false)
						setEditingTheme(null)
					}}
				/>
			)}
		</>
	)
}
