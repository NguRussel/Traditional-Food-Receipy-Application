import { Response, NextFunction } from 'express';
import { protect, authorize, AuthError, IAuthRequest } from '../authMiddleware';
import asyncHandler from '../asyncHandler';

// Mock asyncHandler
jest.mock('../asyncHandler', () => (fn: any) => {
    return async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
});

describe('Auth Middleware for Analytics Service', () => {
  let mockRequest: Partial<IAuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    // Spy on console.warn before each test, but don't mockImplementation yet
    consoleWarnSpy = jest.spyOn(console, 'warn'); 
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy.mockRestore(); // Restore console.warn after each test
  });

  describe('protect middleware', () => {
    it('should call next() and set req.user if headers are valid', async () => {
      mockRequest.headers = {
        'x-user-id': 'user456',
        'x-user-roles': 'user,analyst',
      };
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(); 
      expect(mockRequest.user).toEqual({
        id: 'user456',
        roles: ['user', 'analyst'],
      });
      expect(consoleWarnSpy).not.toHaveBeenCalled(); // Ensure no warnings for valid cases
    });

    it('should call next() with AuthError if x-user-id is missing', async () => {
      consoleWarnSpy.mockImplementation(() => {}); // Suppress warning for this specific test
      mockRequest.headers = {
        'x-user-roles': 'user',
      };
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1); // Verify console.warn was called (and suppressed)
    });

    it('should call next() with AuthError if x-user-roles is missing', async () => {
      consoleWarnSpy.mockImplementation(() => {}); // Suppress warning for this specific test
      mockRequest.headers = {
        'x-user-id': 'user456',
      };
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should result in an empty roles array if x-user-roles is an empty string, and call next()', async () => {
        mockRequest.headers = {
            'x-user-id': 'user456',
            'x-user-roles': '', 
        };
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(); 
        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.roles).toEqual([]);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should call next() if user has one of the required roles', () => {
      mockRequest.user = { id: 'user456', roles: ['user', 'admin'] };
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any of the required roles', () => {
      mockRequest.user = { id: 'user456', roles: ['user'] };
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should call next() with AuthError if req.user is undefined', () => {
      mockRequest.user = undefined;
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should call next() with AuthError if req.user.roles is empty and roles are required', () => {
      mockRequest.user = { id: 'user456', roles: [] };
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });
}); 