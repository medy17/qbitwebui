import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimit } from '../../src/server/utils/rateLimit'

describe('rateLimit utilities', () => {
    beforeEach(() => {
        // Reset all rate limits before each test
        resetRateLimit('test-key')
        resetRateLimit('another-key')
    })

    describe('checkRateLimit', () => {
        it('allows first request', () => {
            const result = checkRateLimit('test-key')
            expect(result.allowed).toBe(true)
            expect(result.retryAfter).toBeUndefined()
        })

        it('allows requests up to the limit', () => {
            for (let i = 0; i < 5; i++) {
                const result = checkRateLimit('test-key')
                expect(result.allowed).toBe(true)
            }
        })

        it('blocks requests after limit is exceeded', () => {
            // Use up all attempts
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-key')
            }

            // This should be blocked
            const result = checkRateLimit('test-key')
            expect(result.allowed).toBe(false)
            expect(result.retryAfter).toBeDefined()
            expect(result.retryAfter).toBeGreaterThan(0)
        })

        it('tracks limits per key independently', () => {
            // Use up key1 limit
            for (let i = 0; i < 5; i++) {
                checkRateLimit('key1')
            }

            // key2 should still be allowed
            const result = checkRateLimit('key2')
            expect(result.allowed).toBe(true)
        })

        it('returns retryAfter in seconds', () => {
            // Use up all attempts
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-key')
            }

            const result = checkRateLimit('test-key')
            expect(result.allowed).toBe(false)
            // retryAfter should be in seconds (less than 60 since window is 60s)
            expect(result.retryAfter).toBeLessThanOrEqual(60)
            expect(result.retryAfter).toBeGreaterThan(0)
        })
    })

    describe('resetRateLimit', () => {
        it('resets rate limit counter', () => {
            // Use up all attempts
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-key')
            }

            // Should be blocked
            expect(checkRateLimit('test-key').allowed).toBe(false)

            // Reset
            resetRateLimit('test-key')

            // Should be allowed again
            expect(checkRateLimit('test-key').allowed).toBe(true)
        })

        it('does not affect other keys', () => {
            // Use up both keys
            for (let i = 0; i < 5; i++) {
                checkRateLimit('key1')
                checkRateLimit('key2')
            }

            // Reset only key1
            resetRateLimit('key1')

            // key1 should be allowed, key2 should be blocked
            expect(checkRateLimit('key1').allowed).toBe(true)
            expect(checkRateLimit('key2').allowed).toBe(false)
        })

        it('handles resetting non-existent key', () => {
            // This should not throw
            expect(() => resetRateLimit('nonexistent')).not.toThrow()
        })
    })

    describe('rate limit timing', () => {
        it('resets after window expires', async () => {
            vi.useFakeTimers()

            // Use up all attempts
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-key')
            }
            expect(checkRateLimit('test-key').allowed).toBe(false)

            // Advance time past the window (60 seconds)
            vi.advanceTimersByTime(61 * 1000)

            // Should be allowed again
            expect(checkRateLimit('test-key').allowed).toBe(true)

            vi.useRealTimers()
        })

        it('does not reset before window expires', async () => {
            vi.useFakeTimers()

            // Use up all attempts
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-key')
            }

            // Advance time but not past the window
            vi.advanceTimersByTime(30 * 1000)

            // Should still be blocked
            expect(checkRateLimit('test-key').allowed).toBe(false)

            vi.useRealTimers()
        })
    })

    describe('concurrent usage patterns', () => {
        it('handles rapid sequential requests', () => {
            let blockedCount = 0
            for (let i = 0; i < 10; i++) {
                const result = checkRateLimit('rapid-test')
                if (!result.allowed) blockedCount++
            }
            // 5 allowed, 5 blocked
            expect(blockedCount).toBe(5)
        })
    })
})
