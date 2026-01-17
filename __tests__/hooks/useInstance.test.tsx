import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { useInstance } from '../../src/hooks/useInstance'
import { InstanceContext } from '../../src/contexts/instanceContext'
import type { Instance } from '../../src/api/instances'

describe('useInstance', () => {
    const mockInstance: Instance = {
        id: 1,
        label: 'Test Instance',
        url: 'http://localhost:8080',
        qbt_username: 'admin',
        skip_auth: false,
        created_at: 1234567890,
    }

    it('returns instance from context', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                InstanceContext.Provider,
                { value: { instance: mockInstance, setInstance: vi.fn() } },
                children
            )

        const { result } = renderHook(() => useInstance(), { wrapper })

        expect(result.current).toEqual(mockInstance)
        expect(result.current.id).toBe(1)
        expect(result.current.label).toBe('Test Instance')
    })

    it('throws error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => {
            renderHook(() => useInstance())
        }).toThrow('useInstance must be used within InstanceProvider')

        consoleSpy.mockRestore()
    })
})
