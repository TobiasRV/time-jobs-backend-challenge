import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WeatherModule } from '../src/weather/weather.module';
import { getModelToken } from '@nestjs/mongoose';
import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';
import { Weather } from '../src/weather/entities/weather.entity';
import * as dotenv from 'dotenv';
import { HttpErrorFilter } from '../src/utils/httpError.filter';
dotenv.config({ path: __dirname + '/.env' });

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

jest.mock('node-fetch');

describe('WeatherController (e2e)', () => {
  let app: INestApplication;
  const mockWeatherModel = {
    findOne: jest.fn((qry) => {
      if (qry.city == 'London') {
        const response = new Weather();
        response.temperature = 10;
        response.city = 'London';
        return response;
      } else {
        return null;
      }
    }),
    create: jest.fn(({ temperature, city }) => {
      return { temperature, city, id: '000123asd', __v: 0 };
    }),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WeatherModule],
    })
      .overrideProvider(getModelToken(Weather.name))
      .useValue(mockWeatherModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.useGlobalFilters(new HttpErrorFilter()).init();
  });

  it('/weather (GET) in database', async () => {
    return request(app.getHttpServer())
      .get('/weather?city=London')
      .expect(200)
      .then((res) => {
        expect(res.body.temperature).toEqual(10);
        expect(res.body.city).toEqual('London');
        expect(res.body.attempts).toBeDefined();
      });
  });
  it('/weather (GET) in api', async () => {
    mocked(fetch).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(apiResponse),
      }),
    );
    return request(app.getHttpServer())
      .get('/weather?city=Berlin')
      .expect(200)
      .then((res) => {
        expect(res.body.temperature).toBeDefined();
        expect(res.body.city).toEqual('Berlin');
        expect(res.body.attempts).toBeDefined();
      });
  });
  it('/weather (GET) HttpExecption', async () => {
    mocked(fetch).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(cityNotFound),
      }),
    );
    return request(app.getHttpServer())
      .get('/weather?city=Berlinasd')
      .expect(404)
      .then((res) => {
        expect(res.body.code).toEqual('404');
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.path).toEqual('/weather?city=Berlinasd');
        expect(res.body.method).toEqual('GET');
        expect(res.body.message).toEqual('city not found');
      });
  });
});
