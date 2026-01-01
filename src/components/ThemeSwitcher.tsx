import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'

export function ThemeSwitcher() {
	const { theme, setTheme, themes } = useTheme()
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors"
				style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
			>
				<div
					className="w-3 h-3 rounded-full ring-1 ring-white/20"
					style={{ backgroundColor: theme.colors.accent }}
				/>
				<span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{theme.name}</span>
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
					className="absolute top-full right-0 mt-2 w-44 py-1 rounded-lg border shadow-xl z-[100]"
					style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
				>
					{themes.map((t) => (
						<button
							key={t.id}
							onClick={() => { setTheme(t.id); setOpen(false) }}
							className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
							style={{
								backgroundColor: theme.id === t.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
								color: theme.id === t.id ? 'var(--accent)' : 'var(--text-secondary)',
							}}
						>
							<div className="flex gap-1">
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: t.colors.bgPrimary }}
								/>
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: t.colors.accent }}
								/>
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: t.colors.warning }}
								/>
							</div>
							<span className="text-xs font-medium">{t.name}</span>
							{theme.id === t.id && (
								<svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
								</svg>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
