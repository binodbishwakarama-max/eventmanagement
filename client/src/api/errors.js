export class AppApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromAxiosError(error) {
    if (error.response) {
      const data = error.response.data || {};
      return new AppApiError(
        data.message || 'Server encountered an error processing your request.',
        error.response.status,
        data.code || `HTTP_${error.response.status}`,
        data.details || null
      );
    }
    if (error.request) {
      return new AppApiError(
        'Unable to communicate with the campus server. Please check your network connection.',
        0,
        'NETWORK_ERROR'
      );
    }
    return new AppApiError(error.message || 'An unexpected error occurred.', 500, 'CLIENT_ERROR');
  }
}

