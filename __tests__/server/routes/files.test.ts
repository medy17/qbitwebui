import { describe, it, expect } from 'vitest'
import { join, basename, dirname } from 'node:path'

// Test files route logic patterns

describe('files routes', () => {
    describe('path safety patterns', () => {
        // Test path traversal detection pattern
        function containsPathTraversal(path: string): boolean {
            const normalized = path.replace(/\\/g, '/')
            return normalized.includes('..')
        }

        it('detects path traversal with ..', () => {
            expect(containsPathTraversal('/../etc/passwd')).toBe(true)
        })

        it('detects nested path traversal', () => {
            expect(containsPathTraversal('/../../root')).toBe(true)
        })

        it('allows safe subdirectory paths', () => {
            expect(containsPathTraversal('/movies/action')).toBe(false)
        })

        it('allows root path', () => {
            expect(containsPathTraversal('/')).toBe(false)
        })

        it('allows paths with dots in filenames', () => {
            expect(containsPathTraversal('/file.v2.mkv')).toBe(false)
        })
    })

    describe('filename sanitization', () => {
        function sanitizeFilename(name: string): string {
            return name.replace(/["\r\n]/g, '_')
        }

        it('sanitizes quotes', () => {
            expect(sanitizeFilename('file"name')).toBe('file_name')
        })

        it('sanitizes newlines', () => {
            expect(sanitizeFilename('file\nname')).toBe('file_name')
        })

        it('sanitizes carriage returns', () => {
            expect(sanitizeFilename('file\rname')).toBe('file_name')
        })

        it('leaves safe characters unchanged', () => {
            expect(sanitizeFilename('Movie (2024) [1080p].mkv')).toBe('Movie (2024) [1080p].mkv')
        })

        it('handles multiple special characters', () => {
            expect(sanitizeFilename('file"with\r\nnewlines')).toBe('file_with__newlines')
        })
    })

    describe('file listing sort', () => {
        interface FileEntry {
            name: string
            isDirectory: boolean
        }

        function sortFiles(files: FileEntry[]): FileEntry[] {
            return [...files].sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
                return a.name.localeCompare(b.name)
            })
        }

        it('sorts directories before files', () => {
            const files = [
                { name: 'file.txt', isDirectory: false },
                { name: 'folder', isDirectory: true },
            ]
            const sorted = sortFiles(files)
            expect(sorted[0].name).toBe('folder')
            expect(sorted[1].name).toBe('file.txt')
        })

        it('sorts alphabetically within type', () => {
            const files = [
                { name: 'zebra', isDirectory: true },
                { name: 'alpha', isDirectory: true },
                { name: 'z.txt', isDirectory: false },
                { name: 'a.txt', isDirectory: false },
            ]
            const sorted = sortFiles(files)
            expect(sorted[0].name).toBe('alpha')
            expect(sorted[1].name).toBe('zebra')
            expect(sorted[2].name).toBe('a.txt')
            expect(sorted[3].name).toBe('z.txt')
        })
    })

    describe('rename validation', () => {
        function validateNewName(newName: string): string | null {
            if (newName.includes('/') || newName.includes('\\') || newName === '.' || newName === '..') {
                return 'Invalid file name'
            }
            return null
        }

        it('rejects forward slash', () => {
            expect(validateNewName('path/to')).toBe('Invalid file name')
        })

        it('rejects backslash', () => {
            expect(validateNewName('path\\to')).toBe('Invalid file name')
        })

        it('rejects single dot', () => {
            expect(validateNewName('.')).toBe('Invalid file name')
        })

        it('rejects double dot', () => {
            expect(validateNewName('..')).toBe('Invalid file name')
        })

        it('accepts valid filename', () => {
            expect(validateNewName('new_file.txt')).toBeNull()
        })

        it('accepts filename with dots', () => {
            expect(validateNewName('file.v2.backup.txt')).toBeNull()
        })
    })

    describe('error code handling', () => {
        function getErrorMessage(code: string | undefined): { message: string; status: number } {
            switch (code) {
                case 'ENOENT':
                    return { message: 'Path not found', status: 404 }
                case 'ENOTDIR':
                    return { message: 'Not a directory', status: 400 }
                default:
                    return { message: 'Failed to list directory', status: 500 }
            }
        }

        it('handles ENOENT', () => {
            expect(getErrorMessage('ENOENT')).toEqual({ message: 'Path not found', status: 404 })
        })

        it('handles ENOTDIR', () => {
            expect(getErrorMessage('ENOTDIR')).toEqual({ message: 'Not a directory', status: 400 })
        })

        it('handles unknown errors', () => {
            expect(getErrorMessage(undefined)).toEqual({ message: 'Failed to list directory', status: 500 })
        })
    })

    describe('path utilities', () => {
        it('basename extracts filename', () => {
            expect(basename('/downloads/movies/file.mkv')).toBe('file.mkv')
        })

        it('dirname extracts directory', () => {
            expect(dirname('/downloads/movies/file.mkv')).toBe('/downloads/movies')
        })

        it('join creates paths', () => {
            const result = join('/downloads', 'movies', 'file.mkv')
            expect(result).toContain('downloads')
            expect(result).toContain('movies')
            expect(result).toContain('file.mkv')
        })
    })
})
