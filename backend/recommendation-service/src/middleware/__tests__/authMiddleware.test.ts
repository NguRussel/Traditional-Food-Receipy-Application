import { Response, NextFunction } from 'express';
import { protect, authorize, AuthError, IAuthRequest } from '../authMiddleware';

// Define a type for the user object for clarity in tests
type MockUser = { id: string; roles: string[] | null };

// Mock Express Request, Response, NextFunction
const mockRequest = (headers: Record<string, string> = {}, user?: MockUser): IAuthRequest => {
  return {
    headers,
    user: user ? { id: user.id, roles: user.roles as string[] } : undefined, // Ensure roles is string[] or undefined for IAuthRequest
  } as IAuthRequest; // Cast to IAuthRequest, user property is handled by logic above
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Cast mockNext to jest.Mock to access mock properties
const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

describe('Auth Middleware', () => {
  beforeEach(() => {
    mockNext.mockClear(); // Use .mockClear() on the Jest mock
  });

  describe('protect middleware', () => {
    it('should call next() and attach user to req if x-user-id header is present', () => {
      const req = mockRequest({ 'x-user-id': 'testUserId', 'x-user-roles': 'user,editor' });
      const res = mockResponse();
      protect(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe('testUserId');
      expect(req.user?.roles).toEqual(['user', 'editor']);
    });

    it('should attach user with empty roles if x-user-roles header is missing', () => {
      const req = mockRequest({ 'x-user-id': 'testUserId' });
      const res = mockResponse();
      protect(req, res, mockNext);
      expect(req.user?.roles).toEqual([]);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if x-user-id header is missing', () => {
      const req = mockRequest({});
      const res = mockResponse();
      protect(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as unknown as AuthError;
      expect(error.message).toBe('User ID not provided. Access denied.');
      expect(error.statusCode).toBe(401);
      expect(req.user).toBeUndefined();
    });
  });

  describe('authorize middleware', () => {
    it('should call next() if user has one of the allowed roles', () => {
      const req = mockRequest({}, { id: 'testUser', roles: ['user', 'admin'] });
      const res = mockResponse();
      const authorizeAdmin = authorize(['admin']);
      authorizeAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any of the allowed roles', () => {
      const req = mockRequest({}, { id: 'testUser', roles: ['user'] });
      const res = mockResponse();
      const authorizeAdmin = authorize(['admin', 'superadmin']);
      authorizeAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as unknown as AuthError;
      expect(error.message).toContain('Forbidden. User does not have the required roles.');
      expect(error.statusCode).toBe(403);
    });

    it('should call next() with AuthError if req.user or req.user.roles is missing', () => {
      const reqWithoutUser = mockRequest({});
      const reqWithNullRoles = mockRequest({}, { id: 'testUser', roles: null });
      const res = mockResponse();
      const authorizeUser = authorize(['user']);
      
      authorizeUser(reqWithoutUser, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      let error = mockNext.mock.calls[0][0] as unknown as AuthError;
      expect(error.message).toBe('User roles not available. Authorization check failed.');
      
      mockNext.mockClear();

      authorizeUser(reqWithNullRoles, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      error = mockNext.mock.calls[0][0] as unknown as AuthError;
      expect(error.message).toBe('User roles not available. Authorization check failed.');
    });
  });
}); 