import { writable } from 'svelte/store';

const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
console.log('Initial token from localStorage:', storedToken);

// Add user store
export const user = writable(null);

export const token = writable(storedToken);

// Subscribe to changes and update localStorage
token.subscribe(value => {
    console.log('Token store updated:', value);
    if (typeof localStorage !== 'undefined') {
        if (value) {
            localStorage.setItem('token', value);
            console.log('Token saved to localStorage');
            // Decode token and update user store
            try {
                const [, payload] = value.split('.');
                const decoded = JSON.parse(atob(payload));
                user.set({
                    userId: decoded.userId,
                    username: decoded.username
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                user.set(null);
            }
        } else {
            localStorage.removeItem('token');
            console.log('Token removed from localStorage');
            user.set(null);
        }
    }
});

export function clearAuth() {
    token.set(null);
    user.set(null);
}

export function isTokenExpired(tokenValue) {
    if (!tokenValue) return true;
    try {
        const [, payload] = tokenValue.split('.');
        const decoded = JSON.parse(atob(payload));
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        console.error('Token validation error:', error);
        return true;
    }
} 