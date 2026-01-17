import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { log } from '../../src/server/utils/logger'

describe('logger utilities', () => {
    let consoleSpy: { log: ReturnType<typeof vi.spyOn>; warn: ReturnType<typeof vi.spyOn>; error: ReturnType<typeof vi.spyOn> }

    beforeEach(() => {
        consoleSpy = {
            log: vi.spyOn(console, 'log').mockImplementation(() => { }),
            warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
            error: vi.spyOn(console, 'error').mockImplementation(() => { }),
        }
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('log.info', () => {
        it('logs message with INFO level', () => {
            log.info('Test message')
            expect(consoleSpy.log).toHaveBeenCalledOnce()
            expect(consoleSpy.log.mock.calls[0][0]).toContain('[INFO]')
            expect(consoleSpy.log.mock.calls[0][0]).toContain('Test message')
        })

        it('includes timestamp', () => {
            log.info('Test')
            const call = consoleSpy.log.mock.calls[0][0]
            // Timestamp format: [2024-01-18T12:00:00.000Z]
            expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
    })

    describe('log.warn', () => {
        it('logs message with WARN level', () => {
            log.warn('Warning message')
            expect(consoleSpy.warn).toHaveBeenCalledOnce()
            expect(consoleSpy.warn.mock.calls[0][0]).toContain('[WARN]')
            expect(consoleSpy.warn.mock.calls[0][0]).toContain('Warning message')
        })
    })

    describe('log.error', () => {
        it('logs message with ERROR level', () => {
            log.error('Error message')
            expect(consoleSpy.error).toHaveBeenCalledOnce()
            expect(consoleSpy.error.mock.calls[0][0]).toContain('[ERROR]')
            expect(consoleSpy.error.mock.calls[0][0]).toContain('Error message')
        })
    })

    describe('log formatting', () => {
        it('handles empty messages', () => {
            log.info('')
            expect(consoleSpy.log).toHaveBeenCalledOnce()
        })

        it('handles special characters', () => {
            log.info('Message with "quotes" and <brackets>')
            expect(consoleSpy.log.mock.calls[0][0]).toContain('Message with "quotes" and <brackets>')
        })

        it('handles unicode characters', () => {
            log.info('🚀 Unicode message ✅')
            expect(consoleSpy.log.mock.calls[0][0]).toContain('🚀 Unicode message ✅')
        })
    })
})
