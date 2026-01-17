import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWithTls } from '../../src/server/utils/fetch'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('fetchWithTls', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    describe('successful requests', () => {
        it('makes basic fetch request', async () => {
            const mockResponse = new Response('OK', { status: 200 })
            mockFetch.mockResolvedValueOnce(mockResponse)

            const result = await fetchWithTls('http://localhost:8080/api')

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8080/api',
                expect.anything()
            )
            expect(result).toBe(mockResponse)
        })

        it('passes through request options', async () => {
            mockFetch.mockResolvedValueOnce(new Response('OK'))

            await fetchWithTls('http://localhost:8080/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true }),
            })

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8080/api',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        })
    })

    describe('error handling', () => {
        it('rethrows non-certificate errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            await expect(fetchWithTls('http://localhost:8080'))
                .rejects.toThrow('Network error')
        })

        it('provides helpful message for self-signed cert errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('self-signed certificate'))

            await expect(fetchWithTls('http://localhost:8080'))
                .rejects.toThrow('TLS certificate validation failed')
        })

        it('handles SELF_SIGNED_CERT_IN_CHAIN error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('SELF_SIGNED_CERT_IN_CHAIN'))

            await expect(fetchWithTls('http://localhost:8080'))
                .rejects.toThrow('TLS certificate validation failed')
        })

        it('handles certificate expired errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('certificate has expired'))

            await expect(fetchWithTls('http://localhost:8080'))
                .rejects.toThrow('TLS certificate validation failed')
        })

        it('handles CERT_HAS_EXPIRED error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('CERT_HAS_EXPIRED'))

            await expect(fetchWithTls('http://localhost:8080'))
                .rejects.toThrow('TLS certificate validation failed')
        })
    })

    describe('request types', () => {
        it('handles GET requests', async () => {
            mockFetch.mockResolvedValueOnce(new Response('{}'))

            await fetchWithTls('http://localhost/api', { method: 'GET' })

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ method: 'GET' })
            )
        })

        it('handles POST requests with body', async () => {
            mockFetch.mockResolvedValueOnce(new Response('{}'))

            await fetchWithTls('http://localhost/api', {
                method: 'POST',
                body: 'test=value',
            })

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ method: 'POST', body: 'test=value' })
            )
        })

        it('handles DELETE requests', async () => {
            mockFetch.mockResolvedValueOnce(new Response(''))

            await fetchWithTls('http://localhost/api/1', { method: 'DELETE' })

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ method: 'DELETE' })
            )
        })
    })
})
