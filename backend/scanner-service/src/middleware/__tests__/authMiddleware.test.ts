import { NextFunction, Response } from 'express';
import { IAuthRequest, AuthError, protect, authorize } from '../authMiddleware'; // Adjust path as necessary

// Mock asyncHandler to just return the function it's passed
jest.mock('../asyncHandler', () => (fn: any) => fn);

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
      send: jest.fn(),
    } as Partial<Response>; 
    nextFunction = jest.fn();
    // Clear any previous console spy
    if (jest.isMockFunction(console.warn)) {
        (console.warn as jest.Mock).mockClear();
    }
  });

  describe('protect', () => {
    it('should call next() if x-user-id and x-user-roles headers are present', async () => {
      mockRequest.headers = {
        'x-user-id': 'test-user-id',
        'x-user-roles': 'user,editor'
      };
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(); 
      expect(mockRequest.user).toEqual({
        id: 'test-user-id',
        roles: ['user', 'editor']
      });
    });

    it('should call next() with AuthError if x-user-id header is missing', async () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console.warn for this test
        mockRequest.headers = { 'x-user-roles': 'user' };
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
        expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Not authorized, token failed or headers missing',
            statusCode: 401
        }));
        (console.warn as jest.Mock).mockRestore(); // Restore console.warn
    });

    it('should correctly parse roles and filter out empty strings', async () => {
        mockRequest.headers = {
          'x-user-id': 'test-user-id',
          'x-user-roles': 'user,,admin, '
        };
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(mockRequest.user?.roles).toEqual(['user', 'admin']);
        expect(nextFunction).toHaveBeenCalledWith(); 
    });

    it('should handle empty roles string correctly', async () => {
        mockRequest.headers = {
          'x-user-id': 'test-user-id',
          'x-user-roles': ''
        };
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(mockRequest.user?.roles).toEqual([]);
        expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('authorize', () => {
    it('should call next() if user has one of the required roles', () => {
      mockRequest.user = { id: 'test-user', roles: ['user', 'admin'] };
      const authorizeAdmin = authorize('admin');
      authorizeAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any of the required roles', () => {
      mockRequest.user = { id: 'test-user', roles: ['user'] };
      const authorizeAdmin = authorize('admin', 'superadmin');
      authorizeAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User role(s) (user) not authorized to access this route. Required: admin, superadmin',
        statusCode: 403
      }));
    });

    it('should call next() with AuthError if req.user or req.user.roles is undefined', () => {
      mockRequest.user = undefined;
      const authorizeUser = authorize('user');
      authorizeUser(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Not authorized to access this route (no user data)',
        statusCode: 403
      }));
    });
  });
}); 