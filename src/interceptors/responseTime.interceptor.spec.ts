import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './responseTime.interceptor';

const interceptor = new ResponseTimeInterceptor();

const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  getArgs: jest.fn().mockReturnThis(),
  getArgByIndex: jest.fn().mockReturnThis(),
  switchToRpc: jest.fn().mockReturnThis(),
  switchToWs: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
};

const next = {
  handle: jest.fn(() => of()),
};

describe('SubscriberInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
  it('should fetch the request object', () => {
    interceptor.intercept(executionContext, next);
    expect(executionContext.switchToHttp).toHaveBeenCalled();
    expect(executionContext.getResponse).toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalled();
  });
});
