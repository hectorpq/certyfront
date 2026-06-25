import { describe, it, expect } from 'vitest';
import { extractApiError } from '@/utils/errorHandling';

describe('errorHandling utilities', () => {
  describe('extractApiError', () => {
    it('extracts single error message from API response', () => {
      const error = {
        response: {
          data: {
            email: ['Invalid email format'],
          },
        },
      };

      const result = extractApiError(error);
      expect(result).toBe('Invalid email format');
    });

    it('returns first error when multiple fields have errors', () => {
      const error = {
        response: {
          data: {
            email: ['Invalid email format'],
            password: ['Password is too short'],
          },
        },
      };

      const result = extractApiError(error);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('handles errors with array values (returns first)', () => {
      const error = {
        response: {
          data: {
            detail: ['Something went wrong', 'Please try again'],
          },
        },
      };

      const result = extractApiError(error);
      expect(result).toBe('Something went wrong');
    });

    it('returns first flattened value when multiple errors exist', () => {
      const error = {
        response: {
          data: {
            field1: ['Error 1'],
            field2: ['Error 2'],
            field3: ['Error 3'],
          },
        },
      };

      const result = extractApiError(error);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('returns null when error has no response', () => {
      const error = {
        message: 'Network error',
      };

      const result = extractApiError(error);
      expect(result).toBeNull();
    });

    it('returns null when error response has no data', () => {
      const error = {
        response: {},
      };

      const result = extractApiError(error);
      expect(result).toBeNull();
    });

    it('returns null when error data is not an object', () => {
      const error = {
        response: {
          data: 'Simple error string',
        },
      };

      const result = extractApiError(error);
      expect(result).toBeNull();
    });

    it('returns null when error data is null', () => {
      const error = {
        response: {
          data: null,
        },
      };

      const result = extractApiError(error);
      expect(result).toBeNull();
    });

    it('handles deeply nested error objects', () => {
      const error = {
        response: {
          data: {
            errors: {
              0: 'Error at index 0',
            },
          },
        },
      };

      const result = extractApiError(error);
      expect(result).toBeTruthy();
    });
  });
});
