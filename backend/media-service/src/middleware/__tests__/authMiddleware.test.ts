import { Request, Response, NextFunction } from 'express';
import { protect, authorize, IAuthRequest, AuthError } from '../authMiddleware';
import CustomError from '../../utils/CustomError';

// Mock CustomError to simplify testing error messages and types
// jest.mock('../../utils/CustomError'); // Original simple mock

jest.mock('../../utils/CustomError', () => {
  return jest.fn().mockImplementation((message: string, statusCode?: number) => {
    const instance = {
      name: 'CustomError',
      message: message,
      statusCode: statusCode,
      // Simulate the original class structure a bit more if needed
      // For example, if it extends Error:
      stack: (new Error(message)).stack, // Include a stack trace
    };
    // To make `instanceof CustomError` work with the mock:
    // Object.setPrototypeOf(instance, CustomError.prototype); // This is tricky with Jest mocks
    return instance;
  });
});

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
    // Clear mock implementation details for CustomError if needed, or use mockClear
    (CustomError as jest.MockedClass<typeof CustomError>).mockClear();
  });

  describe('protect', () => {
    it('should call next with AuthError if x-user-id header is missing', () => {
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(1);
      const errorPassedToNext = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(errorPassedToNext.name).toBe('AuthError');
      expect(errorPassedToNext.message).toBe('User ID not provided. Authentication required.');
      expect(errorPassedToNext.statusCode).toBe(401);
    });

    it('should populate req.user and call next if x-user-id is provided', () => {
      mockRequest.headers = { 'x-user-id': 'testUserId' };
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(mockRequest.user).toEqual({ id: 'testUserId', roles: ['user'] }); // Default role
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should parse x-user-roles if provided as a JSON array string', () => {
      mockRequest.headers = { 'x-user-id': 'testUserId', 'x-user-roles': '["admin","editor"]' };
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(mockRequest.user).toEqual({ id: 'testUserId', roles: ['admin', 'editor'] });
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should parse x-user-roles if provided as a single role string', () => {
      mockRequest.headers = { 'x-user-id': 'testUserId', 'x-user-roles': 'moderator' };
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(mockRequest.user).toEqual({ id: 'testUserId', roles: ['moderator'] });
      expect(nextFunction).toHaveBeenCalledWith();
    });
    
    it('should parse x-user-roles if provided as a comma-separated string', () => {
      mockRequest.headers = { 'x-user-id': 'testUserId', 'x-user-roles': 'admin,moderator' };
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(mockRequest.user).toEqual({ id: 'testUserId', roles: ['admin', 'moderator'] });
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should default to ["user"] role if x-user-roles is an empty string after parsing', () => {
      mockRequest.headers = { 'x-user-id': 'testUserId', 'x-user-roles': '' }; // empty string
      protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(mockRequest.user).toEqual({ id: 'testUserId', roles: ['user'] });
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('authorize', () => {
    it('should call next with AuthError if req.user is not populated', () => {
      // protect middleware not called, so req.user is undefined
      authorize(['admin'])(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(1);
      const errorPassedToNext = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(errorPassedToNext.name).toBe('AuthError');
      expect(errorPassedToNext.message).toBe('Authentication required. No user roles found.');
      expect(errorPassedToNext.statusCode).toBe(401);
    });

    it('should call next with CustomError if user does not have allowed roles', () => {
      mockRequest.user = { id: 'testUserId', roles: ['user'] };
      authorize(['admin'])(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledTimes(1);
      const errorPassedToNext = (nextFunction as jest.Mock).mock.calls[0][0];
      
      expect(errorPassedToNext.name).toBe('CustomError'); 
      expect(errorPassedToNext.message).toBe('You do not have permission to perform this action');
      expect(errorPassedToNext.statusCode).toBe(403);
    });

    it('should call next if user has one of the allowed roles', () => {
      mockRequest.user = { id: 'testUserId', roles: ['user', 'admin'] };
      authorize(['admin'])(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next if user has one of the allowed roles (multiple allowed)', () => {
      mockRequest.user = { id: 'testUserId', roles: ['editor'] };
      authorize(['admin', 'editor'])(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
}); 