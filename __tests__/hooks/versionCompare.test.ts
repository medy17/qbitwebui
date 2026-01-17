import { describe, it, expect } from 'vitest'

// Extract and test the version comparison logic from useUpdateCheck
// Since the compareVersions function is not exported, we recreate it for testing
function compareVersions(current: string, latest: string): number {
    const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number)
    const [c, l] = [parse(current), parse(latest)]
    for (let i = 0; i < Math.max(c.length, l.length); i++) {
        const diff = (l[i] ?? 0) - (c[i] ?? 0)
        if (diff !== 0) return diff
    }
    return 0
}

describe('version comparison logic', () => {
    describe('compareVersions', () => {
        it('returns 0 for identical versions', () => {
            expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
            expect(compareVersions('2.5.3', '2.5.3')).toBe(0)
        })

        it('returns positive when latest is newer (major)', () => {
            expect(compareVersions('1.0.0', '2.0.0')).toBeGreaterThan(0)
            expect(compareVersions('1.5.3', '2.0.0')).toBeGreaterThan(0)
        })

        it('returns positive when latest is newer (minor)', () => {
            expect(compareVersions('1.0.0', '1.1.0')).toBeGreaterThan(0)
            expect(compareVersions('2.3.0', '2.5.0')).toBeGreaterThan(0)
        })

        it('returns positive when latest is newer (patch)', () => {
            expect(compareVersions('1.0.0', '1.0.1')).toBeGreaterThan(0)
            expect(compareVersions('1.2.5', '1.2.10')).toBeGreaterThan(0)
        })

        it('returns negative when current is newer', () => {
            expect(compareVersions('2.0.0', '1.0.0')).toBeLessThan(0)
            expect(compareVersions('1.5.0', '1.4.0')).toBeLessThan(0)
            expect(compareVersions('1.0.5', '1.0.4')).toBeLessThan(0)
        })

        it('handles versions with v prefix', () => {
            expect(compareVersions('v1.0.0', 'v1.0.0')).toBe(0)
            expect(compareVersions('v1.0.0', '1.0.0')).toBe(0)
            expect(compareVersions('1.0.0', 'v2.0.0')).toBeGreaterThan(0)
        })

        it('handles different version lengths', () => {
            expect(compareVersions('1.0', '1.0.0')).toBe(0)
            expect(compareVersions('1.0', '1.0.1')).toBeGreaterThan(0)
            expect(compareVersions('1.0.0', '1.1')).toBeGreaterThan(0)
        })

        it('handles real-world version bumps', () => {
            expect(compareVersions('2.33.0', '2.33.1')).toBeGreaterThan(0)
            expect(compareVersions('2.33.0', '2.34.0')).toBeGreaterThan(0)
            expect(compareVersions('2.33.0', '3.0.0')).toBeGreaterThan(0)
        })

        it('correctly identifies no update needed', () => {
            // Current is same or newer than latest
            expect(compareVersions('2.33.0', '2.33.0')).toBe(0)
            expect(compareVersions('2.34.0', '2.33.0')).toBeLessThan(0)
        })
    })

    describe('version parsing edge cases', () => {
        it('handles single digit versions', () => {
            expect(compareVersions('1', '2')).toBeGreaterThan(0)
            expect(compareVersions('1', '1')).toBe(0)
        })

        it('handles two part versions', () => {
            expect(compareVersions('1.0', '1.1')).toBeGreaterThan(0)
            expect(compareVersions('2.0', '1.9')).toBeLessThan(0)
        })

        it('handles four part versions', () => {
            expect(compareVersions('1.0.0.0', '1.0.0.1')).toBeGreaterThan(0)
        })
    })
})
