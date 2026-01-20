import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { ThemeManager } from './ThemeManager'

export function ThemeSwitcher() {
	const { theme, setTheme, themes, customThemes } = useTheme()
	const [open, setOpen] = useState(false)
	const [showManager, setShowManager] = useState(false)
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
							<ThemeRow
								key={t.id}
								t={t}
								isActive={theme.id === t.id}
								onSelect={() => {
									setTheme(t.id)
									setOpen(false)
								}}
							/>
						))}

						{/* Custom Themes */}
						{customThemes.length > 0 && (
							<>
								<div className="my-1 border-t border-[var(--border)]" />
								<div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50 select-none text-[var(--text-muted)]">
									Custom
								</div>
								{customThemes.map((t) => (
									<ThemeRow
										key={t.id}
										t={t}
										isActive={theme.id === t.id}
										onSelect={() => {
											setTheme(t.id)
											setOpen(false)
										}}
									/>
								))}
							</>
						)}

						{/* Manage Themes */}
						<div className="my-1 border-t border-[var(--border)]" />
						<button
							onClick={() => {
								setOpen(false)
								setShowManager(true)
							}}
							className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
						>
							<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							Manage Themes
						</button>
					</div>
				)}
			</div>

			{showManager && <ThemeManager onClose={() => setShowManager(false)} />}
		</>
	)
}

// Simple theme row component
function ThemeRow({
	t,
	isActive,
	onSelect,
}: {
	t: { id: string; name: string; colors: { bgPrimary: string; accent: string; warning: string } }
	isActive: boolean
	onSelect: () => void
}) {
	return (
		<button
			onClick={onSelect}
			className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
			style={{
				backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
				color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
			}}
		>
			<div className="flex gap-1 shrink-0">
				<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.bgPrimary }} />
				<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.accent }} />
				<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colors.warning }} />
			</div>
			<span className="text-xs font-medium truncate">{t.name}</span>
			{isActive && (
				<svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
				</svg>
			)}
		</button>
	)
}
