import { useEffect, useState, type ReactNode } from 'react'
import { themes, getThemeById } from '../themes'
import { ThemeContext } from './ThemeContext'

const STORAGE_KEY = 'qbitwebui-theme'

function applyTheme(colors: typeof themes[0]['colors']) {
	const root = document.documentElement
	root.style.setProperty('--bg-primary', colors.bgPrimary)
	root.style.setProperty('--bg-secondary', colors.bgSecondary)
	root.style.setProperty('--bg-tertiary', colors.bgTertiary)
	root.style.setProperty('--text-primary', colors.textPrimary)
	root.style.setProperty('--text-secondary', colors.textSecondary)
	root.style.setProperty('--text-muted', colors.textMuted)
	root.style.setProperty('--accent', colors.accent)
	root.style.setProperty('--accent-contrast', colors.accentContrast)
	root.style.setProperty('--warning', colors.warning)
	root.style.setProperty('--error', colors.error)
	root.style.setProperty('--border', colors.border)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState(() => {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored ? getThemeById(stored) : themes[0]
	})

	useEffect(() => {
		applyTheme(theme.colors)
	}, [theme])

	function setTheme(id: string) {
		const newTheme = getThemeById(id)
		setThemeState(newTheme)
		localStorage.setItem(STORAGE_KEY, id)
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, themes }}>
			{children}
		</ThemeContext.Provider>
	)
}
