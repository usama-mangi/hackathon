import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ResponseInterceptor(reflector);
  });

  it('should format successful responses with status, message and data', (done) => {
    const mockData = { id: 1, name: 'Test' };
    const mockHandler = jest.fn();
    const mockClass = jest.fn();

    const mockResponse = {
      statusCode: 200,
    };

    const mockContext = {
      getHandler: () => mockHandler,
      getClass: () => mockClass,
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({
          status: 200,
          message: 'success',
          data: mockData,
        });
        done();
      },
    });
  });

  it('should use custom message from ResponseMessage decorator if present', (done) => {
    const mockData = { id: 1, name: 'Test' };
    const mockHandler = jest.fn();
    const mockClass = jest.fn();

    const mockResponse = {
      statusCode: 201,
    };

    const mockContext = {
      getHandler: () => mockHandler,
      getClass: () => mockClass,
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('Custom message');

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({
          status: 201,
          message: 'Custom message',
          data: mockData,
        });
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          RESPONSE_MESSAGE_KEY,
          [mockHandler, mockClass],
        );
        done();
      },
    });
  });

  it('should map undefined or null data to null', (done) => {
    const mockHandler = jest.fn();
    const mockClass = jest.fn();

    const mockResponse = {
      statusCode: 204,
    };

    const mockContext = {
      getHandler: () => mockHandler,
      getClass: () => mockClass,
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(undefined),
    } as CallHandler;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({
          status: 204,
          message: 'success',
          data: null,
        });
        done();
      },
    });
  });
});
