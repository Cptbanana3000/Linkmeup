class RateLimiter {
    constructor(windowMs = 60000) { // default 1 minute window
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    checkLimit(key, maxRequests = 3) { // default 3 requests per window
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        
        // Remove old requests outside the current window
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        
        if (validRequests.length >= maxRequests) {
            return false; // rate limit exceeded
        }

        // Add current request timestamp
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }

    // Get remaining time before next allowed request
    getTimeRemaining(key) {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        if (userRequests.length === 0) return 0;

        const oldestRequest = userRequests[0];
        return Math.max(0, this.windowMs - (now - oldestRequest));
    }
}

export const forgotPasswordLimiter = new RateLimiter(60000); // 1 minute window
export const resetPasswordLimiter = new RateLimiter(300000); // 5 minute window 