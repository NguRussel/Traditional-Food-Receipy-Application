import { Request, Response, NextFunction } from 'express';
import { validationResult, ResultFactory, ValidationError } from 'express-validator';
import { handleValidationErrors, validateMongoIdParam, validatePaginationQueryParams } from '../validationMiddleware';

// Mock express-validator
jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'), // Import and retain default behavior
  validationResult: jest.fn(), // Mock specific function
}));

// Mock a request, response, and next function
const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => {
  return {
    body,
    params,
    query,
  } as Request;
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
    // Reset mocks before each test
    jest.clearAllMocks();
    // Ensure validationResult is reset for each test too
    (validationResult as unknown as jest.Mock).mockClear();
  });

  describe('handleValidationErrors', () => {
    it('should call next() if there are no validation errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      (validationResult as unknown as jest.Mock).mockReturnValue({ isEmpty: () => true });

      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 with errors if validation errors exist', () => {
      const req = mockRequest();
      const res = mockResponse();
      const errors = [{ msg: 'Test error' }];
      (validationResult as unknown as jest.Mock).mockReturnValue({ 
        isEmpty: () => false, 
        array: () => errors 
      });

      handleValidationErrors(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors,
      });
    });
  });

  describe('validateMongoIdParam', () => {
    // Helper to run the validation chain
    const runValidation = async (validatorChain: any, req: Request, res: Response, next: NextFunction) => {
      await validatorChain.run(req);
    };

    it('should pass validation for a valid MongoDB ObjectId', async () => {
      const validator = validateMongoIdParam('id');
      const req = mockRequest({}, { id: '60d5f2f5a1b2c3d4e5f6a7b8' }); 
      const res = mockResponse();
      
      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualValidationResult = jest.requireActual('express-validator').validationResult(calledReq);
        // Check if the actual validator would produce errors for this specific input
        if (calledReq.params.id === '60d5f2f5a1b2c3d4e5f6a7b8') {
             // If actual validation for this ID is empty, mock that
            if(actualValidationResult.isEmpty()) return { isEmpty: () => true, array: () => [] };
        }
        // Fallback: if actual validation had errors, return them, or a generic mock error
        return actualValidationResult.isEmpty() ? { isEmpty: () => true, array: () => [] } : 
               { isEmpty: () => false, array: () => actualValidationResult.array() };
      });

      await runValidation(validator, req, res, mockNext);
      const errors = validationResult(req); 
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for an invalid MongoDB ObjectId', async () => {
      const validator = validateMongoIdParam('id');
      const req = mockRequest({}, { id: 'invalid-id' });
      const res = mockResponse();

      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
          const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
          return actualErrors;
      });

      await runValidation(validator, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe("Parameter 'id' must be a valid MongoDB ObjectId.");
    });

    it('should use the correct paramName in the error message', async () => {
      const paramName = 'testParamId';
      const validator = validateMongoIdParam(paramName);
      const req = mockRequest({}, { [paramName]: 'invalid-id' });
      const res = mockResponse();

      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
        return actualErrors;
      });

      await runValidation(validator, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe(`Parameter '${paramName}' must be a valid MongoDB ObjectId.`);
    });
  });

  describe('validatePaginationQueryParams', () => {
    const runValidators = async (validators: any[], req: Request, res: Response, next: NextFunction) => {
      for (const validator of validators) {
        // Each validator in the chain needs to run. They might modify `req` or setup for `validationResult`
        await validator.run(req);
        // If a validator in the chain itself calls next or sends a response, we might stop early.
        // However, standard express-validator chains usually just prepare for validationResult.
      }
    };

    it('should pass with valid page and limit', async () => {
      const req = mockRequest({}, {}, { page: '2', limit: '20' });
      const res = mockResponse();
      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
        return actualErrors;
      });

      await runValidators(validatePaginationQueryParams, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
      expect(req.query.page).toBe(2); // Check if toInt() worked
      expect(req.query.limit).toBe(20); // Check if toInt() worked
    });

    it('should pass with default values if page and limit are not provided', async () => {
        const req = mockRequest({}, {}, {}); // No page or limit
        const res = mockResponse();
        (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
            const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
            return actualErrors;
        });

        await runValidators(validatePaginationQueryParams, req, res, mockNext);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(true);
        // req.query.page and req.query.limit will be undefined if not provided, and that's okay
        // The controller will then apply defaults. The validator just ensures if they *are* present, they are valid.
    });

    it('should fail if page is not a positive integer', async () => {
      const req = mockRequest({}, {}, { page: 'invalid' });
      const res = mockResponse();
      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
        return actualErrors;
      });

      await runValidators(validatePaginationQueryParams, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(err => err.msg === 'Page must be a positive integer.')).toBe(true);
    });

    it('should fail if limit is not an integer between 1 and 100', async () => {
      const req = mockRequest({}, {}, { limit: '200' });
      const res = mockResponse();
      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
        return actualErrors;
      });

      await runValidators(validatePaginationQueryParams, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(err => err.msg === 'Limit must be an integer between 1 and 100.')).toBe(true);
    });

     it('should pass if only page is provided and valid', async () => {
      const req = mockRequest({}, {}, { page: '3' });
      const res = mockResponse();
       (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
        return actualErrors;
      });
      await runValidators(validatePaginationQueryParams, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
      expect(req.query.page).toBe(3);
    });

    it('should pass if only limit is provided and valid', async () => {
      const req = mockRequest({}, {}, { limit: '15' });
      const res = mockResponse();
      (validationResult as unknown as jest.Mock).mockImplementation((calledReq) => {
        const actualErrors = jest.requireActual('express-validator').validationResult(calledReq);
        return actualErrors;
      });
      await runValidators(validatePaginationQueryParams, req, res, mockNext);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
      expect(req.query.limit).toBe(15);
    });

  });
}); 