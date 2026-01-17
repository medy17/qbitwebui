import { describe, it, expect } from 'vitest'
import { extractTags, sortResults, filterResults } from '../../src/utils/search'

describe('extractTags', () => {
    it('extracts resolution tags', () => {
        const titles = [
            'Movie.2024.1080p.BluRay',
            'Show.S01E01.720p.WEB-DL',
            'Film.2024.2160p.UHD',
        ]
        const tags = extractTags(titles)
        expect(tags.find(t => t.tag === '1080P')).toBeTruthy()
        expect(tags.find(t => t.tag === '720P')).toBeTruthy()
        expect(tags.find(t => t.tag === '2160P')).toBeTruthy()
    })

    it('extracts codec tags', () => {
        const titles = ['Movie.x264.mkv', 'Film.x265.mp4', 'Show.HEVC.avi']
        const tags = extractTags(titles)
        expect(tags.find(t => t.tag === 'X264')).toBeTruthy()
        expect(tags.find(t => t.tag === 'X265')).toBeTruthy()
        expect(tags.find(t => t.tag === 'HEVC')).toBeTruthy()
    })

    it('extracts source tags', () => {
        const titles = [
            'Movie.BluRay.x264',
            'Show.WEB-DL.1080p',
            'Film.HDRip.720p',
        ]
        const tags = extractTags(titles)
        expect(tags.find(t => t.tag === 'BLURAY')).toBeTruthy()
        expect(tags.find(t => t.tag === 'WEB-DL')).toBeTruthy()
        expect(tags.find(t => t.tag === 'HDRIP')).toBeTruthy()
    })

    it('counts tag occurrences', () => {
        const titles = [
            'Movie1.1080p.x264',
            'Movie2.1080p.x265',
            'Movie3.1080p.HEVC',
        ]
        const tags = extractTags(titles)
        const tag1080p = tags.find(t => t.tag === '1080P')
        expect(tag1080p?.count).toBe(3)
    })

    it('sorts by count descending', () => {
        const titles = [
            'Movie1.1080p.x264',
            'Movie2.1080p.x264',
            'Movie3.720p.x264',
        ]
        const tags = extractTags(titles)
        // x264 appears 3 times, 1080p appears 2 times
        expect(tags[0].tag).toBe('X264')
        expect(tags[0].count).toBe(3)
    })

    it('returns empty array for titles with no tags', () => {
        const titles = ['just a regular title', 'another title here']
        const tags = extractTags(titles)
        expect(tags).toHaveLength(0)
    })
})

describe('sortResults', () => {
    const mockResults = [
        { title: 'Movie A', seeders: 100, size: 1000, publishDate: '2024-01-15' },
        { title: 'Movie B', seeders: 50, size: 2000, publishDate: '2024-01-10' },
        { title: 'Movie C', seeders: 200, size: 500, publishDate: '2024-01-20' },
    ]

    describe('sorting by seeders', () => {
        it('sorts by seeders descending (default)', () => {
            const sorted = sortResults(mockResults, 'seeders', false)
            expect(sorted[0].title).toBe('Movie C')
            expect(sorted[1].title).toBe('Movie A')
            expect(sorted[2].title).toBe('Movie B')
        })

        it('sorts by seeders ascending', () => {
            const sorted = sortResults(mockResults, 'seeders', true)
            expect(sorted[0].title).toBe('Movie B')
            expect(sorted[1].title).toBe('Movie A')
            expect(sorted[2].title).toBe('Movie C')
        })
    })

    describe('sorting by size', () => {
        it('sorts by size descending (default)', () => {
            const sorted = sortResults(mockResults, 'size', false)
            expect(sorted[0].title).toBe('Movie B')
            expect(sorted[1].title).toBe('Movie A')
            expect(sorted[2].title).toBe('Movie C')
        })

        it('sorts by size ascending', () => {
            const sorted = sortResults(mockResults, 'size', true)
            expect(sorted[0].title).toBe('Movie C')
            expect(sorted[1].title).toBe('Movie A')
            expect(sorted[2].title).toBe('Movie B')
        })
    })

    describe('sorting by age', () => {
        it('sorts by age descending (newest first)', () => {
            const sorted = sortResults(mockResults, 'age', false)
            expect(sorted[0].title).toBe('Movie C')
            expect(sorted[1].title).toBe('Movie A')
            expect(sorted[2].title).toBe('Movie B')
        })

        it('sorts by age ascending (oldest first)', () => {
            const sorted = sortResults(mockResults, 'age', true)
            expect(sorted[0].title).toBe('Movie B')
            expect(sorted[1].title).toBe('Movie A')
            expect(sorted[2].title).toBe('Movie C')
        })
    })

    it('handles missing seeders', () => {
        const results = [
            { title: 'A', size: 100, publishDate: '2024-01-01' },
            { title: 'B', seeders: 10, size: 100, publishDate: '2024-01-01' },
        ]
        const sorted = sortResults(results, 'seeders', false)
        expect(sorted[0].title).toBe('B')
        expect(sorted[1].title).toBe('A')
    })

    it('does not mutate original array', () => {
        const original = [...mockResults]
        sortResults(mockResults, 'seeders', false)
        expect(mockResults).toEqual(original)
    })
})

describe('filterResults', () => {
    const mockResults = [
        { title: 'The Matrix 1999', extra: 'data' },
        { title: 'Matrix Reloaded 2003', extra: 'info' },
        { title: 'Inception 2010', extra: 'value' },
    ]

    it('returns all results when filter is empty', () => {
        expect(filterResults(mockResults, '')).toHaveLength(3)
    })

    it('filters by title case-insensitively', () => {
        const filtered = filterResults(mockResults, 'matrix')
        expect(filtered).toHaveLength(2)
        expect(filtered[0].title).toBe('The Matrix 1999')
        expect(filtered[1].title).toBe('Matrix Reloaded 2003')
    })

    it('handles uppercase filter', () => {
        const filtered = filterResults(mockResults, 'INCEPTION')
        expect(filtered).toHaveLength(1)
        expect(filtered[0].title).toBe('Inception 2010')
    })

    it('returns empty array when no matches', () => {
        const filtered = filterResults(mockResults, 'nonexistent')
        expect(filtered).toHaveLength(0)
    })

    it('matches partial strings', () => {
        const filtered = filterResults(mockResults, 'rix')
        expect(filtered).toHaveLength(2)
    })
})
