import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    listFiles,
    getDownloadUrl,
    checkWritable,
    deleteFiles,
    moveFiles,
    copyFiles,
    renameFile,
} from '../../src/api/files'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('files API', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    describe('listFiles', () => {
        it('fetches files with encoded path', async () => {
            const mockFiles = [
                { name: 'file1.txt', size: 1024, isDirectory: false, modified: 1234567890 },
                { name: 'folder', size: 0, isDirectory: true, modified: 1234567900 },
            ]
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockFiles),
            })

            const result = await listFiles('/downloads/movies')

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/files?path=%2Fdownloads%2Fmovies',
                { credentials: 'include' }
            )
            expect(result).toEqual(mockFiles)
        })

        it('handles special characters in path', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            })

            await listFiles('/downloads/My Movies & Shows')

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('My%20Movies%20%26%20Shows'),
                expect.anything()
            )
        })

        it('throws error with message from server', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Path not found' }),
            })

            await expect(listFiles('/nonexistent')).rejects.toThrow('Path not found')
        })
    })

    describe('getDownloadUrl', () => {
        it('returns encoded download URL', () => {
            const url = getDownloadUrl('/downloads/movie.mkv')
            expect(url).toBe('/api/files/download?path=%2Fdownloads%2Fmovie.mkv')
        })

        it('handles special characters', () => {
            const url = getDownloadUrl('/downloads/Movie (2024) [1080p].mkv')
            expect(url).toContain('Movie%20')
            expect(url).toContain('%5B1080p%5D')
        })
    })

    describe('checkWritable', () => {
        it('returns true when writable', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ writable: true }),
            })

            const result = await checkWritable()

            expect(result).toBe(true)
        })

        it('returns false when not writable', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ writable: false }),
            })

            const result = await checkWritable()

            expect(result).toBe(false)
        })

        it('returns false on request failure', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false })

            const result = await checkWritable()

            expect(result).toBe(false)
        })
    })

    describe('deleteFiles', () => {
        it('sends delete request with paths', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await deleteFiles(['/downloads/file1.txt', '/downloads/file2.txt'])

            expect(mockFetch).toHaveBeenCalledWith('/api/files/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ paths: ['/downloads/file1.txt', '/downloads/file2.txt'] }),
            })
        })

        it('throws error on failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Permission denied' }),
            })

            await expect(deleteFiles(['/protected/file'])).rejects.toThrow('Permission denied')
        })
    })

    describe('moveFiles', () => {
        it('sends move request with paths and destination', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await moveFiles(['/downloads/file.txt'], '/archive')

            expect(mockFetch).toHaveBeenCalledWith('/api/files/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ paths: ['/downloads/file.txt'], destination: '/archive' }),
            })
        })

        it('throws error on move failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Destination not found' }),
            })

            await expect(moveFiles(['/file'], '/nonexistent')).rejects.toThrow('Destination not found')
        })
    })

    describe('copyFiles', () => {
        it('sends copy request with paths and destination', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await copyFiles(['/downloads/file.txt'], '/backup')

            expect(mockFetch).toHaveBeenCalledWith('/api/files/copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ paths: ['/downloads/file.txt'], destination: '/backup' }),
            })
        })
    })

    describe('renameFile', () => {
        it('sends rename request', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await renameFile('/downloads/old.txt', 'new.txt')

            expect(mockFetch).toHaveBeenCalledWith('/api/files/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ path: '/downloads/old.txt', newName: 'new.txt' }),
            })
        })

        it('throws error on rename failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'File already exists' }),
            })

            await expect(renameFile('/file', 'existing')).rejects.toThrow('File already exists')
        })
    })
})
