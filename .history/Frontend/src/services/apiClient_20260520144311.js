// src/services/apiClient.js
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryStatusCodes: [408, 429, 500, 502, 503, 504]
    };
    this.pendingRequests = new Map();
    this.rateLimitQueue = [];
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
  }

  async request(config) {
    const requestKey = this.getRequestKey(config);
    
    // Deduplicate identical requests
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const promise = this.executeRequest(config);
    this.pendingRequests.set(requestKey, promise);

    try {
      const response = await promise;
      return response;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  async executeRequest(config, retryCount = 0) {
    try {
      // Check rate limiting
      await this.checkRateLimit();

      const response = await fetch(`${this.baseURL}${config.url}`, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: config.signal
      });

      // Update rate limit info
      this.updateRateLimit(response);

      if (!response.ok) {
        // Handle specific status codes
        if (response.status === 401 && config.url !== '/auth/refresh-token') {
          return this.handleUnauthorized(config);
        }

        if (response.status === 429) {
          return this.handleRateLimit(config);
        }

        if (this.shouldRetry(response.status) && retryCount < this.retryConfig.maxRetries) {
          return this.retryRequest(config, retryCount);
        }

        const error = await response.json();
        throw new ApiError(
          error.message || 'Request failed',
          response.status,
          error.errors
        );
      }

      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (this.shouldRetry(0) && retryCount < this.retryConfig.maxRetries) {
        return this.retryRequest(config, retryCount);
      }

      throw new ApiError(
        'Network error',
        0
      );
    }
  }

  shouldRetry(statusCode) {
    return this.retryConfig.retryStatusCodes.includes(statusCode);
  }

  async retryRequest(config, retryCount) {
    const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.executeRequest(config, retryCount + 1);
  }

  async handleUnauthorized(config) {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await this.request({
        url: '/auth/refresh-token',
        method: 'POST',
        data: { refreshToken }
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      config.headers.Authorization = `Bearer ${accessToken}`;
      return this.executeRequest(config);
    } catch (error) {
      localStorage.clear();
      window.location.href = '/login';
      throw new ApiError('Session expired', 401);
    }
  }

  async checkRateLimit() {
    if (this.rateLimitRemaining === 0) {
      const waitTime = this.rateLimitReset - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  updateRateLimit(response) {
    this.rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    this.rateLimitReset = response.headers.get('X-RateLimit-Reset');
  }

  getRequestKey(config) {
    return `${config.method}-${config.url}-${JSON.stringify(config.data)}`;
  }

  // Convenience methods
  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const apiClient = new ApiClient(process.env.REACT_APP_API_URL);