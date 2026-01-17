import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { register, login, logout, getMe, changePassword } from '../../src/api/auth'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('auth API', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('register', () => {
        it('sends correct request and returns user on success', async () => {
            const mockUser = { id: 1, username: 'testuser' }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser),
            })

            const result = await register('testuser', 'password123')

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username: 'testuser', password: 'password123' }),
            })
            expect(result).toEqual(mockUser)
        })

        it('throws error with message from response on failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Username already exists' }),
            })

            await expect(register('testuser', 'password'))
                .rejects.toThrow('Username already exists')
        })

        it('throws default error when no error message in response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({}),
            })

            await expect(register('testuser', 'password'))
                .rejects.toThrow('Registration failed')
        })
    })

    describe('login', () => {
        it('sends correct request and returns user on success', async () => {
            const mockUser = { id: 1, username: 'testuser' }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser),
            })

            const result = await login('testuser', 'password123')

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username: 'testuser', password: 'password123' }),
            })
            expect(result).toEqual(mockUser)
        })

        it('throws error with message on invalid credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Invalid credentials' }),
            })

            await expect(login('testuser', 'wrongpassword'))
                .rejects.toThrow('Invalid credentials')
        })
    })

    describe('logout', () => {
        it('sends POST request to logout endpoint', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await logout()

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            })
        })
    })

    describe('getMe', () => {
        it('returns user when authenticated', async () => {
            const mockUser = { id: 1, username: 'testuser' }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser),
            })

            const result = await getMe()

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
                credentials: 'include',
            })
            expect(result).toEqual(mockUser)
        })

        it('returns null when not authenticated', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false })

            const result = await getMe()

            expect(result).toBeNull()
        })
    })

    describe('changePassword', () => {
        it('sends correct request on success', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })

            await changePassword('oldpass', 'newpass')

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword: 'oldpass', newPassword: 'newpass' }),
            })
        })

        it('throws error when current password is wrong', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Current password is incorrect' }),
            })

            await expect(changePassword('wrongpass', 'newpass'))
                .rejects.toThrow('Current password is incorrect')
        })
    })
})
