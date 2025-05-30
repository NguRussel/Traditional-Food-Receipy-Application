import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validateMongoIdParam, handleValidationErrors } from '../validationMiddleware'; // Adjust path as needed

// Mock Express request, response, and next function
const mockRequest = (params: any = {}, query: any = {}, body: any = {}) => {
  return {
    params,
    query,
    body,
  } as unknown as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Validation Middleware', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  describe('validateMongoIdParam', () => {
    it('should call next() if a valid MongoDB ID is provided in params', async () => {
      const req = mockRequest({ id: '60d5ec49f739d4001c9d8182' }); // Valid MongoID
      const res = mockResponse();
      const validator = validateMongoIdParam('id');
      
      // Express-validator chains are arrays of middleware, so we need to run them
      // and then check the result. This is a bit simplified for a single validator.
      // In a real test with multiple validators, you might need a helper.
      await validator(req, res, mockNext);
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
      expect(mockNext).toHaveBeenCalledTimes(1); 
      expect(mockNext).toHaveBeenCalledWith(); // Called with no arguments
    });

    it('should not call next() and populate errors if an invalid MongoDB ID is provided', async () => {
      const req = mockRequest({ id: 'invalid-id' });
      const res = mockResponse();
      const validator = validateMongoIdParam('id');

      await validator(req, res, mockNext);
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Invalid id format in URL parameter');
      expect(mockNext).not.toHaveBeenCalled(); // next() should not be called by the validator itself on error
                                            // handleValidationErrors would be responsible for response
    });
  });

  describe('handleValidationErrors', () => {
    it('should call next() if there are no validation errors', () => {
      const req = mockRequest();
      // Simulate no errors by not running any validators that would add errors
      const res = mockResponse();
      
      handleValidationErrors(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 with errors if validation errors exist', async () => {
      // First, run a validator that will fail to populate errors
      const failingReq = mockRequest({ id: 'invalid' });
      const validator = validateMongoIdParam('id');
      await validator(failingReq, mockResponse(), mockNext); // Run validator to add errors to request
      jest.clearAllMocks(); // Clear mockNext from validator call

      const res = mockResponse();
      handleValidationErrors(failingReq, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Invalid id format in URL parameter' }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 