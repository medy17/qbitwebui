import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'
import type { Theme } from '../themes'

extend([mixPlugin])

export function generateThemeColors(
	base: string,
	accent: string,
	text: string,
	warning: string = '#f7b731'
): Theme['colors'] {
	const baseColor = colord(base)
	const isDark = baseColor.isDark()
	const modifier = isDark ? 1 : -1

	// Function to generate variants
	// If dark theme: lighten (positive)
	// If light theme: darken (negative)
	const variant = (ratio: number) => baseColor.lighten(ratio * modifier).toHex()

	const textColor = colord(text)

	return {
		bgPrimary: base,
		bgSecondary: variant(0.04),
		bgTertiary: variant(0.08),

		textPrimary: text,
		// Using mix with background for solid colors usually looks better than opacity for text
		// consistent with existing themes which use hex codes
		textSecondary: textColor.mix(base, 0.3).toHex(),
		textMuted: textColor.mix(base, 0.5).toHex(),

		accent: accent,
		accentContrast: colord(accent).isDark() ? '#ffffff' : '#000000',

		warning: warning,
		error: '#f43f5e',

		border: variant(0.15),
		progress: accent,
	}
}

export function isValidHex(hex: string): boolean {
	return colord(hex).isValid()
}
