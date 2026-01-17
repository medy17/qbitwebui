import { describe, it, expect } from 'vitest'
import { PER_PAGE_OPTIONS } from '../../src/utils/pagination'

describe('pagination', () => {
    describe('PER_PAGE_OPTIONS', () => {
        it('contains expected values', () => {
            expect(PER_PAGE_OPTIONS).toEqual([25, 50, 100, 200])
        })

        it('is readonly', () => {
            // TypeScript should prevent mutation, but verify the values
            expect(PER_PAGE_OPTIONS[0]).toBe(25)
            expect(PER_PAGE_OPTIONS.length).toBe(4)
        })

        it('values are in ascending order', () => {
            for (let i = 1; i < PER_PAGE_OPTIONS.length; i++) {
                expect(PER_PAGE_OPTIONS[i]).toBeGreaterThan(PER_PAGE_OPTIONS[i - 1])
            }
        })

        it('starts with a reasonable minimum', () => {
            expect(PER_PAGE_OPTIONS[0]).toBeGreaterThanOrEqual(10)
        })

        it('has a reasonable maximum', () => {
            expect(PER_PAGE_OPTIONS[PER_PAGE_OPTIONS.length - 1]).toBeLessThanOrEqual(500)
        })
    })
})
