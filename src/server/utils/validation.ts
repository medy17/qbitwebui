/**
 * Pure validation utilities - no side effects, safe to import anywhere
 */

export function validatePassword(password: string): string | null {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters'
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain a lowercase letter'
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain an uppercase letter'
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain a number'
    }
    return null
}

export function validateUsername(username: string): string | null {
    if (!username || username.length < 3 || username.length > 32) {
        return 'Username must be 3-32 characters'
    }
    return null
}

export function sanitizeFilename(name: string): string {
    return name.replace(/["\r\n]/g, '_')
}

export function containsPathTraversal(path: string): boolean {
    const normalized = path.replace(/\\\\/g, '/')
    return normalized.includes('..')
}

export function validateNewName(newName: string): string | null {
    if (newName.includes('/') || newName.includes('\\\\') || newName === '.' || newName === '..') {
        return 'Invalid file name'
    }
    return null
}
