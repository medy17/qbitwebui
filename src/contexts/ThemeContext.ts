import { createContext } from 'react'
import type { Theme } from '../themes'

export interface ThemeContextValue {
	theme: Theme
	setTheme: (id: string) => void
	themes: Theme[]
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
