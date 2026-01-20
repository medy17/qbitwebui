import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { generateThemeColors, isValidHex } from '../utils/colorUtils'
import type { Theme } from '../themes'

interface ThemeCreatorProps {
    onSave: (theme: Theme) => void
    onClose: () => void
    /** Pre-populate the form with this theme's values */
    initialTheme?: Theme
    /** If provided, we're editing this custom theme (will update in place) */
    editingId?: string
    /** Names of existing themes (for uniqueness validation) */
    existingNames?: string[]
}

export function ThemeCreator({ onSave, onClose, initialTheme, editingId, existingNames = [] }: ThemeCreatorProps) {
    const [name, setName] = useState(initialTheme?.name ?? 'My Custom Theme')
    const [bgPrimary, setBgPrimary] = useState(initialTheme?.colors.bgPrimary ?? '#1e1e2e')
    const [accent, setAccent] = useState(initialTheme?.colors.accent ?? '#cba6f7')
    const [textPrimary, setTextPrimary] = useState(initialTheme?.colors.textPrimary ?? '#cdd6f4')
    const [warning, setWarning] = useState(initialTheme?.colors.warning ?? '#f7b731')

    // Live preview of the generated theme
    const previewColors = useMemo(() => {
        if (isValidHex(bgPrimary) && isValidHex(accent) && isValidHex(textPrimary) && isValidHex(warning)) {
            return generateThemeColors(bgPrimary, accent, textPrimary, warning)
        }
        return null
    }, [bgPrimary, accent, textPrimary, warning])

    // Check if name is already taken (exclude current theme if editing)
    const isNameTaken = useMemo(() => {
        const trimmed = name.trim().toLowerCase()
        return existingNames.some((n) => {
            // If editing, allow keeping the same name
            if (editingId && initialTheme?.name.toLowerCase() === trimmed) return false
            return n.toLowerCase() === trimmed
        })
    }, [name, existingNames, editingId, initialTheme?.name])

    const handleSave = () => {
        if (!previewColors || !name.trim() || isNameTaken) return

        onSave({
            // Keep existing ID if editing, otherwise generate new
            id: editingId ?? `custom-${Date.now()}`,
            name: name.trim(),
            colors: previewColors,
        })
    }

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-tertiary)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create Custom Theme</h2>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Controls */}
                    <div className="w-1/2 p-6 overflow-y-auto border-r border-[var(--border)] space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] flex justify-between">
                                <span>Theme Name</span>
                                <span className="text-[var(--text-muted)]">{name.length}/20</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    // Sanitize: allow alphanumeric, spaces, hyphens, underscores
                                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s\-_]/g, '')
                                    setName(sanitized.slice(0, 20))
                                }}
                                maxLength={20}
                                className="w-full px-3 py-2 bg-[var(--bg-primary)] border rounded-lg text-[var(--text-primary)] focus:outline-none"
                                style={{ borderColor: isNameTaken ? 'var(--error)' : 'var(--border)' }}
                            />
                            {isNameTaken && (
                                <p className="text-xs text-[var(--error)]">A theme with this name already exists</p>
                            )}
                        </div>

                        {/* Manual Hex Inputs */}
                        <div className="space-y-4">
                            {[
                                { label: 'Background Color', val: bgPrimary, set: setBgPrimary },
                                { label: 'Accent Color', val: accent, set: setAccent },
                                { label: 'Text Color', val: textPrimary, set: setTextPrimary },
                                { label: 'Warning Color', val: warning, set: setWarning }
                            ].map((field) => (
                                <div key={field.label} className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">{field.label}</label>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg border border-[var(--border)] shadow-sm"
                                            style={{ backgroundColor: isValidHex(field.val) ? field.val : 'transparent' }}
                                        />
                                        <input
                                            type="text"
                                            value={field.val}
                                            onChange={(e) => field.set(e.target.value)}
                                            className="flex-1 px-3 py-2 font-mono text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="w-1/2 p-6 bg-[var(--bg-tertiary)] flex flex-col">
                        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Live Preview</h3>

                        {previewColors ? (
                            <div
                                className="flex-1 rounded-xl p-6 border shadow-lg space-y-6 overflow-hidden relative"
                                style={{
                                    backgroundColor: previewColors.bgPrimary,
                                    borderColor: previewColors.border
                                }}
                            >
                                {/* Mock UI */}
                                <div className="flex justify-between items-center">
                                    <div className="text-xl font-bold" style={{ color: previewColors.textPrimary }}>
                                        {name || 'Theme Name'}
                                    </div>
                                    <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: previewColors.accent, color: previewColors.accentContrast }}>
                                        Badge
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-2 rounded w-3/4" style={{ backgroundColor: previewColors.bgSecondary }} />
                                    <div className="h-2 rounded w-1/2" style={{ backgroundColor: previewColors.bgSecondary }} />
                                </div>

                                <div className="p-4 rounded-lg border" style={{ backgroundColor: previewColors.bgSecondary, borderColor: previewColors.border }}>
                                    <div className="text-sm mb-2" style={{ color: previewColors.textSecondary }}>Secondary Card</div>
                                    <button className="w-full py-2 rounded-md font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: previewColors.accent, color: previewColors.accentContrast }}>
                                        Action Button
                                    </button>
                                </div>

                                {/* Color Palette Strip */}
                                <div className="flex gap-2 mt-auto pt-4 border-t" style={{ borderColor: previewColors.border }}>
                                    {Object.entries(previewColors).slice(0, 5).map(([key, col]) => (
                                        <div key={key} className="flex-1 h-8 rounded" style={{ backgroundColor: col }} title={key} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
                                Invalid Colors
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--bg-tertiary)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!previewColors || !name.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Theme
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
