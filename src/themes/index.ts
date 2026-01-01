export interface Theme {
	id: string
	name: string
	colors: {
		bgPrimary: string
		bgSecondary: string
		bgTertiary: string
		textPrimary: string
		textSecondary: string
		textMuted: string
		accent: string
		accentContrast: string
		warning: string
		error: string
		border: string
	}
}

export const themes: Theme[] = [
	{
		id: 'default',
		name: 'Midnight',
		colors: {
			bgPrimary: '#07070a',
			bgSecondary: '#0a0a0f',
			bgTertiary: '#0e0e14',
			textPrimary: '#e8e8ed',
			textSecondary: '#b8b8c8',
			textMuted: '#8a8a9e',
			accent: '#00d4aa',
			accentContrast: '#070a09',
			warning: '#f7b731',
			error: '#f43f5e',
			border: '#ffffff12',
		},
	},
	{
		id: 'catppuccin',
		name: 'Catppuccin',
		colors: {
			bgPrimary: '#1e1e2e',
			bgSecondary: '#181825',
			bgTertiary: '#313244',
			textPrimary: '#cdd6f4',
			textSecondary: '#bac2de',
			textMuted: '#9399b2',
			accent: '#cba6f7',
			accentContrast: '#1e1e2e',
			warning: '#f9e2af',
			error: '#f38ba8',
			border: '#45475a',
		},
	},
	{
		id: 'dracula',
		name: 'Dracula',
		colors: {
			bgPrimary: '#282a36',
			bgSecondary: '#21222c',
			bgTertiary: '#343746',
			textPrimary: '#f8f8f2',
			textSecondary: '#d0d0d8',
			textMuted: '#8b95c9',
			accent: '#bd93f9',
			accentContrast: '#21222c',
			warning: '#f1fa8c',
			error: '#ff5555',
			border: '#44475a',
		},
	},
	{
		id: 'nord',
		name: 'Nord',
		colors: {
			bgPrimary: '#2e3440',
			bgSecondary: '#292e39',
			bgTertiary: '#3b4252',
			textPrimary: '#eceff4',
			textSecondary: '#d8dee9',
			textMuted: '#8b92a8',
			accent: '#88c0d0',
			accentContrast: '#2e3440',
			warning: '#ebcb8b',
			error: '#bf616a',
			border: '#434c5e',
		},
	},
	{
		id: 'gruvbox',
		name: 'Gruvbox',
		colors: {
			bgPrimary: '#1d2021',
			bgSecondary: '#282828',
			bgTertiary: '#3c3836',
			textPrimary: '#ebdbb2',
			textSecondary: '#d5c4a1',
			textMuted: '#a89984',
			accent: '#fe8019',
			accentContrast: '#1d2021',
			warning: '#fabd2f',
			error: '#fb4934',
			border: '#504945',
		},
	},
]

export function getThemeById(id: string): Theme {
	return themes.find((t) => t.id === id) ?? themes[0]
}
