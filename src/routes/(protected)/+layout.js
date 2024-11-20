export const ssr = false;

export function load({ url }) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token && !url.pathname.includes('/login')) {
        return Response.redirect('/login');
    }
    
    return {
        token
    };
} 