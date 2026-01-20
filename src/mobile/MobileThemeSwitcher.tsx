import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { MobileThemeManager } from './MobileThemeManager'

export function MobileThemeSwitcher() {
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
					className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
					style={{ backgroundColor: 'var(--bg-secondary)' }}
				>
					<svg
						className="w-5 h-5"
						style={{ color: 'var(--text-muted)' }}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
						/>
					</svg>
				</button>
				{open && (
					<>
						<div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
						<div
							className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border shadow-xl overflow-hidden"
							style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
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
									<div className="border-t border-[var(--border)]" />
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
							<div className="border-t border-[var(--border)]" />
							<button
								onClick={() => {
									setOpen(false)
									setShowManager(true)
								}}
								className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium active:bg-[var(--bg-tertiary)] transition-colors"
								style={{ color: 'var(--text-secondary)' }}
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
					</>
				)}
			</div>

			{showManager && <MobileThemeManager onClose={() => setShowManager(false)} />}
		</>
	)
}

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
			className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--bg-tertiary)]"
			style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
		>
			<div className="flex gap-1">
				<div
					className="w-3 h-3 rounded-full"
					style={{ backgroundColor: t.colors.bgPrimary, border: '1px solid var(--border)' }}
				/>
				<div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.accent }} />
				<div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.warning }} />
			</div>
			<span className="text-sm font-medium flex-1">{t.name}</span>
			{isActive && (
				<svg
					className="w-4 h-4"
					style={{ color: 'var(--accent)' }}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2.5}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
				</svg>
			)}
		</button>
	)
}
