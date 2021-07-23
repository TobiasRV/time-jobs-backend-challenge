import { Test, TestingModule } from '@nestjs/testing';
import { OpenWeatherMapService } from './openWeatherMapApi.service';
import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';
import { HttpException } from '@nestjs/common';

const apiResponse = {
  coord: { lon: -0.1257, lat: 51.5085 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01n' }],
  base: 'stations',
  main: {
    temp: 294.22,
    feels_like: 294.05,
    temp_min: 290.07,
    temp_max: 296.48,
    pressure: 1022,
    humidity: 64,
  },
  visibility: 10000,
  wind: { speed: 5.14, deg: 80 },
  clouds: { all: 1 },
  dt: 1626986359,
  sys: {
    type: 2,
    id: 2006068,
    country: 'GB',
    sunrise: 1626926991,
    sunset: 1626984223,
  },
  timezone: 3600,
  id: 2643743,
  name: 'London',
  cod: 200,
};

const cityNotFound = {
  cod: '404',
  message: 'city not found',
};

const correctApiURL =
  'http://api.openweathermap.org/data/2.5/weather?q=London&appid=31867d244f6658cf68328775fbfd49d9';
const incorrectApiURL =
  'http://api.openweathermap.org/data/2.5/weather?q=Londonasd&appid=31867d244f6658cf68328775fbfd49d9';

jest.mock('node-fetch');

describe('WeatherService', () => {
  let service: OpenWeatherMapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenWeatherMapService],
    }).compile();

    service = module.get<OpenWeatherMapService>(OpenWeatherMapService);
  });

  it('should responde with the weather', async () => {
    mocked(fetch).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(apiResponse),
      }),
    );

    await expect(service.getWeather(correctApiURL)).resolves.toEqual(
      apiResponse,
    );
  });

  it('should throw exeption', async () => {
    mocked(fetch).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(cityNotFound),
      }),
    );
    await expect(service.getWeather(incorrectApiURL)).rejects.toThrow(
      HttpException,
    );
  });
});
