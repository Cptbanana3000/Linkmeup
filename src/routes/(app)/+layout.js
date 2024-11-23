export const ssr = false;

export async function load({ url }) {
    // This helps with client-side navigation
    return {
        url: url.pathname
    };
} 