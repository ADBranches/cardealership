// Performance monitoring middleware
export const performanceMiddleware = (req, res, next) => {
    const start = performance.now();
    
    // Store start time in request
    req.startTime = start;
    
    // Override res.json to measure total response time
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Math.round(performance.now() - start);
        
        // Add performance metadata to response headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        
        // Log slow responses
        if (duration > 500) {
            console.warn(`?? SLOW RESPONSE: ${req.method} ${req.path} took ${duration}ms`);
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};