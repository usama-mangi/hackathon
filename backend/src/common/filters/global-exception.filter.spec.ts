import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('should format HttpExceptions correctly', () => {
    const mockStatus = 404;
    const mockMessage = 'User not found';
    const mockException = new HttpException(mockMessage, mockStatus);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(mockStatus);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: mockStatus,
      message: mockMessage,
      data: null,
    });
  });

  it('should handle non-HttpExceptions as 500 Internal Server Error', () => {
    const mockException = new Error('Database connection failed');

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      data: null,
    });
  });

  it('should extract error array/object messages from HttpException response object', () => {
    const mockStatus = 400;
    const mockErrorResponse = {
      statusCode: 400,
      message: ['email must be an email', 'password must be longer than 8 characters'],
      error: 'Bad Request',
    };
    const mockException = new HttpException(mockErrorResponse, mockStatus);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(mockStatus);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: mockStatus,
      message: mockErrorResponse.message,
      data: null,
    });
  });

  it('should extract clean validation error objects from BadRequestException response', () => {
    const mockStatus = 400;
    const mockValidationErrors = [
      { property: 'email', message: 'email must be a valid email' },
      { property: 'password', message: 'password should not be empty' },
    ];
    const mockErrorResponse = {
      message: mockValidationErrors,
    };
    const mockException = new HttpException(mockErrorResponse, mockStatus);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(mockStatus);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: mockStatus,
      message: mockValidationErrors,
      data: null,
    });
  });
});
