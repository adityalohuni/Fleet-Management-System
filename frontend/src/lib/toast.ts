/**
 * Toast Notification Service
 * Centralized toast management with consistent UX patterns
 */

import { toast as sonnerToast } from 'sonner';

// Toast duration constants (in milliseconds)
const DURATION = {
  SHORT: 3000,
  NORMAL: 4000,
  LONG: 6000,
  PERSISTENT: Infinity,
} as const;

// Toast configuration for different types
const TOAST_CONFIG = {
  success: {
    duration: DURATION.NORMAL,
    className: 'toast-success',
  },
  error: {
    duration: DURATION.LONG,
    className: 'toast-error',
  },
  warning: {
    duration: DURATION.LONG,
    className: 'toast-warning',
  },
  info: {
    duration: DURATION.NORMAL,
    className: 'toast-info',
  },
  loading: {
    duration: DURATION.PERSISTENT,
    className: 'toast-loading',
  },
} as const;

/**
 * Enhanced toast service with better UX patterns
 */
export const toast = {
  /**
   * Show success message
   * @param message - Success message to display
   * @param options - Optional configuration
   */
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      ...TOAST_CONFIG.success,
      ...options,
      description: options?.description,
    });
  },

  /**
   * Show error message with user-friendly formatting
   * @param message - Error message or Error object
   * @param options - Optional configuration
   */
  error: (
    message: string | Error,
    options?: { 
      description?: string; 
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const errorMessage = message instanceof Error ? message.message : message;
    const finalMessage = errorMessage || 'An unexpected error occurred';
    
    return sonnerToast.error(finalMessage, {
      ...TOAST_CONFIG.error,
      ...options,
      description: options?.description,
      action: options?.action,
    });
  },

  /**
   * Show warning message
   * @param message - Warning message to display
   * @param options - Optional configuration
   */
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      ...TOAST_CONFIG.warning,
      ...options,
      description: options?.description,
    });
  },

  /**
   * Show info message
   * @param message - Info message to display
   * @param options - Optional configuration
   */
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      ...TOAST_CONFIG.info,
      ...options,
      description: options?.description,
    });
  },

  /**
   * Show loading toast that can be updated
   * @param message - Loading message to display
   * @returns Toast ID for updating/dismissing
   */
  loading: (message: string) => {
    return sonnerToast.loading(message, TOAST_CONFIG.loading);
  },

  /**
   * Update an existing toast
   * @param id - Toast ID to update
   * @param type - New toast type
   * @param message - New message
   * @param options - Optional configuration
   */
  update: (
    id: string | number,
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: { description?: string }
  ) => {
    const config = TOAST_CONFIG[type];
    
    switch (type) {
      case 'success':
        sonnerToast.success(message, { ...config, ...options, id });
        break;
      case 'error':
        sonnerToast.error(message, { ...config, ...options, id });
        break;
      case 'warning':
        sonnerToast.warning(message, { ...config, ...options, id });
        break;
      case 'info':
        sonnerToast.info(message, { ...config, ...options, id });
        break;
    }
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param id - Toast ID to dismiss (omit to dismiss all)
   */
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },

  /**
   * Promise toast - shows loading, then success or error based on promise result
   * @param promise - Promise to track
   * @param messages - Messages for each state
   * @returns Promise result
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Show a custom toast with advanced options
   * @param message - Message to display
   * @param options - Full Sonner toast options
   */
  custom: (message: string, options?: any) => {
    return sonnerToast(message, options);
  },
};

/**
 * Helper to format API errors into user-friendly messages
 * @param error - Error from API call
 * @param fallbackMessage - Fallback message if error can't be parsed
 * @returns Formatted error message
 */
export const formatApiError = (error: any, fallbackMessage: string = 'Operation failed'): string => {
  // Check for specific error formats
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.body?.message) {
    return error.body.message;
  }
  
  if (error?.body?.error) {
    return error.body.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  // Handle HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again.';
      default:
        return fallbackMessage;
    }
  }
  
  return fallbackMessage;
};

/**
 * Show a confirmation toast with action buttons
 * @param message - Confirmation message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Optional callback when cancelled
 */
export const toastConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  return sonnerToast(message, {
    duration: DURATION.PERSISTENT,
    action: {
      label: 'Confirm',
      onClick: onConfirm,
    },
    cancel: {
      label: 'Cancel',
      onClick: onCancel,
    },
  });
};

/**
 * Show an error with retry action
 * @param message - Error message
 * @param onRetry - Callback when retry is clicked
 */
export const toastErrorWithRetry = (message: string, onRetry: () => void) => {
  return toast.error(message, {
    action: {
      label: 'Retry',
      onClick: onRetry,
    },
  });
};
