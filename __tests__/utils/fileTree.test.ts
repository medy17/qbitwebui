import { describe, it, expect } from 'vitest'
import { buildFileTree, flattenVisibleNodes, getInitialExpanded, type FileTreeNode } from '../../src/utils/fileTree'
import type { TorrentFile } from '../../src/types/torrentDetails'

// Helper to create mock TorrentFile
function createFile(name: string, size = 1000, priority = 1, progress = 0, availability = 1): TorrentFile {
    return { name, size, priority, progress, availability, index: 0, piece_range: [0, 0], is_seed: false }
}

describe('buildFileTree', () => {
    it('creates flat file list for single-level files', () => {
        const files: TorrentFile[] = [
            createFile('file1.txt'),
            createFile('file2.txt'),
        ]
        const tree = buildFileTree(files)
        expect(tree).toHaveLength(2)
        expect(tree[0].name).toBe('file1.txt')
        expect(tree[0].isFolder).toBe(false)
        expect(tree[1].name).toBe('file2.txt')
    })

    it('creates folder structure from paths', () => {
        const files: TorrentFile[] = [
            createFile('folder/file1.txt'),
            createFile('folder/file2.txt'),
        ]
        const tree = buildFileTree(files)
        expect(tree).toHaveLength(1)
        expect(tree[0].name).toBe('folder')
        expect(tree[0].isFolder).toBe(true)
        expect(tree[0].children).toHaveLength(2)
    })

    it('creates nested folder structure', () => {
        const files: TorrentFile[] = [
            createFile('a/b/c/file.txt'),
        ]
        const tree = buildFileTree(files)
        expect(tree[0].name).toBe('a')
        expect(tree[0].children[0].name).toBe('b')
        expect(tree[0].children[0].children[0].name).toBe('c')
        expect(tree[0].children[0].children[0].children[0].name).toBe('file.txt')
    })

    it('calculates folder sizes correctly', () => {
        const files: TorrentFile[] = [
            createFile('folder/file1.txt', 1000),
            createFile('folder/file2.txt', 2000),
        ]
        const tree = buildFileTree(files)
        expect(tree[0].size).toBe(3000)
    })

    it('sorts folders before files', () => {
        const files: TorrentFile[] = [
            createFile('zfile.txt'),
            createFile('afolder/file.txt'),
        ]
        const tree = buildFileTree(files)
        expect(tree[0].name).toBe('afolder')
        expect(tree[0].isFolder).toBe(true)
        expect(tree[1].name).toBe('zfile.txt')
        expect(tree[1].isFolder).toBe(false)
    })

    it('sorts nodes alphabetically within their type', () => {
        const files: TorrentFile[] = [
            createFile('zfile.txt'),
            createFile('afile.txt'),
            createFile('mfile.txt'),
        ]
        const tree = buildFileTree(files)
        expect(tree[0].name).toBe('afile.txt')
        expect(tree[1].name).toBe('mfile.txt')
        expect(tree[2].name).toBe('zfile.txt')
    })

    it('maps priority values correctly', () => {
        const files: TorrentFile[] = [
            createFile('skip.txt', 100, 0),
            createFile('normal.txt', 100, 1),
            createFile('high.txt', 100, 6),
            createFile('max.txt', 100, 7),
        ]
        const tree = buildFileTree(files)
        expect(tree.find(n => n.name === 'skip.txt')?.priority).toBe('skip')
        expect(tree.find(n => n.name === 'normal.txt')?.priority).toBe('normal')
        expect(tree.find(n => n.name === 'high.txt')?.priority).toBe('high')
        expect(tree.find(n => n.name === 'max.txt')?.priority).toBe('max')
    })

    it('sets mixed priority for folders with different file priorities', () => {
        const files: TorrentFile[] = [
            createFile('folder/file1.txt', 100, 1),
            createFile('folder/file2.txt', 100, 6),
        ]
        const tree = buildFileTree(files)
        expect(tree[0].priority).toBe('mixed')
    })

    it('calculates folder progress correctly', () => {
        const files: TorrentFile[] = [
            createFile('folder/file1.txt', 1000, 1, 0.5),
            createFile('folder/file2.txt', 1000, 1, 1.0),
        ]
        const tree = buildFileTree(files)
        expect(tree[0].progress).toBeCloseTo(0.75)
    })
})

describe('flattenVisibleNodes', () => {
    function createTestTree(): FileTreeNode[] {
        return [
            {
                name: 'folder1',
                path: 'folder1',
                isFolder: true,
                size: 1000,
                progress: 0,
                priority: 'normal',
                availability: 1,
                fileIndices: [0, 1],
                children: [
                    {
                        name: 'file1.txt',
                        path: 'folder1/file1.txt',
                        isFolder: false,
                        size: 500,
                        progress: 0,
                        priority: 'normal',
                        availability: 1,
                        fileIndices: [0],
                        children: [],
                    },
                    {
                        name: 'file2.txt',
                        path: 'folder1/file2.txt',
                        isFolder: false,
                        size: 500,
                        progress: 0,
                        priority: 'normal',
                        availability: 1,
                        fileIndices: [1],
                        children: [],
                    },
                ],
            },
            {
                name: 'file3.txt',
                path: 'file3.txt',
                isFolder: false,
                size: 1000,
                progress: 0,
                priority: 'normal',
                availability: 1,
                fileIndices: [2],
                children: [],
            },
        ]
    }

    it('returns only top-level nodes when nothing is expanded', () => {
        const tree = createTestTree()
        const expanded = new Set<string>()
        const flattened = flattenVisibleNodes(tree, expanded)
        expect(flattened).toHaveLength(2)
        expect(flattened[0].node.name).toBe('folder1')
        expect(flattened[0].depth).toBe(0)
        expect(flattened[1].node.name).toBe('file3.txt')
    })

    it('includes children when folder is expanded', () => {
        const tree = createTestTree()
        const expanded = new Set(['folder1'])
        const flattened = flattenVisibleNodes(tree, expanded)
        expect(flattened).toHaveLength(4)
        expect(flattened[0].node.name).toBe('folder1')
        expect(flattened[0].depth).toBe(0)
        expect(flattened[1].node.name).toBe('file1.txt')
        expect(flattened[1].depth).toBe(1)
        expect(flattened[2].node.name).toBe('file2.txt')
        expect(flattened[2].depth).toBe(1)
    })

    it('correctly tracks depth for nested expansions', () => {
        const tree: FileTreeNode[] = [{
            name: 'a',
            path: 'a',
            isFolder: true,
            size: 0,
            progress: 0,
            priority: 'normal',
            availability: 0,
            fileIndices: [],
            children: [{
                name: 'b',
                path: 'a/b',
                isFolder: true,
                size: 0,
                progress: 0,
                priority: 'normal',
                availability: 0,
                fileIndices: [],
                children: [{
                    name: 'file.txt',
                    path: 'a/b/file.txt',
                    isFolder: false,
                    size: 100,
                    progress: 0,
                    priority: 'normal',
                    availability: 0,
                    fileIndices: [0],
                    children: [],
                }],
            }],
        }]

        const expanded = new Set(['a', 'a/b'])
        const flattened = flattenVisibleNodes(tree, expanded)
        expect(flattened).toHaveLength(3)
        expect(flattened[0].depth).toBe(0)
        expect(flattened[1].depth).toBe(1)
        expect(flattened[2].depth).toBe(2)
    })
})

describe('getInitialExpanded', () => {
    it('returns empty set for files only', () => {
        const tree: FileTreeNode[] = [
            {
                name: 'file.txt',
                path: 'file.txt',
                isFolder: false,
                size: 100,
                progress: 0,
                priority: 'normal',
                availability: 0,
                fileIndices: [0],
                children: [],
            },
        ]
        const expanded = getInitialExpanded(tree)
        expect(expanded.size).toBe(0)
    })

    it('expands single-child folder paths', () => {
        const tree: FileTreeNode[] = [{
            name: 'a',
            path: 'a',
            isFolder: true,
            size: 100,
            progress: 0,
            priority: 'normal',
            availability: 0,
            fileIndices: [],
            children: [{
                name: 'b',
                path: 'a/b',
                isFolder: true,
                size: 100,
                progress: 0,
                priority: 'normal',
                availability: 0,
                fileIndices: [],
                children: [{
                    name: 'file.txt',
                    path: 'a/b/file.txt',
                    isFolder: false,
                    size: 100,
                    progress: 0,
                    priority: 'normal',
                    availability: 0,
                    fileIndices: [0],
                    children: [],
                }],
            }],
        }]

        const expanded = getInitialExpanded(tree)
        expect(expanded.has('a')).toBe(true)
        expect(expanded.has('a/b')).toBe(true)
    })

    it('stops expanding when there are multiple folders', () => {
        const tree: FileTreeNode[] = [{
            name: 'a',
            path: 'a',
            isFolder: true,
            size: 0,
            progress: 0,
            priority: 'normal',
            availability: 0,
            fileIndices: [],
            children: [
                {
                    name: 'b',
                    path: 'a/b',
                    isFolder: true,
                    size: 0,
                    progress: 0,
                    priority: 'normal',
                    availability: 0,
                    fileIndices: [],
                    children: [],
                },
                {
                    name: 'c',
                    path: 'a/c',
                    isFolder: true,
                    size: 0,
                    progress: 0,
                    priority: 'normal',
                    availability: 0,
                    fileIndices: [],
                    children: [],
                },
            ],
        }]

        const expanded = getInitialExpanded(tree)
        expect(expanded.has('a')).toBe(true)
        expect(expanded.has('a/b')).toBe(false)
        expect(expanded.has('a/c')).toBe(false)
    })
})
