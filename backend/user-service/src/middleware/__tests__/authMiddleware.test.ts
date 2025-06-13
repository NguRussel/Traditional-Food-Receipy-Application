import { protect, authorize, AuthError, IAuthRequest, IUserPayload } from '../authMiddleware';
import { Request, Response, NextFunction } from 'express';

// Mock Express Request, Response, NextFunction
const mockRequest = (headers: Record<string, string | string[] | undefined>): Partial<IAuthRequest> => ({
  headers,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

 describe('Auth Middleware', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should call next() and set req.user if x-user-id header is present', () => {
      const req = mockRequest({ 'x-user-id': 'test-user-123', 'x-user-roles': 'user,editor' }) as IAuthRequest;
      const res = mockResponse() as Response;
      protect(req, res, mockNext);
      expect(req.user).toEqual({ id: 'test-user-123', roles: ['user', 'editor'] });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // Called with no arguments
    });

    it('should call next() with AuthError if x-user-id header is missing', () => {
      const req = mockRequest({}) as IAuthRequest;
      const res = mockResponse() as Response;
      protect(req, res, mockNext);
      expect(req.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toBe('User ID not found in headers');
      expect(error.status).toBe(401);
    });

    it('should parse roles correctly, defaulting to empty array if x-user-roles is missing', () => {
      const req = mockRequest({ 'x-user-id': 'test-user-456' }) as IAuthRequest;
      const res = mockResponse() as Response;
      protect(req, res, mockNext);
      expect(req.user).toEqual({ id: 'test-user-456', roles: [] });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('authorize middleware', () => {
    it('should call next() if user has one of the allowed roles', () => {
      const req = {
        user: { id: 'test-user-789', roles: ['admin', 'user'] },
        headers: {}
      } as IAuthRequest;
      const res = mockResponse() as Response;
      const authorizeAdmin = authorize(['admin']);
      authorizeAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any of the allowed roles', () => {
      const req = {
        user: { id: 'test-user-101', roles: ['user'] },
        headers: {}
      } as IAuthRequest;
      const res = mockResponse() as Response;
      const authorizeAdmin = authorize(['admin']);
      authorizeAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toBe('User not authorized for this action');
      expect(error.status).toBe(403);
    });

    it('should call next() with AuthError if req.user or req.user.roles is undefined', () => {
      const req = { headers: {} } as IAuthRequest; // req.user is undefined
      const res = mockResponse() as Response;
      const authorizeUser = authorize(['user']);
      authorizeUser(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AuthError;
      expect(error.message).toBe('User not authenticated');
      expect(error.status).toBe(401);
    });
  });
}); 