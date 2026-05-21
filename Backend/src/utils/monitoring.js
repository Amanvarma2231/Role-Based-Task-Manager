// backend/src/utils/monitoring.js
const prometheus = require('prom-client');
const logger = require('./logger');

// Create a Registry
const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users',
  help: 'Number of currently active users'
});

const taskOperationsTotal = new prometheus.Counter({
  name: 'task_operations_total',
  help: 'Total number of task operations',
  labelNames: ['operation', 'status']
});

const cacheHitRatio = new prometheus.Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsers);
register.registerMetric(taskOperationsTotal);
register.registerMetric(cacheHitRatio);

// Middleware for metrics collection
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

// Export metrics for use in other modules
const trackTaskOperation = (operation, status) => {
  taskOperationsTotal.labels(operation, status).inc();
};

const updateActiveUsers = (count) => {
  activeUsers.set(count);
};

const updateCacheHitRatio = (ratio) => {
  cacheHitRatio.set(ratio);
};

module.exports = {
  register,
  metricsMiddleware,
  metricsEndpoint,
  trackTaskOperation,
  updateActiveUsers,
  updateCacheHitRatio
};