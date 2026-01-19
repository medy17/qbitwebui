import { describe, it, expect } from 'vitest'
import { sanitizeFilename } from '../../../src/server/utils/validation'

describe('file validation', () => {
    describe('sanitizeFilename', () => {
        it('sanitizes quotes', () => {
            expect(sanitizeFilename('file"name')).toBe('file_name')
        })

        it('leaves safe characters unchanged', () => {
            expect(sanitizeFilename('Movie (2024) [1080p].mkv')).toBe('Movie (2024) [1080p].mkv')
        })

        it('handles filenames with spaces', () => {
            expect(sanitizeFilename('my file name.txt')).toBe('my file name.txt')
        })

        it('handles empty string', () => {
            expect(sanitizeFilename('')).toBe('')
        })
    })
})
