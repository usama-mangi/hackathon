import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ResponseInterceptor(reflector);
  });

  it('should format successful responses with statusCode, message and data', async () => {
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

    const val = await firstValueFrom(
      interceptor.intercept(mockContext, mockCallHandler),
    );
    expect(val).toEqual({
      statusCode: 200,
      message: 'success',
      data: mockData,
    });
  });

  it('should use custom message from ResponseMessage decorator if present', async () => {
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

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue('Custom message');

    const val = await firstValueFrom(
      interceptor.intercept(mockContext, mockCallHandler),
    );
    expect(val).toEqual({
      statusCode: 201,
      message: 'Custom message',
      data: mockData,
    });
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      RESPONSE_MESSAGE_KEY,
      [mockHandler, mockClass],
    );
  });

  it('should map undefined or null data to null', async () => {
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

    const val = await firstValueFrom(
      interceptor.intercept(mockContext, mockCallHandler),
    );
    expect(val).toEqual({
      statusCode: 204,
      message: 'success',
      data: null,
    });
  });
});
