import { useEffect, useState, type ReactNode } from 'react'
import { themes, type Theme } from '../themes'
import { ThemeContext } from './ThemeContext'

const STORAGE_KEY = 'qbitwebui-theme'
const CUSTOM_THEMES_KEY = 'qbitwebui-custom-themes'

function applyTheme(colors: (typeof themes)[0]['colors']) {
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
	root.style.setProperty('--progress', colors.progress)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
		const stored = localStorage.getItem(CUSTOM_THEMES_KEY)
		return stored ? JSON.parse(stored) : []
	})

	const [theme, setThemeState] = useState(() => {
		const stored = localStorage.getItem(STORAGE_KEY)
		// Check standard themes first
		let found = themes.find((t) => t.id === stored)
		// Then check custom themes
		if (!found && stored) {
			const storedCustom = localStorage.getItem(CUSTOM_THEMES_KEY)
			if (storedCustom) {
				const customs = JSON.parse(storedCustom) as Theme[]
				found = customs.find((t) => t.id === stored)
			}
		}
		return found ?? themes[0]
	})

	useEffect(() => {
		applyTheme(theme.colors)
	}, [theme])

	function setTheme(id: string) {
		const st = themes.find((t) => t.id === id) ?? customThemes.find((t) => t.id === id)
		if (st) {
			setThemeState(st)
			localStorage.setItem(STORAGE_KEY, id)
		}
	}

	function addTheme(newTheme: Theme) {
		setCustomThemes((prev) => {
			const next = [...prev, newTheme]
			localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(next))
			return next
		})
		setTheme(newTheme.id)
	}

	function deleteTheme(id: string) {
		setCustomThemes((prev) => {
			const next = prev.filter((t) => t.id !== id)
			localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(next))
			return next
		})
		if (theme.id === id) {
			setTheme(themes[0].id)
		}
	}

	function updateTheme(updatedTheme: Theme) {
		setCustomThemes((prev) => {
			const next = prev.map((t) => (t.id === updatedTheme.id ? updatedTheme : t))
			localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(next))
			return next
		})
		// If the updated theme is currently active, re-apply it
		if (theme.id === updatedTheme.id) {
			setThemeState(updatedTheme)
		}
	}

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme,
				themes,
				customThemes,
				addTheme,
				updateTheme,
				deleteTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
