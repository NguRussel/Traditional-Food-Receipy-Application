import { Request, Response, NextFunction } from 'express';
import { protect, authorize, IAuthRequest, AuthError } from '../authMiddleware'; // Adjust path as needed
import CustomError from '../../utils/CustomError';

// Mock Express request, response, and next function
const mockRequest = (headers = {}, user: any = undefined): Partial<IAuthRequest> => ({
    headers,
    user,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    describe('protect middleware', () => {
        it('should call next() if x-user-id and x-user-roles headers are present', () => {
            const req = mockRequest({ 'x-user-id': '123', 'x-user-roles': 'user,admin' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
            expect(req.user).toBeDefined();
            expect(req.user?.id).toBe('123');
            expect(req.user?.roles).toEqual(['user', 'admin']);
        });

        it('should call next() with an AuthError if x-user-id header is missing', () => {
            const req = mockRequest({ 'x-user-roles': 'user' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (mockNext as jest.MockedFunction<NextFunction>).mock.calls[0][0] as unknown as AuthError;
            expect(error.message).toBe('User ID not provided. Authentication required.');
            expect(error.statusCode).toBe(401);
        });

        it('should call next() and set empty roles if x-user-roles header is missing', () => {
            const req = mockRequest({ 'x-user-id': '123' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
            expect(req.user).toBeDefined();
            expect(req.user?.roles).toEqual([]);
        });

        it('should parse comma-separated roles correctly', () => {
            const req = mockRequest({ 'x-user-id': '123', 'x-user-roles': 'user,editor,viewer' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(req.user?.roles).toEqual(['user', 'editor', 'viewer']);
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should handle roles with extra spaces correctly due to middleware trimming', () => {
            const req = mockRequest({ 'x-user-id': '123', 'x-user-roles': ' user , admin ' }) as IAuthRequest;
            const res = mockResponse() as Response;
            protect(req, res, mockNext);
            expect(req.user?.roles).toEqual(['user', 'admin']);
            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    describe('authorize middleware', () => {
        it('should call next() if user has one of the required roles', () => {
            const req = mockRequest({}, { id: '123', roles: ['admin'] }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeAdmin = authorize(['admin', 'superadmin']);
            authorizeAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should call next() with a CustomError if user does not have any required roles', () => {
            const req = mockRequest({}, { id: '123', roles: ['user'] }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeAdmin = authorize(['admin']);
            authorizeAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
            const error = (mockNext as jest.MockedFunction<NextFunction>).mock.calls[0][0] as unknown as CustomError;
            expect(error.message).toBe('You do not have permission to perform this action');
            expect(error.statusCode).toBe(403);
        });

        it('should call next() with an AuthError if req.user is not defined', () => {
            const req = mockRequest() as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeUser = authorize(['user']);
            authorizeUser(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (mockNext as jest.MockedFunction<NextFunction>).mock.calls[0][0] as unknown as AuthError;
            expect(error.message).toBe('User not authenticated.');
            expect(error.statusCode).toBe(401);
        });

        it('should call next() with an AuthError if req.user.roles is not defined (user object exists but no roles)', () => {
            const req = mockRequest({}, { id: '123' /* roles missing */ }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeUser = authorize(['user']);
            authorizeUser(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (mockNext as jest.MockedFunction<NextFunction>).mock.calls[0][0] as unknown as AuthError;
            expect(error.message).toBe('User not authenticated.');
            expect(error.statusCode).toBe(401);
        });

         it('should handle multiple required roles correctly', () => {
            const req = mockRequest({}, { id: '123', roles: ['editor'] }) as IAuthRequest;
            const res = mockResponse() as Response;
            const authorizeEditorOrAdmin = authorize(['editor', 'admin']);
            authorizeEditorOrAdmin(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });
    });
}); 