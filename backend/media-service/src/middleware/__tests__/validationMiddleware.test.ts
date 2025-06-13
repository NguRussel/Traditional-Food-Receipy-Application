import { Request, Response, NextFunction } from 'express';
import { validationResult, Result, ValidationError } from 'express-validator';
import {
  handleValidationErrors,
  validateMongoIdParam,
  validatePaginationQueryParams,
  validateModerationData,
} from '../validationMiddleware'; // Assuming validateModerationData is exported

// Mock express-validator
// jest.mock('express-validator', () => ({
//   ...jest.requireActual('express-validator'), 
//   validationResult: jest.fn(),
// }));

jest.mock('express-validator', () => {
  const actualExpressValidator = jest.requireActual('express-validator');
  const chainable = {
    isMongoId: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    toInt: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    // Add any other chainable methods used by your validators
  };
  return {
    ...actualExpressValidator,
    validationResult: jest.fn(),
    param: jest.fn().mockReturnValue(chainable),
    body: jest.fn().mockReturnValue(chainable),
    query: jest.fn().mockReturnValue(chainable),
  };
});

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  const mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    mockValidationResult.mockClear(); // Clear mock for validationResult
  });

  describe('handleValidationErrors', () => {
    it('should call next if there are no validation errors', () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
      } as Result<ValidationError>);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 with errors if validation errors exist', () => {
      const errorsFromValidator = [
        { type: 'field', path: 'field1', msg: 'Error 1' }, 
        { type: 'alternative_grouped', msg: 'Error 2' } // Example of a non-field error
      ];
      const expectedFormattedErrors = [
        { field: 'field1', message: 'Error 1' },
        { field: 'unknown', message: 'Error 2' },
      ];
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errorsFromValidator,
      } as unknown as Result<ValidationError>); 

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: expectedFormattedErrors });
    });
  });

  describe('validateMongoIdParam', () => {
    // This test requires running the actual express-validator middleware
    // We will test this via route integration tests or by more complex individual middleware tests
    // For now, we just check that it returns an array of validation chains
    it('should return an array of validation chains for a given param name', () => {
      const paramName = 'testId';
      const validators = validateMongoIdParam(paramName);
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
      // Further checks could inspect the properties of the validator objects if possible/needed
      // e.g., expect(validators[0].constructor.name).toBe('Validator');
    });
     it('should return an array of validation chains for the default param name "id"', () => {
      const validators = validateMongoIdParam();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
    });
  });

  describe('validatePaginationQueryParams', () => {
    it('should return an array of validation chains', () => {
      const validators = validatePaginationQueryParams();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBe(2); // page and limit
    });
  });
  
  describe('validateModerationData', () => {
    it('should return an array of validation chains', () => {
      const validators = validateModerationData();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0); // status and optional flaggedReason
    });
  });
}); 