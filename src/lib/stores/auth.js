import { writable } from 'svelte/store';

const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
console.log('Initial token from localStorage:', storedToken); // Debug log

export const token = writable(storedToken);

// Subscribe to changes and update localStorage
token.subscribe(value => {
    console.log('Token store updated:', value); // Debug log
    if (typeof localStorage !== 'undefined') {
        if (value) {
            localStorage.setItem('token', value);
            console.log('Token saved to localStorage'); // Debug log
        } else {
            localStorage.removeItem('token');
            console.log('Token removed from localStorage'); // Debug log
        }
    }
});

export function clearAuth() {
    token.set(null);
}

export function isTokenExpired(tokenValue) {
    if (!tokenValue) return true;
    try {
        const [, payload] = tokenValue.split('.');
        const decoded = JSON.parse(atob(payload));
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        console.error('Token validation error:', error); // Debug log
        return true;
    }
} 