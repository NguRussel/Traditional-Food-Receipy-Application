import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { protectAdmin, authorizeAdminRoles, authorizeAdminPermissions, AuthError, IAuthRequest } from '../authMiddleware';
import { Admin, IAdmin, AdminRole } from '../../models/Admin';

// Mock the Admin model
jest.mock('../../models/Admin');
const MockedAdmin = Admin as jest.Mocked<typeof Admin>;

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

const mockAdminId = new mongoose.Types.ObjectId().toString();

describe('Admin Auth Middleware', () => {
    let mockRequest: Partial<IAuthRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    beforeEach(() => {
        process.env = { ...originalEnv }; // Reset environment variables for each test
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks(); // Clear all mocks before each test
    });

    afterAll(() => {
        process.env = originalEnv; // Restore original environment variables
    });

    describe('protectAdmin', () => {
        it('should call next() and set req.admin if token is valid and admin is active', async () => {
            process.env.ADMIN_JWT_SECRET = 'testsecret';
            mockRequest.headers = { authorization: 'Bearer validtoken' };
            const mockAdminUser = {
                _id: mockAdminId,
                isActive: true,
                roles: [AdminRole.SUPER_ADMIN],
                // ... other admin properties
            } as IAdmin;

            mockedJwt.verify.mockReturnValue({ id: mockAdminId } as any);
            (MockedAdmin.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockAdminUser),
            });

            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);

            expect(mockedJwt.verify).toHaveBeenCalledWith('validtoken', 'testsecret');
            expect(MockedAdmin.findById).toHaveBeenCalledWith(mockAdminId);
            expect(nextFunction).toHaveBeenCalledWith();
            expect(mockRequest.admin).toEqual(mockAdminUser);
        });

        it('should call next(AuthError) if ADMIN_JWT_SECRET is not defined', async () => {
            delete process.env.ADMIN_JWT_SECRET; // Ensure it's undefined
            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Server configuration error');
            expect(error.statusCode).toBe(500);
        });

        it('should call next(AuthError) if no token is provided', async () => {
            process.env.ADMIN_JWT_SECRET = 'testsecret';
            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, no token provided');
        });

        it('should call next(AuthError) if token is malformed (not Bearer)', async () => {
            process.env.ADMIN_JWT_SECRET = 'testsecret';
            mockRequest.headers = { authorization: 'Invalidtokenformat' };
            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, no token provided'); // Falls into the same case as no token
        });

        it('should call next(AuthError) if jwt.verify fails', async () => {
            process.env.ADMIN_JWT_SECRET = 'testsecret';
            mockRequest.headers = { authorization: 'Bearer invalidtoken' };
            mockedJwt.verify.mockImplementation(() => { throw new jwt.JsonWebTokenError('jwt malformed'); });

            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, token failed');
        });

        it('should call next(AuthError) if admin not found', async () => {
            process.env.ADMIN_JWT_SECRET = 'testsecret';
            mockRequest.headers = { authorization: 'Bearer validtoken' };
            mockedJwt.verify.mockReturnValue({ id: mockAdminId } as any);
            (MockedAdmin.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null), // Admin not found
            });

            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, admin not found');
        });

        it('should call next(AuthError) if admin is not active', async () => {
            process.env.ADMIN_JWT_SECRET = 'testsecret';
            mockRequest.headers = { authorization: 'Bearer validtoken' };
            const mockInactiveAdmin = { _id: mockAdminId, isActive: false } as IAdmin;
            mockedJwt.verify.mockReturnValue({ id: mockAdminId } as any);
            (MockedAdmin.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockInactiveAdmin),
            });

            await protectAdmin(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, admin account is not active');
            expect(error.statusCode).toBe(403);
        });
    });

    describe('authorizeAdminRoles', () => {
        it('should call next() if admin has an allowed role', () => {
            mockRequest.admin = { roles: [AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MODERATOR] } as IAdmin;
            const authorize = authorizeAdminRoles([AdminRole.SUPER_ADMIN]);
            authorize(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next(AuthError) if admin does not have an allowed role', () => {
            mockRequest.admin = { roles: [AdminRole.CONTENT_MODERATOR] } as IAdmin;
            const authorize = authorizeAdminRoles([AdminRole.SUPER_ADMIN]);
            authorize(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toContain('not authorized');
            expect(error.statusCode).toBe(403);
        });

        it('should call next(AuthError) if req.admin or req.admin.roles is undefined', () => {
            mockRequest.admin = undefined; // Simulate admin not set
            const authorize = authorizeAdminRoles([AdminRole.SUPER_ADMIN]);
            authorize(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, admin roles not available');
        });
    });

    describe('authorizeAdminPermissions', () => {
        it('should call next() if admin has all required permissions', () => {
            mockRequest.admin = { permissions: ['manage_users', 'delete_content'] } as IAdmin;
            const authorize = authorizeAdminPermissions(['manage_users', 'delete_content']);
            authorize(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next(AuthError) if admin is missing a required permission', () => {
            mockRequest.admin = { permissions: ['manage_users'] } as IAdmin;
            const authorize = authorizeAdminPermissions(['manage_users', 'delete_content']);
            authorize(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toContain('does not have all required permissions');
            expect(error.statusCode).toBe(403);
        });

        it('should call next(AuthError) if req.admin or req.admin.permissions is undefined', () => {
            mockRequest.admin = { roles: [AdminRole.SUPER_ADMIN] } as IAdmin; // No permissions array
            const authorize = authorizeAdminPermissions(['manage_users']);
            authorize(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
            const error = (nextFunction as jest.Mock).mock.calls[0][0] as AuthError;
            expect(error.message).toBe('Not authorized, admin permissions not available');
        });
    });
}); 