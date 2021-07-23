import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';

import { HttpErrorFilter } from './httpError.filter';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));
const mockGetRequest = jest.fn().mockImplementation(() => ({
  url: '/weather?city=asdasd',
  method: '/GET',
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest,
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

describe('System header validation service', () => {
  let service: HttpErrorFilter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpErrorFilter],
    }).compile();
    service = module.get<HttpErrorFilter>(HttpErrorFilter);
  });

  describe('All exception filter tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('Http exception', () => {
      service.catch(
        new HttpException('Http exception', HttpStatus.BAD_REQUEST),
        mockArgumentsHost,
      );
      expect(mockHttpArgumentsHost).toBeCalled;
      expect(mockGetResponse).toBeCalled;
      expect(mockStatus).toBeCalled;
      expect(mockGetRequest).toHaveBeenCalled();
    });
  });
});
