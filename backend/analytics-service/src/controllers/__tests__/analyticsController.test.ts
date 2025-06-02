import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
// Import the actual controller AFTER setting up mocks for its dependencies if needed at module level
// import { trackEvent } from '../analyticsController'; 
import AnalyticsEvent from '../../models/AnalyticsEvent';
import { IAuthRequest } from '../../middleware/authMiddleware';

// --- Mock express-validator globally for this test file ---
// This mock will be hoisted by Jest
const mockValidationErrors: any[] = []; // Default to no errors
const mockValidationResultImplementation = () => ({
  isEmpty: () => mockValidationErrors.length === 0,
  array: () => mockValidationErrors,
});
// Hold a reference to the mock function itself so we can spy on it
const actualMockValidationResultFn = jest.fn(mockValidationResultImplementation);

jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: actualMockValidationResultFn,
}));
// --- End mock express-validator ---


// Mock AnalyticsEvent model (as before)
jest.mock('../../models/AnalyticsEvent');

// Mock asyncHandler (as before)
jest.mock('../../middleware/asyncHandler', () => (fn: any) => fn);


// Now import the controller, it will get the mocked express-validator
import { trackEvent } from '../analyticsController';

const trackEventHandler = trackEvent[trackEvent.length - 1] as (req: IAuthRequest, res: Response, next: NextFunction) => Promise<void>;

describe('Analytics Controller - trackEvent', () => {
  let mockRequest: Partial<IAuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<void, [any?]>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = { body: {}, headers: {}, user: undefined };
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    nextFunction = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (AnalyticsEvent.create as jest.Mock).mockClear();
    
    // Reset our global validation mock for each test
    mockValidationErrors.length = 0; // Clear previous errors
    actualMockValidationResultFn.mockClear();
    // Reinstate the default implementation in case a test overrides it
    actualMockValidationResultFn.mockImplementation(mockValidationResultImplementation); 
  });

  afterEach(() => {
    actualMockValidationResultFn.mockClear();
    (AnalyticsEvent.create as jest.Mock).mockClear();
    nextFunction.mockClear();
    (mockResponse.status as jest.Mock).mockClear();
    (mockResponse.json as jest.Mock).mockClear();
    consoleErrorSpy.mockRestore();
  });


  describe('Successful Event Tracking', () => {
    it('should track an event successfully with valid input and no authenticated user', async () => {
      const eventData = { eventType: 'page_view', sessionId: 'session123', data: { page: '/home' } };
      mockRequest.body = eventData;
      const mockCreatedEvent = { ...eventData, _id: new mongoose.Types.ObjectId(), timestamp: new Date(), toJSON: () => ({...eventData, _id: 'mockId'}) };
      (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockCreatedEvent);

      await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);

      expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({ ...eventData, userId: undefined }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Event tracked successfully', data: mockCreatedEvent });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should track an event successfully with an authenticated user (req.user.id)', async () => {
      const eventData = {
        eventType: 'button_click',
        sessionId: 'session123',
        data: { buttonName: 'submit' },
      };
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.body = eventData;
      mockRequest.user = { id: userId, roles: ['user'] }; 
      const mockCreatedEvent = { ...eventData, userId: new mongoose.Types.ObjectId(userId), _id: new mongoose.Types.ObjectId(), timestamp: new Date(), toJSON: () => ({...eventData, _id: 'mockId'}) }; 
      (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockCreatedEvent);

      await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);

      expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({
        ...eventData,
        userId: new mongoose.Types.ObjectId(userId),
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should track an event successfully with userId in body and no req.user', async () => {
      const bodyUserId = new mongoose.Types.ObjectId().toString();
      const eventData = {
        eventType: 'item_viewed',
        sessionId: 'session456',
        data: { itemId: 'itemABC' },
        userId: bodyUserId,
      };
      mockRequest.body = eventData;
      const mockCreatedEvent = { ...eventData, userId: new mongoose.Types.ObjectId(bodyUserId), _id: new mongoose.Types.ObjectId(), timestamp: new Date(), toJSON: () => ({...eventData, _id: 'mockId'}) }; 
      (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockCreatedEvent);

      await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);

      expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        data: eventData.data,
        userId: new mongoose.Types.ObjectId(bodyUserId), 
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
    
    it('should prefer req.user.id over body.userId if both are present', async () => {
        const reqUserId = new mongoose.Types.ObjectId().toString();
        const bodyUserId = new mongoose.Types.ObjectId().toString(); 
        const eventData = {
          eventType: 'test_event',
          sessionId: 'session789',
          data: { test: true },
          userId: bodyUserId, 
        };
        mockRequest.body = eventData;
        mockRequest.user = { id: reqUserId, roles: ['user'] }; 
        const mockCreatedEvent = { ...eventData, userId: new mongoose.Types.ObjectId(reqUserId), _id: new mongoose.Types.ObjectId(), timestamp: new Date(), toJSON: () => ({...eventData, _id: 'mockId'}) }; 
        (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockCreatedEvent);
  
        await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
  
        expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({
          userId: new mongoose.Types.ObjectId(reqUserId), 
        }));
        expect(mockResponse.status).toHaveBeenCalledWith(201);
      });

    it('should use provided timestamp if valid', async () => {
        const providedTimestamp = new Date(Date.now() - 10000).toISOString();
        const eventData = { eventType: 'custom_event', sessionId: 'sessionXYZ', data: { detail: 'timed' }, timestamp: providedTimestamp, };
        mockRequest.body = eventData;
        const mockCreatedEvent = { ...eventData, _id: new mongoose.Types.ObjectId(), timestamp: new Date(providedTimestamp), toJSON: () => ({...eventData, _id: 'mockId'}) }; 
        (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockCreatedEvent);
  
        await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
  
        expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({
          timestamp: new Date(providedTimestamp),
        }));
        expect(mockResponse.status).toHaveBeenCalledWith(201);
      });
  });


  it('should return 400 if validationResult is not empty', async () => {
    const specificTestErrors = [{ msg: 'Test validation error', param: 'eventType', location: 'body' }];
    mockValidationErrors.push(...specificTestErrors);

    mockRequest.body = { eventType: '' }; 
    await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);

    expect(actualMockValidationResultFn).toHaveBeenCalledWith(mockRequest);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ errors: specificTestErrors });
    expect(AnalyticsEvent.create).not.toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });

  describe('Error Handling', () => {
    beforeEach(() => {
        // Ensure validation passes for error handling tests unless specifically testing validation errors
        mockValidationErrors.length = 0; 
        actualMockValidationResultFn.mockImplementation(mockValidationResultImplementation);
    });

    it('should call next with the error if AnalyticsEvent.create fails', async () => {
        const eventData = { eventType: 'db_error_test', sessionId: 'sessionErr', data: { info: 'expecting db error' }};
        mockRequest.body = eventData;
        const dbError = new Error('Database creation failed');
        (AnalyticsEvent.create as jest.Mock).mockRejectedValue(dbError);
  
        await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
  
        expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining(eventData));
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(nextFunction).toHaveBeenCalledWith(dbError);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error tracking event:', dbError);
      });
  
      it('should log an error and proceed if req.user.id conversion to ObjectId fails', async () => {
          const eventData = { eventType: 'type', sessionId: 'sess', data: {} };
          mockRequest.body = eventData;
          mockRequest.user = { id: 'invalid-object-id', roles: ['user'] };
          // Simulate a successful creation even if ObjectId conversion logged an error
          const mockSuccessfulEvent = { ...eventData, userId: undefined, _id: new mongoose.Types.ObjectId(), timestamp: new Date(), toJSON: () => ({...eventData, _id: 'mockId'}) }; 
          (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockSuccessfulEvent); 
          
          await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
  
          expect(consoleErrorSpy).toHaveBeenCalledWith('Error converting req.user.id to ObjectId:', expect.any(Error));
          expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({ userId: undefined }));
          expect(mockResponse.status).toHaveBeenCalledWith(201);
          expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockSuccessfulEvent }));
      });
  
      it('should log an error and proceed if bodyUserId conversion to ObjectId fails', async () => {
          const eventData = { eventType: 'type', sessionId: 'sess', data: {}, userId: 'invalid-object-id-in-body' };
          mockRequest.body = eventData;
          mockRequest.user = undefined; 
          const mockSuccessfulEvent = { ...eventData, userId: undefined, _id: new mongoose.Types.ObjectId(), timestamp: new Date(), toJSON: () => ({...eventData, _id: 'mockId'}) }; 
          (AnalyticsEvent.create as jest.Mock).mockResolvedValue(mockSuccessfulEvent); 
          
          await trackEventHandler(mockRequest as IAuthRequest, mockResponse as Response, nextFunction);
  
          expect(consoleErrorSpy).toHaveBeenCalledWith('Error converting bodyUserId to ObjectId:', expect.any(Error));
          expect(AnalyticsEvent.create).toHaveBeenCalledWith(expect.objectContaining({ userId: undefined }));
          expect(mockResponse.status).toHaveBeenCalledWith(201); 
          expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockSuccessfulEvent }));
      });
  });
}); 