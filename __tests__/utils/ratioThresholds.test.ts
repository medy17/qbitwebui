import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadRatioThreshold, saveRatioThreshold } from '../../src/utils/ratioThresholds'

describe('ratioThresholds', () => {
    // Mock localStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {}
        return {
            getItem: vi.fn((key: string) => store[key] ?? null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value
            }),
            clear: () => {
                store = {}
            },
        }
    })()

    beforeEach(() => {
        localStorageMock.clear()
        vi.stubGlobal('localStorage', localStorageMock)
    })

    describe('loadRatioThreshold', () => {
        it('returns default threshold (1.0) when no value stored', () => {
            expect(loadRatioThreshold()).toBe(1.0)
        })

        it('returns stored threshold when valid', () => {
            localStorageMock.setItem('ratioThreshold', '2.5')
            expect(loadRatioThreshold()).toBe(2.5)
        })

        it('returns default for invalid stored value', () => {
            localStorageMock.setItem('ratioThreshold', 'not-a-number')
            expect(loadRatioThreshold()).toBe(1.0)
        })

        it('returns default for negative stored value', () => {
            localStorageMock.setItem('ratioThreshold', '-1')
            expect(loadRatioThreshold()).toBe(1.0)
        })

        it('accepts zero as valid threshold', () => {
            localStorageMock.setItem('ratioThreshold', '0')
            expect(loadRatioThreshold()).toBe(0)
        })

        it('handles decimal values correctly', () => {
            localStorageMock.setItem('ratioThreshold', '0.5')
            expect(loadRatioThreshold()).toBe(0.5)
        })

        it('handles large values', () => {
            localStorageMock.setItem('ratioThreshold', '100')
            expect(loadRatioThreshold()).toBe(100)
        })
    })

    describe('saveRatioThreshold', () => {
        it('saves threshold to localStorage', () => {
            saveRatioThreshold(2.0)
            expect(localStorageMock.setItem).toHaveBeenCalledWith('ratioThreshold', '2')
        })

        it('saves decimal values', () => {
            saveRatioThreshold(1.5)
            expect(localStorageMock.setItem).toHaveBeenCalledWith('ratioThreshold', '1.5')
        })

        it('saves zero', () => {
            saveRatioThreshold(0)
            expect(localStorageMock.setItem).toHaveBeenCalledWith('ratioThreshold', '0')
        })
    })
})
