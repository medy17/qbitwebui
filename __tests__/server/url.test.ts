import { describe, it, expect } from 'vitest'
import { isUrlAllowed, validateUrl } from '../../src/server/utils/url'

describe('url utilities', () => {
    describe('isUrlAllowed', () => {
        describe('valid URLs', () => {
            it('allows http URLs', () => {
                const result = isUrlAllowed('http://localhost:8080')
                expect(result.allowed).toBe(true)
            })

            it('allows https URLs', () => {
                const result = isUrlAllowed('https://example.com')
                expect(result.allowed).toBe(true)
            })

            it('allows IP addresses', () => {
                const result = isUrlAllowed('http://192.168.1.100:8080')
                expect(result.allowed).toBe(true)
            })

            it('allows URLs with paths', () => {
                const result = isUrlAllowed('http://localhost:8080/api/v1')
                expect(result.allowed).toBe(true)
            })

            it('allows URLs with query strings', () => {
                const result = isUrlAllowed('https://example.com/search?q=test')
                expect(result.allowed).toBe(true)
            })
        })

        describe('invalid URLs', () => {
            it('rejects invalid URL format', () => {
                const result = isUrlAllowed('not-a-url')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Invalid URL format')
            })

            it('rejects empty string', () => {
                const result = isUrlAllowed('')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Invalid URL format')
            })

            it('rejects ftp protocol', () => {
                const result = isUrlAllowed('ftp://example.com')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Only HTTP/HTTPS protocols allowed')
            })

            it('rejects file protocol', () => {
                const result = isUrlAllowed('file:///etc/passwd')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Only HTTP/HTTPS protocols allowed')
            })

            it('rejects javascript protocol', () => {
                const result = isUrlAllowed('javascript:alert(1)')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Only HTTP/HTTPS protocols allowed')
            })
        })

        describe('cloud metadata protection', () => {
            it('blocks AWS metadata endpoint', () => {
                const result = isUrlAllowed('http://169.254.169.254/latest/meta-data/')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Cloud metadata endpoints not allowed')
            })

            it('blocks Google Cloud metadata endpoint', () => {
                const result = isUrlAllowed('http://metadata.google.internal/computeMetadata/')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Cloud metadata endpoints not allowed')
            })

            it('blocks AWS metadata internal', () => {
                const result = isUrlAllowed('http://metadata.aws.internal/')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Cloud metadata endpoints not allowed')
            })

            it('blocks ECS metadata endpoint', () => {
                const result = isUrlAllowed('http://169.254.170.2/v2/credentials')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Cloud metadata endpoints not allowed')
            })

            it('blocks any 169.254.x.x link-local address', () => {
                const result = isUrlAllowed('http://169.254.1.1/')
                expect(result.allowed).toBe(false)
                expect(result.reason).toBe('Cloud metadata endpoints not allowed')
            })

            it('handles case-insensitive hostnames', () => {
                const result = isUrlAllowed('http://METADATA.GOOGLE.INTERNAL/')
                expect(result.allowed).toBe(false)
            })
        })
    })

    describe('validateUrl', () => {
        it('does not throw for valid URLs', () => {
            expect(() => validateUrl('http://localhost:8080')).not.toThrow()
            expect(() => validateUrl('https://example.com')).not.toThrow()
        })

        it('throws for invalid URL format', () => {
            expect(() => validateUrl('not-a-url')).toThrow('Invalid URL format')
        })

        it('throws for invalid protocol', () => {
            expect(() => validateUrl('ftp://example.com')).toThrow('Only HTTP/HTTPS protocols allowed')
        })

        it('throws for cloud metadata endpoints', () => {
            expect(() => validateUrl('http://169.254.169.254/')).toThrow('Cloud metadata endpoints not allowed')
        })
    })
})
