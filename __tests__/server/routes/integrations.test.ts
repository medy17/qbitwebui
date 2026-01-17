import { describe, it, expect } from 'vitest'

// Test integrations route logic patterns

describe('integrations routes', () => {
    describe('IntegrationResponse transformation', () => {
        interface Integration {
            id: number
            user_id: number
            type: string
            label: string
            url: string
            api_key_encrypted: string
            created_at: number
        }

        interface IntegrationResponse {
            id: number
            type: string
            label: string
            url: string
            created_at: number
        }

        function toResponse(i: Integration): IntegrationResponse {
            return {
                id: i.id,
                type: i.type,
                label: i.label,
                url: i.url,
                created_at: i.created_at,
            }
        }

        it('transforms integration to response', () => {
            const integration: Integration = {
                id: 1,
                user_id: 5,
                type: 'prowlarr',
                label: 'My Prowlarr',
                url: 'http://localhost:9696',
                api_key_encrypted: 'encrypted:key',
                created_at: 1234567890,
            }

            const response = toResponse(integration)
            expect(response.id).toBe(1)
            expect(response.type).toBe('prowlarr')
            expect((response as any).user_id).toBeUndefined()
            expect((response as any).api_key_encrypted).toBeUndefined()
        })
    })

    describe('validation', () => {
        function validateIntegrationCreate(body: {
            type?: string
            label?: string
            url?: string
            api_key?: string
        }): string | null {
            if (!body.type || !body.label || !body.url || !body.api_key) {
                return 'Missing required fields'
            }
            if (body.type !== 'prowlarr') {
                return 'Unsupported integration type'
            }
            return null
        }

        it('rejects missing type', () => {
            expect(validateIntegrationCreate({
                label: 'Test', url: 'http://test', api_key: 'key'
            })).toBe('Missing required fields')
        })

        it('rejects missing label', () => {
            expect(validateIntegrationCreate({
                type: 'prowlarr', url: 'http://test', api_key: 'key'
            })).toBe('Missing required fields')
        })

        it('rejects missing url', () => {
            expect(validateIntegrationCreate({
                type: 'prowlarr', label: 'Test', api_key: 'key'
            })).toBe('Missing required fields')
        })

        it('rejects missing api_key', () => {
            expect(validateIntegrationCreate({
                type: 'prowlarr', label: 'Test', url: 'http://test'
            })).toBe('Missing required fields')
        })

        it('rejects unsupported type', () => {
            expect(validateIntegrationCreate({
                type: 'sonarr', label: 'Test', url: 'http://test', api_key: 'key'
            })).toBe('Unsupported integration type')
        })

        it('accepts valid prowlarr integration', () => {
            expect(validateIntegrationCreate({
                type: 'prowlarr',
                label: 'My Prowlarr',
                url: 'http://localhost:9696',
                api_key: 'abc123'
            })).toBeNull()
        })
    })

    describe('search parameters', () => {
        function buildSearchParams(options: {
            query: string
            type?: string
            indexerIds?: string
            categories?: string
        }): URLSearchParams {
            const params = new URLSearchParams({ query: options.query, type: options.type || 'search' })
            if (options.indexerIds) params.set('indexerIds', options.indexerIds)
            if (options.categories) params.set('categories', options.categories)
            return params
        }

        it('builds basic search params', () => {
            const params = buildSearchParams({ query: 'ubuntu' })
            expect(params.get('query')).toBe('ubuntu')
            expect(params.get('type')).toBe('search')
        })

        it('builds params with indexerIds', () => {
            const params = buildSearchParams({ query: 'test', indexerIds: '1,2,3' })
            expect(params.get('indexerIds')).toBe('1,2,3')
        })

        it('builds params with categories', () => {
            const params = buildSearchParams({ query: 'test', categories: '5000,5010' })
            expect(params.get('categories')).toBe('5000,5010')
        })

        it('builds params with custom type', () => {
            const params = buildSearchParams({ query: 'test', type: 'movie' })
            expect(params.get('type')).toBe('movie')
        })
    })

    describe('grab request handling', () => {
        function determineDownloadMethod(body: {
            magnetUrl?: string
            downloadUrl?: string
        }): 'magnet' | 'download' | 'none' {
            if (body.magnetUrl) return 'magnet'
            if (body.downloadUrl) return 'download'
            return 'none'
        }

        it('prefers magnet URL', () => {
            expect(determineDownloadMethod({
                magnetUrl: 'magnet:?xt=...',
                downloadUrl: 'http://download'
            })).toBe('magnet')
        })

        it('falls back to download URL', () => {
            expect(determineDownloadMethod({
                downloadUrl: 'http://download'
            })).toBe('download')
        })

        it('returns none when neither available', () => {
            expect(determineDownloadMethod({})).toBe('none')
        })
    })

    describe('URL proxy detection', () => {
        function isAlreadyProxied(downloadUrl: string, prowlarrHost: string): boolean {
            return downloadUrl.includes(prowlarrHost)
        }

        it('detects proxied URLs', () => {
            expect(isAlreadyProxied(
                'http://localhost:9696/api/v1/indexer/1/download?link=...',
                'localhost:9696'
            )).toBe(true)
        })

        it('detects non-proxied URLs', () => {
            expect(isAlreadyProxied(
                'http://tracker.example.com/download/123.torrent',
                'localhost:9696'
            )).toBe(false)
        })
    })
})
