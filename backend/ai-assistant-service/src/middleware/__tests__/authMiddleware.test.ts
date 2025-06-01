import { Request, Response, NextFunction } from 'express';
import { protect, authorize, AuthError, IAuthRequest } from '../authMiddleware'; // Adjust path as necessary
import asyncHandler from '../asyncHandler'; // asyncHandler is used by protect

// Mock asyncHandler to simply return the function it's given for easier testing
// or to call it immediately if it returns a promise-handler.
jest.mock('../asyncHandler', () => (fn: any) => {
    return async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
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
      status: jest.fn().mockReturnThis(), // Allow chaining for res.status().json()
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should call next() and set req.user if headers are valid', async () => {
      mockRequest.headers = {
        'x-user-id': 'user123',
        'x-user-roles': 'user,editor',
      };
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(); 
      expect(mockRequest.user).toEqual({
        id: 'user123',
        roles: ['user', 'editor'],
      });
    });

    it('should call next() with AuthError if x-user-id is missing', async () => {
      mockRequest.headers = {
        'x-user-roles': 'user',
      };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      consoleWarnSpy.mockRestore();
    });

    it('should call next() with AuthError if x-user-roles is missing', async () => {
      mockRequest.headers = {
        'x-user-id': 'user123',
      };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      consoleWarnSpy.mockRestore();
    });

    it('should correctly parse roles even if x-user-roles is an empty string initially but gets populated by gateway', async () => {
      mockRequest.headers = {
        'x-user-id': 'user123',
        'x-user-roles': 'admin', // Simulating gateway populating it
      };
      await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user?.roles).toEqual(['admin']);
    });

    it('should handle roles with leading/trailing spaces', async () => {
        mockRequest.headers = {
          'x-user-id': 'user123',
          'x-user-roles': ' user , editor ',
        };
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(); 
        expect(mockRequest.user?.roles).toEqual(['user', 'editor']);
    });

    it('should handle empty segments in roles string (e.g., from double commas)', async () => {
        mockRequest.headers = {
          'x-user-id': 'user123',
          'x-user-roles': 'user,,editor',
        };
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(); 
        expect(mockRequest.user?.roles).toEqual(['user', 'editor']);
    });

    it('should result in an empty roles array if x-user-roles is an empty string and not call next() with AuthError immediately for missing roles, but req.user.roles should be empty', async () => {
        // This tests the specific behavior fixed earlier where empty roles string was an issue
        mockRequest.headers = {
            'x-user-id': 'user123',
            'x-user-roles': '', // Empty string for roles
        };
        // protect itself should call next() if x-user-id is present, 
        // authorize will then check the content of req.user.roles
        await protect(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(); // protect should pass if ID is there
        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.roles).toEqual([]); // Roles array should be empty
    });

  });

  describe('authorize middleware', () => {
    it('should call next() if user has one of the required roles', () => {
      mockRequest.user = { id: 'user123', roles: ['user', 'admin'] };
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any of the required roles', () => {
      mockRequest.user = { id: 'user123', roles: ['user'] };
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should call next() with AuthError if req.user is undefined', () => {
      // This case assumes protect middleware might have failed or was not used
      mockRequest.user = undefined;
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should call next() with AuthError if req.user.roles is undefined or empty and roles are required', () => {
      mockRequest.user = { id: 'user123', roles: [] }; // Empty roles
      authorize('admin')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should allow access if user has at least one of multiple specified roles', () => {
        mockRequest.user = { id: 'user123', roles: ['editor'] };
        authorize('admin', 'editor', 'viewer')(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith();
      });
  });
}); 