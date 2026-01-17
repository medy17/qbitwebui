import { describe, it, expect } from 'vitest'

// Test instances route logic patterns

describe('instances routes', () => {
    describe('InstanceResponse transformation', () => {
        interface Instance {
            id: number
            user_id: number
            label: string
            url: string
            qbt_username: string | null
            qbt_password_encrypted: string | null
            skip_auth: number
            created_at: number
        }

        interface InstanceResponse {
            id: number
            label: string
            url: string
            qbt_username: string | null
            skip_auth: boolean
            created_at: number
        }

        function toResponse(i: Instance): InstanceResponse {
            return {
                id: i.id,
                label: i.label,
                url: i.url,
                qbt_username: i.qbt_username,
                skip_auth: !!i.skip_auth,
                created_at: i.created_at,
            }
        }

        it('transforms instance to response', () => {
            const instance: Instance = {
                id: 1,
                user_id: 5,
                label: 'Home',
                url: 'http://localhost:8080',
                qbt_username: 'admin',
                qbt_password_encrypted: 'encrypted',
                skip_auth: 0,
                created_at: 1234567890,
            }

            const response = toResponse(instance)
            expect(response.id).toBe(1)
            expect(response.label).toBe('Home')
            expect(response.skip_auth).toBe(false)
            expect((response as any).user_id).toBeUndefined()
            expect((response as any).qbt_password_encrypted).toBeUndefined()
        })

        it('converts skip_auth number to boolean', () => {
            const instance: Instance = {
                id: 1, user_id: 1, label: 'Test', url: 'http://test',
                qbt_username: null, qbt_password_encrypted: null,
                skip_auth: 1, created_at: 0
            }
            expect(toResponse(instance).skip_auth).toBe(true)
        })
    })

    describe('torrent state categorization', () => {
        function categorizeTorrentState(state: string): 'paused' | 'error' | 'seeding' | 'downloading' | 'other' {
            if (state === 'pausedUP' || state === 'pausedDL' || state === 'stoppedUP' || state === 'stoppedDL') {
                return 'paused'
            } else if (state === 'error' || state === 'missingFiles') {
                return 'error'
            } else if (state.includes('UP') || state === 'uploading') {
                return 'seeding'
            } else if (state.includes('DL') || state === 'downloading' || state === 'metaDL') {
                return 'downloading'
            }
            return 'other'
        }

        it('categorizes paused states', () => {
            expect(categorizeTorrentState('pausedUP')).toBe('paused')
            expect(categorizeTorrentState('pausedDL')).toBe('paused')
            expect(categorizeTorrentState('stoppedUP')).toBe('paused')
            expect(categorizeTorrentState('stoppedDL')).toBe('paused')
        })

        it('categorizes error states', () => {
            expect(categorizeTorrentState('error')).toBe('error')
            expect(categorizeTorrentState('missingFiles')).toBe('error')
        })

        it('categorizes seeding states', () => {
            expect(categorizeTorrentState('uploading')).toBe('seeding')
            expect(categorizeTorrentState('forcedUP')).toBe('seeding')
            expect(categorizeTorrentState('stalledUP')).toBe('seeding')
        })

        it('categorizes downloading states', () => {
            expect(categorizeTorrentState('downloading')).toBe('downloading')
            expect(categorizeTorrentState('metaDL')).toBe('downloading')
            expect(categorizeTorrentState('forcedDL')).toBe('downloading')
            expect(categorizeTorrentState('stalledDL')).toBe('downloading')
        })
    })

    describe('validation', () => {
        function validateInstanceCreate(body: {
            label?: string
            url?: string
            qbt_username?: string
            qbt_password?: string
            skip_auth?: boolean
        }): string | null {
            if (!body.label || !body.url) {
                return 'Missing required fields'
            }
            if (!body.skip_auth && (!body.qbt_username || !body.qbt_password)) {
                return 'Credentials required when skip_auth is disabled'
            }
            return null
        }

        it('rejects missing label', () => {
            expect(validateInstanceCreate({ url: 'http://test' }))
                .toBe('Missing required fields')
        })

        it('rejects missing url', () => {
            expect(validateInstanceCreate({ label: 'Test' }))
                .toBe('Missing required fields')
        })

        it('rejects missing credentials when auth required', () => {
            expect(validateInstanceCreate({ label: 'Test', url: 'http://test' }))
                .toBe('Credentials required when skip_auth is disabled')
        })

        it('accepts skip_auth without credentials', () => {
            expect(validateInstanceCreate({
                label: 'Test',
                url: 'http://test',
                skip_auth: true
            })).toBeNull()
        })

        it('accepts with credentials', () => {
            expect(validateInstanceCreate({
                label: 'Test',
                url: 'http://test',
                qbt_username: 'admin',
                qbt_password: 'pass'
            })).toBeNull()
        })
    })

    describe('InstanceStats structure', () => {
        interface InstanceStats {
            id: number
            label: string
            online: boolean
            total: number
            downloading: number
            seeding: number
            paused: number
            error: number
            dlSpeed: number
            upSpeed: number
            allTimeDownload: number
            allTimeUpload: number
            freeSpaceOnDisk: number
        }

        it('has all required fields', () => {
            const stats: InstanceStats = {
                id: 1,
                label: 'Test',
                online: true,
                total: 100,
                downloading: 10,
                seeding: 50,
                paused: 35,
                error: 5,
                dlSpeed: 1024000,
                upSpeed: 512000,
                allTimeDownload: 1000000000,
                allTimeUpload: 500000000,
                freeSpaceOnDisk: 10000000000,
            }

            expect(stats.total).toBe(stats.downloading + stats.seeding + stats.paused + stats.error)
        })

        it('offline stats have zeros', () => {
            const stats: InstanceStats = {
                id: 1,
                label: 'Offline',
                online: false,
                total: 0,
                downloading: 0,
                seeding: 0,
                paused: 0,
                error: 0,
                dlSpeed: 0,
                upSpeed: 0,
                allTimeDownload: 0,
                allTimeUpload: 0,
                freeSpaceOnDisk: 0,
            }

            expect(stats.online).toBe(false)
            expect(stats.total).toBe(0)
        })
    })
})
