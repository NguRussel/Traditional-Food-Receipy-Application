import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { handleValidationErrors } from '../validationMiddleware'; // Adjust path as needed
import CustomError from '../../utils/CustomError';

// Mock express-validator
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

const mockRequest = (body = {}, params = {}, query = {}): Partial<Request> => ({
    body,
    params,
    query,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn() as NextFunction;

const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe('Validation Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedValidationResult.mockClear();
    });

    describe('handleValidationErrors', () => {
        it('should call next() if there are no validation errors', () => {
            mockedValidationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => [],
            } as any);

            const req = mockRequest() as Request;
            const res = mockResponse() as Response;
            handleValidationErrors(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should call next() with a CustomError containing JSON stringified errors if there are validation errors', () => {
            const errors = [{ msg: 'Invalid email', param: 'email', location: 'body', path: 'email', value: 'test' }];
            const expectedErrorDetails = errors.map(e => ({ field: e.param, message: e.msg }));
            
            mockedValidationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => errors,
            } as any);

            const req = mockRequest() as Request;
            const res = mockResponse() as Response;
            handleValidationErrors(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
            const error = (mockNext as jest.MockedFunction<NextFunction>).mock.calls[0][0] as unknown as CustomError;
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe(JSON.stringify(expectedErrorDetails));
            // To check the content of the message, parse it:
            const parsedMessage = JSON.parse(error.message);
            expect(parsedMessage).toEqual(expectedErrorDetails);
        });

        it('should format multiple validation errors correctly in the JSON stringified message', () => {
            const errors = [
                { msg: 'Username is required', param: 'username', location: 'body', path: 'username', value: '' },
                { msg: 'Password too short', param: 'password', location: 'body', path: 'password', value: '123' },
            ];
            const expectedErrorDetails = errors.map(e => ({ field: e.param, message: e.msg }));

            mockedValidationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => errors,
            } as any);

            const req = mockRequest() as Request;
            const res = mockResponse() as Response;
            handleValidationErrors(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
            const error = (mockNext as jest.MockedFunction<NextFunction>).mock.calls[0][0] as unknown as CustomError;
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe(JSON.stringify(expectedErrorDetails));
             // To check the content of the message, parse it:
            const parsedMessage = JSON.parse(error.message);
            expect(parsedMessage).toEqual(expectedErrorDetails);
        });
    });

    // Add describe blocks for specific validation chains if you create them
    // e.g., describe('validateCreateNotificationRules', () => { ... });
}); 