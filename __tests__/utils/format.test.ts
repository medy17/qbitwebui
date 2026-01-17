import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    formatSpeed,
    formatSize,
    formatCompactSpeed,
    formatCompactSize,
    formatEta,
    formatDate,
    formatDuration,
    formatRelativeTime,
    formatRelativeDate,
    normalizeSearch,
} from '../../src/utils/format'

describe('formatSpeed', () => {
    it('formats bytes per second', () => {
        expect(formatSpeed(0)).toBe('0 B/s')
        expect(formatSpeed(512)).toBe('512 B/s')
        expect(formatSpeed(1023)).toBe('1023 B/s')
    })

    it('formats kilobytes per second', () => {
        expect(formatSpeed(1024)).toBe('1.0 KB/s')
        expect(formatSpeed(1536)).toBe('1.5 KB/s')
        expect(formatSpeed(1024 * 1024 - 1)).toBe('1024.0 KB/s')
    })

    it('formats megabytes per second', () => {
        expect(formatSpeed(1024 * 1024)).toBe('1.00 MB/s')
        expect(formatSpeed(1.5 * 1024 * 1024)).toBe('1.50 MB/s')
        expect(formatSpeed(100 * 1024 * 1024)).toBe('100.00 MB/s')
    })

    it('returns dash when showZero is false and value is 0', () => {
        expect(formatSpeed(0, false)).toBe('—')
    })
})

describe('formatSize', () => {
    it('formats bytes', () => {
        expect(formatSize(0)).toBe('0 B')
        expect(formatSize(1)).toBe('1 B')
        expect(formatSize(1023)).toBe('1023 B')
    })

    it('formats kilobytes', () => {
        expect(formatSize(1024)).toBe('1.0 KB')
        expect(formatSize(1536)).toBe('1.5 KB')
    })

    it('formats megabytes', () => {
        expect(formatSize(1024 * 1024)).toBe('1.0 MB')
        expect(formatSize(500 * 1024 * 1024)).toBe('500.0 MB')
    })

    it('formats gigabytes', () => {
        expect(formatSize(1024 * 1024 * 1024)).toBe('1.00 GB')
        expect(formatSize(4.7 * 1024 * 1024 * 1024)).toBe('4.70 GB')
    })

    it('formats terabytes', () => {
        expect(formatSize(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB')
        expect(formatSize(2.5 * 1024 * 1024 * 1024 * 1024)).toBe('2.50 TB')
    })
})

describe('formatCompactSpeed', () => {
    it('returns dash for zero', () => {
        expect(formatCompactSpeed(0)).toBe('-')
    })

    it('formats compact bytes', () => {
        expect(formatCompactSpeed(512)).toBe('512B')
    })

    it('formats compact kilobytes', () => {
        expect(formatCompactSpeed(1024)).toBe('1K')
        expect(formatCompactSpeed(2048)).toBe('2K')
    })

    it('formats compact megabytes', () => {
        expect(formatCompactSpeed(1024 * 1024)).toBe('1.0M')
        expect(formatCompactSpeed(10.5 * 1024 * 1024)).toBe('10.5M')
    })
})

describe('formatCompactSize', () => {
    it('formats compact bytes', () => {
        expect(formatCompactSize(512)).toBe('512B')
    })

    it('formats compact kilobytes', () => {
        expect(formatCompactSize(1024)).toBe('1K')
    })

    it('formats compact megabytes', () => {
        expect(formatCompactSize(1024 * 1024)).toBe('1M')
    })

    it('formats compact gigabytes', () => {
        expect(formatCompactSize(1024 * 1024 * 1024)).toBe('1.0G')
    })
})

describe('formatEta', () => {
    it('returns infinity for negative values', () => {
        expect(formatEta(-1)).toBe('∞')
        expect(formatEta(-1000)).toBe('∞')
    })

    it('returns infinity for qBittorrent unknown value', () => {
        expect(formatEta(8640000)).toBe('∞')
    })

    it('formats seconds', () => {
        expect(formatEta(0)).toBe('0s')
        expect(formatEta(30)).toBe('30s')
        expect(formatEta(59)).toBe('59s')
    })

    it('formats minutes', () => {
        expect(formatEta(60)).toBe('1m')
        expect(formatEta(120)).toBe('2m')
        expect(formatEta(3599)).toBe('59m')
    })

    it('formats hours and minutes', () => {
        expect(formatEta(3600)).toBe('1h 0m')
        expect(formatEta(3661)).toBe('1h 1m')
        expect(formatEta(7200)).toBe('2h 0m')
    })

    it('formats days', () => {
        expect(formatEta(86400)).toBe('1d')
        expect(formatEta(172800)).toBe('2d')
    })
})

describe('formatDate', () => {
    it('returns dash for zero or negative timestamp', () => {
        expect(formatDate(0)).toBe('—')
        expect(formatDate(-1)).toBe('—')
    })

    it('formats valid timestamps', () => {
        // Just verify it returns a non-empty string for valid timestamps
        const result = formatDate(1704067200) // Jan 1, 2024 00:00:00 UTC
        expect(result).toBeTruthy()
        expect(result).not.toBe('—')
    })
})

describe('formatDuration', () => {
    it('returns dash for negative values', () => {
        expect(formatDuration(-1)).toBe('—')
    })

    it('formats seconds only', () => {
        expect(formatDuration(0)).toBe('0s')
        expect(formatDuration(30)).toBe('30s')
        expect(formatDuration(59)).toBe('59s')
    })

    it('formats minutes and seconds', () => {
        expect(formatDuration(60)).toBe('1m 0s')
        expect(formatDuration(125)).toBe('2m 5s')
    })

    it('formats hours, minutes, and seconds', () => {
        expect(formatDuration(3600)).toBe('1h 0m 0s')
        expect(formatDuration(3665)).toBe('1h 1m 5s')
    })

    it('formats days, hours, and minutes', () => {
        expect(formatDuration(86400)).toBe('1d 0h 0m')
        expect(formatDuration(90061)).toBe('1d 1h 1m')
    })
})

describe('formatRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns Never for zero or negative timestamp', () => {
        expect(formatRelativeTime(0)).toBe('Never')
        expect(formatRelativeTime(-1)).toBe('Never')
    })

    it('returns Just now for recent timestamps', () => {
        const now = Math.floor(Date.now() / 1000)
        expect(formatRelativeTime(now)).toBe('Just now')
        expect(formatRelativeTime(now - 30)).toBe('Just now')
    })

    it('formats minutes ago', () => {
        const now = Math.floor(Date.now() / 1000)
        expect(formatRelativeTime(now - 60)).toBe('1m ago')
        expect(formatRelativeTime(now - 300)).toBe('5m ago')
    })

    it('formats hours ago', () => {
        const now = Math.floor(Date.now() / 1000)
        expect(formatRelativeTime(now - 3600)).toBe('1h ago')
        expect(formatRelativeTime(now - 7200)).toBe('2h ago')
    })

    it('formats days ago', () => {
        const now = Math.floor(Date.now() / 1000)
        expect(formatRelativeTime(now - 86400)).toBe('1d ago')
        expect(formatRelativeTime(now - 259200)).toBe('3d ago')
    })

    it('formats weeks ago', () => {
        const now = Math.floor(Date.now() / 1000)
        expect(formatRelativeTime(now - 604800)).toBe('1w ago')
        expect(formatRelativeTime(now - 1209600)).toBe('2w ago')
    })
})

describe('formatRelativeDate', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns dash for zero or negative timestamp', () => {
        expect(formatRelativeDate(0)).toBe('-')
        expect(formatRelativeDate(-1)).toBe('-')
    })

    it('returns Today for same day', () => {
        const todayTimestamp = Math.floor(Date.now() / 1000)
        expect(formatRelativeDate(todayTimestamp)).toBe('Today')
    })

    it('returns Yesterday for previous day', () => {
        const yesterdayTimestamp = Math.floor(Date.now() / 1000) - 86400
        expect(formatRelativeDate(yesterdayTimestamp)).toBe('Yesterday')
    })

    it('formats days ago within a week', () => {
        const threeDaysAgo = Math.floor(Date.now() / 1000) - 86400 * 3
        expect(formatRelativeDate(threeDaysAgo)).toBe('3d ago')
    })
})

describe('normalizeSearch', () => {
    it('converts to lowercase', () => {
        expect(normalizeSearch('HELLO')).toBe('hello')
        expect(normalizeSearch('Hello World')).toBe('hello world')
    })

    it('replaces dots, underscores, and hyphens with spaces', () => {
        expect(normalizeSearch('hello.world')).toBe('hello world')
        expect(normalizeSearch('hello_world')).toBe('hello world')
        expect(normalizeSearch('hello-world')).toBe('hello world')
    })

    it('normalizes multiple separators', () => {
        expect(normalizeSearch('hello...world')).toBe('hello world')
        expect(normalizeSearch('hello___world')).toBe('hello world')
        expect(normalizeSearch('hello---world')).toBe('hello world')
        expect(normalizeSearch('hello._-world')).toBe('hello world')
    })

    it('handles torrent-style names', () => {
        expect(normalizeSearch('Movie.Name.2024.1080p.BluRay')).toBe('movie name 2024 1080p bluray')
    })

    it('handles empty string', () => {
        expect(normalizeSearch('')).toBe('')
    })

    it('handles strings with only separators', () => {
        expect(normalizeSearch('...')).toBe(' ')
        expect(normalizeSearch('___')).toBe(' ')
    })

    it('preserves numbers', () => {
        expect(normalizeSearch('file123.txt')).toBe('file123 txt')
    })

    it('handles mixed separators at start and end', () => {
        expect(normalizeSearch('.hello.')).toBe(' hello ')
        expect(normalizeSearch('-test-')).toBe(' test ')
    })
})

// Additional edge case tests
describe('format edge cases', () => {
    describe('formatSpeed edge cases', () => {
        it('handles very large values', () => {
            expect(formatSpeed(1024 * 1024 * 1024)).toBe('1024.00 MB/s')
        })

        it('handles floating point precision', () => {
            expect(formatSpeed(1536)).toBe('1.5 KB/s')
        })
    })

    describe('formatSize edge cases', () => {
        it('handles exact boundary values', () => {
            expect(formatSize(1024)).toBe('1.0 KB')
            expect(formatSize(1024 * 1024)).toBe('1.0 MB')
            expect(formatSize(1024 * 1024 * 1024)).toBe('1.00 GB')
            expect(formatSize(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB')
        })

        it('handles values just below boundaries', () => {
            expect(formatSize(1023)).toBe('1023 B')
            expect(formatSize(1024 * 1024 - 1)).toBe('1024.0 KB')
        })
    })

    describe('formatEta edge cases', () => {
        it('handles exact boundary transitions', () => {
            expect(formatEta(59)).toBe('59s')
            expect(formatEta(60)).toBe('1m')
            expect(formatEta(3599)).toBe('59m')
            expect(formatEta(3600)).toBe('1h 0m')
            expect(formatEta(86399)).toBe('23h 59m')
            expect(formatEta(86400)).toBe('1d')
        })
    })

    describe('formatDuration edge cases', () => {
        it('handles exact day boundary', () => {
            expect(formatDuration(86400)).toBe('1d 0h 0m')
        })

        it('handles complex durations', () => {
            expect(formatDuration(90061)).toBe('1d 1h 1m')
        })
    })
})
