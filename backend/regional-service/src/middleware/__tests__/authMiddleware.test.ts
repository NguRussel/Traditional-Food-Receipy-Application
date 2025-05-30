import { Request, Response, NextFunction } from 'express';
import { protect, authorize, AuthError, IAuthRequest } from '../authMiddleware';

// Mock Express request, response, and next function
const mockRequest = (headers: any = {}, user: any = undefined): Partial<IAuthRequest> => ({
    headers,
    user,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    describe('protect middleware', () => {
        it('should call next() if x-user-id and x-user-roles headers are present', () => {
            const req = mockRequest({ 'x-user-id': '123', 'x-user-roles': 'user,editor' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
            expect(req.user).toEqual({ id: '123', roles: ['user', 'editor'] });
        });

        it('should call next with AuthError if x-user-id is missing', () => {
            const req = mockRequest({ 'x-user-roles': 'user' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            expect(mockNext.mock.calls[0][0].message).toBe('Not authorized, no user credentials provided');
            expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should call next with AuthError if x-user-roles is missing', () => {
            const req = mockRequest({ 'x-user-id': '123' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            expect(mockNext.mock.calls[0][0].message).toBe('Not authorized, no user credentials provided');
            expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should handle empty roles string correctly', () => {
            const req = mockRequest({ 'x-user-id': '123', 'x-user-roles': '' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(); // Assuming empty roles string is treated as no roles, but still valid user id
            expect(req.user).toEqual({ id: '123', roles: [''] }); // or roles: [] depending on implementation detail
        });
    });

    describe('authorize middleware', () => {
        it('should call next() if user has an allowed role', () => {
            const req = mockRequest({}, { id: '123', roles: ['admin'] }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeAdmin = authorize(['admin', 'editor']);
            authorizeAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should call next with AuthError if user does not have any allowed role', () => {
            const req = mockRequest({}, { id: '123', roles: ['user'] }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeAdmin = authorize(['admin', 'editor']);
            authorizeAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            expect(mockNext.mock.calls[0][0].message).toContain('not authorized to access this route');
            expect(mockNext.mock.calls[0][0].statusCode).toBe(403);
        });

        it('should call next with AuthError if req.user is not defined', () => {
            const req = mockRequest() as IAuthRequest; // No user on req
            const res = mockResponse() as Response;
            const authorizeAdmin = authorize(['admin']);
            authorizeAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            expect(mockNext.mock.calls[0][0].message).toBe('Not authorized, user roles not available');
        });

        it('should call next with AuthError if req.user.roles is not defined or empty', () => {
            const req = mockRequest({}, { id: '123', roles: [] }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeAdmin = authorize(['admin']);
            authorizeAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
             expect(mockNext.mock.calls[0][0].message).toContain('not authorized to access this route');
        });
    });
}); 