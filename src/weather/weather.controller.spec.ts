import { Test, TestingModule } from '@nestjs/testing';
import { OpenWeatherMapService } from '../openWeatherMapAPI/openWeatherMapApi.service';

import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;

  const mockWeatherService = {
    findByCity: jest.fn((city) => {
      if (city === 'Barcelona') {
        return {
          temperature: 20,
          city: 'Barcelona',
          searchDate: new Date(Date.now()),
        };
      } else return null;
    }),
    create: jest.fn((temperature, city) => {
      return {
        temperature,
        city,
        searchDate: new Date(Date.now()),
      };
    }),
  };
  const mockOpenWeatherMapService = {
    getWeather: jest.fn(() => {
      return {
        main: {
          temp: 20,
        },
        attempts: 1,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [WeatherService, OpenWeatherMapService],
    })
      .overrideProvider(OpenWeatherMapService)
      .useValue(mockOpenWeatherMapService)
      .overrideProvider(WeatherService)
      .useValue(mockWeatherService)
      .compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should respond with an array of weatherResponseDTO from the database', async () => {
    await expect(controller.getWeather(['Barcelona'])).resolves.toEqual([
      {
        temperature: 20,
        city: 'Barcelona',
        attempts: expect.any(Number),
      },
    ]);
    expect(mockOpenWeatherMapService.getWeather).toHaveBeenCalledTimes(0);
    expect(mockWeatherService.create).toHaveBeenCalledTimes(0);
  });
  it('should respond with an array of weatherResponseDTO from the api', async () => {
    await expect(controller.getWeather(['Madrid'])).resolves.toEqual([
      {
        temperature: 20,
        city: 'Madrid',
        attempts: expect.any(Number),
      },
    ]);
    expect(mockOpenWeatherMapService.getWeather).toHaveBeenCalled();
    expect(mockWeatherService.create).toHaveBeenCalled();
  });
  it('should respond with an array of weatherResponseDTO from the api', async () => {
    await expect(controller.getWeather(['Madrid'])).resolves.toEqual([
      {
        temperature: 20,
        city: 'Madrid',
        attempts: expect.any(Number),
      },
    ]);
    expect(mockOpenWeatherMapService.getWeather).toHaveBeenCalled();
    expect(mockWeatherService.create).toHaveBeenCalled();
  });
  it('should respond with an array of weatherResponseDTO when passes more than one city', async () => {
    await expect(
      controller.getWeather(['Madrid', 'Barcelona']),
    ).resolves.toEqual([
      {
        temperature: 20,
        city: 'Madrid',
        attempts: expect.any(Number),
      },
      {
        temperature: 20,
        city: 'Barcelona',
        attempts: expect.any(Number),
      },
    ]);
    expect(mockOpenWeatherMapService.getWeather).toHaveBeenCalled();
    expect(mockWeatherService.create).toHaveBeenCalled();
  });
});
