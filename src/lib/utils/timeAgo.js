export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    // Define time intervals in seconds
    const intervals = {
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    // For minutes
    if (seconds < intervals.hour) {
        const minutes = Math.floor(seconds / intervals.minute);
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }
    
    // For hours
    if (seconds < intervals.day) {
        const hours = Math.floor(seconds / intervals.hour);
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    
    // For days
    if (seconds < intervals.week) {
        const days = Math.floor(seconds / intervals.day);
        return days === 1 ? '1 day ago' : `${days} days ago`;
    }
    
    // For weeks
    const weeks = Math.floor(seconds / intervals.week);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
} 