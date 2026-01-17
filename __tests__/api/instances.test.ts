import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getInstances,
    createInstance,
    updateInstance,
    deleteInstance,
    type CreateInstanceData,
} from '../../src/api/instances'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('instances API', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    describe('getInstances', () => {
        it('fetches and returns instance list', async () => {
            const mockInstances = [
                { id: 1, label: 'Home', url: 'http://localhost:8080', qbt_username: 'admin', skip_auth: false, created_at: 1234567890 },
                { id: 2, label: 'Server', url: 'http://192.168.1.100:8080', qbt_username: null, skip_auth: true, created_at: 1234567900 },
            ]
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockInstances),
            })

            const result = await getInstances()

            expect(mockFetch).toHaveBeenCalledWith('/api/instances', {
                credentials: 'include',
            })
            expect(result).toEqual(mockInstances)
            expect(result).toHaveLength(2)
        })

        it('throws error on failure', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false })

            await expect(getInstances()).rejects.toThrow('Failed to fetch instances')
        })
    })

    describe('createInstance', () => {
        it('creates instance with all fields', async () => {
            const createData: CreateInstanceData = {
                label: 'New Instance',
                url: 'http://localhost:9090',
                qbt_username: 'admin',
                qbt_password: 'secret',
                skip_auth: false,
            }
            const mockInstance = {
                id: 3,
                ...createData,
                qbt_password: undefined,
                created_at: Date.now(),
            }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockInstance),
            })

            const result = await createInstance(createData)

            expect(mockFetch).toHaveBeenCalledWith('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(createData),
            })
            expect(result.id).toBe(3)
            expect(result.label).toBe('New Instance')
        })

        it('creates instance with minimal fields', async () => {
            const createData: CreateInstanceData = {
                label: 'Minimal',
                url: 'http://localhost:8080',
            }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 1, ...createData, skip_auth: false, created_at: 0 }),
            })

            await createInstance(createData)

            expect(mockFetch).toHaveBeenCalled()
        })

        it('throws error with message from server', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Instance with this label already exists' }),
            })

            await expect(createInstance({ label: 'Dup', url: 'http://test' }))
                .rejects.toThrow('Instance with this label already exists')
        })
    })

    describe('updateInstance', () => {
        it('updates instance with partial data', async () => {
            const updateData = { label: 'Updated Label' }
            const mockUpdated = {
                id: 1,
                label: 'Updated Label',
                url: 'http://localhost:8080',
                qbt_username: 'admin',
                skip_auth: false,
                created_at: 1234567890,
            }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUpdated),
            })

            const result = await updateInstance(1, updateData)

            expect(mockFetch).toHaveBeenCalledWith('/api/instances/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateData),
            })
            expect(result.label).toBe('Updated Label')
        })

        it('throws error on update failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Instance not found' }),
            })

            await expect(updateInstance(999, { label: 'Test' }))
                .rejects.toThrow('Instance not found')
        })
    })

    describe('deleteInstance', () => {
        it('deletes instance by id', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await deleteInstance(5)

            expect(mockFetch).toHaveBeenCalledWith('/api/instances/5', {
                method: 'DELETE',
                credentials: 'include',
            })
        })

        it('throws error on deletion failure', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false })

            await expect(deleteInstance(999)).rejects.toThrow('Failed to delete instance')
        })
    })
})
