import { Request, Response, NextFunction } from 'express';
import { protect, authorize, AuthError, IAuthRequest } from '../authMiddleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<IAuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('protect', () => {
    it('should call next() if user ID and roles are provided in headers', () => {
      mockRequest.headers = {
        'x-user-id': 'test-user-id',
        'x-user-roles': 'user,editor',
      };
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual({ id: 'test-user-id', roles: ['user', 'editor'] });
    });

    it('should call next() with AuthError if x-user-id is missing', () => {
      mockRequest.headers = { 'x-user-roles': 'user' };
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toBe('Not authorized, no user credentials provided');
      expect(error.statusCode).toBe(401);
    });

    it('should call next() with AuthError if x-user-roles is missing or not a string', () => {
      mockRequest.headers = { 'x-user-id': 'test-user-id' }; // Missing x-user-roles
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toBe('Not authorized, no user credentials provided');
      expect(error.statusCode).toBe(401);
    });

    it('should handle empty string for x-user-roles (e.g., user with no roles)', () => {
        mockRequest.headers = {
            'x-user-id': 'test-user-id',
            'x-user-roles': '', // Empty string for roles
        };
        protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith();
        expect(mockRequest.user).toEqual({ id: 'test-user-id', roles: [''] }); // or roles: [] depending on desired behavior for empty string
    });
  });

  describe('authorize', () => {
    it('should call next() if user has an allowed role', () => {
      mockRequest.user = { id: 'test-user-id', roles: ['admin', 'user'] };
      const authorizeAdmin = authorize(['admin']);
      authorizeAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any allowed roles', () => {
      mockRequest.user = { id: 'test-user-id', roles: ['user'] };
      const authorizeAdmin = authorize(['admin']);
      authorizeAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toContain('not authorized to access this route');
      expect(error.statusCode).toBe(403);
    });

    it('should call next() with AuthError if req.user is undefined', () => {
      // Simulate scenario where protect middleware was not run or failed to set req.user
      mockRequest.user = undefined;
      const authorizeAdmin = authorize(['admin']);
      authorizeAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toBe('Not authorized, user roles not available');
      expect(error.statusCode).toBe(401);
    });
  });
}); 