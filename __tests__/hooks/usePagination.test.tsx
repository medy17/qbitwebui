import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { usePagination } from '../../src/hooks/usePagination'
import { PaginationContext } from '../../src/contexts/paginationContext'

describe('usePagination', () => {
    const mockPaginationContext = {
        page: 1,
        perPage: 50,
        setPage: vi.fn(),
        setPerPage: vi.fn(),
    }

    it('returns pagination context values', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                PaginationContext.Provider,
                { value: mockPaginationContext },
                children
            )

        const { result } = renderHook(() => usePagination(), { wrapper })

        expect(result.current.page).toBe(1)
        expect(result.current.perPage).toBe(50)
        expect(typeof result.current.setPage).toBe('function')
        expect(typeof result.current.setPerPage).toBe('function')
    })

    it('throws error when used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => {
            renderHook(() => usePagination())
        }).toThrow('usePagination must be used within PaginationProvider')

        consoleSpy.mockRestore()
    })
})
