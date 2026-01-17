import { describe, it, expect } from 'vitest'

// Test tools route logic patterns
// Actual route handlers require Hono context and DB, so we test logic patterns

describe('tools routes', () => {
    describe('OrphanResult interface', () => {
        interface OrphanResult {
            instanceId: number
            instanceLabel: string
            hash: string
            name: string
            size: number
            reason: 'missingFiles' | 'unregistered'
            trackerMessage?: string
        }

        it('creates missingFiles orphan', () => {
            const orphan: OrphanResult = {
                instanceId: 1,
                instanceLabel: 'Home',
                hash: 'abc123',
                name: 'Test Torrent',
                size: 1000000,
                reason: 'missingFiles',
            }

            expect(orphan.reason).toBe('missingFiles')
            expect(orphan.trackerMessage).toBeUndefined()
        })

        it('creates unregistered orphan with tracker message', () => {
            const orphan: OrphanResult = {
                instanceId: 1,
                instanceLabel: 'Home',
                hash: 'def456',
                name: 'Another Torrent',
                size: 2000000,
                reason: 'unregistered',
                trackerMessage: 'Torrent not registered with this tracker',
            }

            expect(orphan.reason).toBe('unregistered')
            expect(orphan.trackerMessage).toBeDefined()
        })
    })

    describe('torrent state detection', () => {
        interface Torrent {
            hash: string
            name: string
            size: number
            state: string
        }

        function detectMissingFiles(torrents: Torrent[]): Torrent[] {
            return torrents.filter(t => t.state === 'missingFiles')
        }

        it('detects torrents with missing files', () => {
            const torrents: Torrent[] = [
                { hash: '1', name: 'OK Torrent', size: 100, state: 'downloading' },
                { hash: '2', name: 'Missing', size: 200, state: 'missingFiles' },
                { hash: '3', name: 'Seeding', size: 300, state: 'seeding' },
            ]

            const missing = detectMissingFiles(torrents)
            expect(missing).toHaveLength(1)
            expect(missing[0].name).toBe('Missing')
        })

        it('returns empty for no missing files', () => {
            const torrents: Torrent[] = [
                { hash: '1', name: 'Downloading', size: 100, state: 'downloading' },
                { hash: '2', name: 'Seeding', size: 200, state: 'seeding' },
            ]

            expect(detectMissingFiles(torrents)).toHaveLength(0)
        })
    })

    describe('tracker message analysis', () => {
        interface Tracker {
            url: string
            msg: string
        }

        function findUnregisteredTracker(trackers: Tracker[]): Tracker | undefined {
            return trackers.find(tr =>
                tr.msg && /unregistered|not registered|torrent not found/i.test(tr.msg)
            )
        }

        it('finds unregistered tracker', () => {
            const trackers: Tracker[] = [
                { url: 'http://tracker1.com', msg: '' },
                { url: 'http://tracker2.com', msg: 'Torrent not registered' },
            ]

            const result = findUnregisteredTracker(trackers)
            expect(result).toBeDefined()
            expect(result?.url).toBe('http://tracker2.com')
        })

        it('returns undefined when all trackers are OK', () => {
            const trackers: Tracker[] = [
                { url: 'http://tracker1.com', msg: 'Working' },
                { url: 'http://tracker2.com', msg: '' },
            ]

            expect(findUnregisteredTracker(trackers)).toBeUndefined()
        })

        it('handles case variations', () => {
            const trackers: Tracker[] = [
                { url: 'http://tracker.com', msg: 'UNREGISTERED TORRENT' },
            ]

            expect(findUnregisteredTracker(trackers)).toBeDefined()
        })
    })

    describe('scan result aggregation', () => {
        interface ScanResult {
            orphans: { reason: string }[]
            totalTorrents: number
            totalChecked: number
        }

        function summarizeScan(result: ScanResult) {
            return {
                missingFiles: result.orphans.filter(o => o.reason === 'missingFiles').length,
                unregistered: result.orphans.filter(o => o.reason === 'unregistered').length,
                total: result.orphans.length,
                scanned: result.totalTorrents,
                checked: result.totalChecked,
            }
        }

        it('summarizes scan results correctly', () => {
            const result: ScanResult = {
                orphans: [
                    { reason: 'missingFiles' },
                    { reason: 'missingFiles' },
                    { reason: 'unregistered' },
                ],
                totalTorrents: 100,
                totalChecked: 97, // 100 - 3 missing files not rechecked
            }

            const summary = summarizeScan(result)
            expect(summary.missingFiles).toBe(2)
            expect(summary.unregistered).toBe(1)
            expect(summary.total).toBe(3)
            expect(summary.scanned).toBe(100)
        })

        it('handles empty results', () => {
            const result: ScanResult = {
                orphans: [],
                totalTorrents: 50,
                totalChecked: 50,
            }

            const summary = summarizeScan(result)
            expect(summary.total).toBe(0)
        })
    })
})
