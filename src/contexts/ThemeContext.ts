import { createContext } from 'react'
import type { Theme } from '../themes'

export interface ThemeContextValue {
	theme: Theme
	setTheme: (id: string) => void
	themes: Theme[]
	customThemes: Theme[]
	addTheme: (theme: Theme) => void
	updateTheme: (theme: Theme) => void
	deleteTheme: (id: string) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
