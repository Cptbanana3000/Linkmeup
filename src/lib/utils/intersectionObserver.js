export function createIntersectionObserver(element, callback) {
    if (!element) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback();
                }
            });
        },
        {
            rootMargin: '100px'
        }
    );

    observer.observe(element);

    return () => observer.disconnect();
} 