import { Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken'; // Not directly used in these tests, can be removed if not needed by underlying code
import { protect, authorize, AuthError, IAuthRequest } from '../authMiddleware';

// Mock config if your authMiddleware directly uses it.
// jest.mock('../../config/config', () => ({
//   JWT_SECRET: 'testsecret',
// }));

const mockRequest = (headers: any = {}, user: any = undefined): Partial<IAuthRequest> => ({
  headers: {
    'x-user-id': headers['x-user-id'],
    'x-user-roles': headers['x-user-roles'],
    // 'x-clerk-token': headers['x-clerk-token'], // Removed if not used by protect/authorize
  } as any,
  user: user,
  get: jest.fn(), 
  header: jest.fn(),
  // Add any other properties of Request that IAuthRequest might extend or use
  accepts: jest.fn(),
  acceptsCharsets: jest.fn(),
  acceptsEncodings: jest.fn(),
  acceptsLanguages: jest.fn(),
  range: jest.fn(),
  param: jest.fn(),
  is: jest.fn(),
  protocol: 'http',
  secure: false,
  ip: '127.0.0.1',
  ips: [],
  subdomains: [],
  path: '/',
  hostname: 'localhost',
  host: 'localhost',
  fresh: false,
  stale: true,
  xhr: false,
  body: {},
  cookies: {},
  method: 'GET',
  originalUrl: '/',
  params: {},
  query: {},
  route: {},
  signedCookies: {},
  app: {} as any, // Mock app object
  res: {} as Response, // Mock res object
  next: jest.fn() as NextFunction, // Mock next function
  baseUrl: '',
  httpVersion: '1.1',
  httpVersionMajor: 1,
  httpVersionMinor: 1,
  socket: {} as any, // Mock net.Socket
  readableEnded: false,
  readableFlowing: null,
  readableHighWaterMark: 0,
  readableLength:0,
  readableObjectMode:false,
  destroyed: false,
  addListener: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
  pause: jest.fn(),
  pipe: jest.fn(),
  prependListener: jest.fn(),
  prependOnceListener: jest.fn(),
  read: jest.fn(),
  removeAllListeners: jest.fn(),
  removeListener: jest.fn(),
  resume: jest.fn(),
  setEncoding: jest.fn(),
  unpipe: jest.fn(),
  unshift: jest.fn(),
  wrap: jest.fn(),
  [Symbol.asyncIterator]: jest.fn(),
  readable: true,
  _construct: jest.fn(),
  _destroy: jest.fn(),
  _read: jest.fn(),
  off: jest.fn(),
  listeners: jest.fn(),
  rawListeners: jest.fn(),
  getMaxListeners: jest.fn(),
  setMaxListeners: jest.fn(),
  listenerCount: jest.fn(),
  eventNameseventNames: jest.fn(),
} as Partial<IAuthRequest>);

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis(); // Added for completeness
  return res as Response;
};

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>; 

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should call next() and set req.user if x-user-id and x-user-roles are provided', () => {
      const req = mockRequest({
        'x-user-id': 'testUserId',
        'x-user-roles': 'user,editor',
      }) as IAuthRequest;
      const res = mockResponse();

      protect(req, res, mockNext);

      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe('testUserId');
      expect(req.user?.roles).toEqual(['user', 'editor']);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); 
    });

    it('should call next() with AuthError if x-user-id is missing', () => {
      const req = mockRequest({ 'x-user-roles': 'user' }) as IAuthRequest;
      const res = mockResponse();

      protect(req, res, mockNext);

      expect(req.user).toBeUndefined(); // req.user is not set if userId is missing
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as unknown as AuthError;
      expect(error.message).toBe('User ID not provided. Access denied.'); // Corrected message
      expect(error.statusCode).toBe(401);
    });

    it('should call next() and set req.user with empty roles if x-user-roles is missing', () => {
      const req = mockRequest({ 'x-user-id': 'testUserId' }) as IAuthRequest;
      const res = mockResponse();

      protect(req, res, mockNext);

      expect(req.user).toBeDefined(); // req.user IS set
      expect(req.user?.id).toBe('testUserId');
      expect(req.user?.roles).toEqual([]); // Roles default to empty array
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // No error
    });

     it('should handle empty x-user-roles string by assigning empty array to roles', () => {
      const req = mockRequest({
        'x-user-id': 'testUserId',
        'x-user-roles': '',
      }) as IAuthRequest;
      const res = mockResponse();

      protect(req, res, mockNext);

      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe('testUserId');
      expect(req.user?.roles).toEqual([]);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('authorize', () => {
    it('should call next() if user has an allowed role', () => {
      const req = mockRequest({}, { id: 'testUserId', roles: ['admin', 'user'] }) as IAuthRequest;
      const res = mockResponse();
      const allowedRoles = ['admin'];

      authorize(allowedRoles)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() with AuthError if user does not have any allowed role', () => {
      const req = mockRequest({}, { id: 'testUserId', roles: ['user'] }) as IAuthRequest;
      const res = mockResponse();
      const allowedRoles = ['admin', 'editor'];

      authorize(allowedRoles)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as unknown as AuthError;
      // Corrected message
      expect(error.message).toBe(`Forbidden. User does not have the required roles. Allowed: ${allowedRoles.join(', ')}`); 
      expect(error.statusCode).toBe(403);
    });

    it('should call next() with AuthError if req.user is undefined', () => {
      const req = mockRequest() as IAuthRequest; // user is undefined by mockRequest default
      const res = mockResponse();
      const allowedRoles = ['admin'];

      authorize(allowedRoles)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
       const error = mockNext.mock.calls[0][0] as unknown as AuthError;
      expect(error.message).toBe('User roles not available. Authorization check failed.'); // Corrected message
      expect(error.statusCode).toBe(403); // Corrected status code
    });

    it('should call next() with AuthError if req.user.roles is undefined (though unlikely with protect)', () => {
        const req = mockRequest({}, { id: 'testUserId', roles: undefined }) as IAuthRequest;
        const res = mockResponse();
        const allowedRoles = ['admin'];
  
        authorize(allowedRoles)(req, res, mockNext);
  
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
        const error = mockNext.mock.calls[0][0] as unknown as AuthError;
        expect(error.message).toBe('User roles not available. Authorization check failed.');
        expect(error.statusCode).toBe(403);
      });

    it('should work with a single allowed role as a string (convenience)', () => {
      const req = mockRequest({}, { id: 'testUserId', roles: ['editor'] }) as IAuthRequest;
      const res = mockResponse();
      authorize(['editor'])(req, res, mockNext); 

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access if user roles array is empty and roles are required', () => {
      const req = mockRequest({}, { id: 'testUserId', roles: [] }) as IAuthRequest;
      const res = mockResponse();
      const allowedRoles = ['admin'];

      authorize(allowedRoles)(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as unknown as AuthError;
      // Corrected message
      expect(error.message).toBe(`Forbidden. User does not have the required roles. Allowed: ${allowedRoles.join(', ')}`);
      expect(error.statusCode).toBe(403);
    });
  });
}); 