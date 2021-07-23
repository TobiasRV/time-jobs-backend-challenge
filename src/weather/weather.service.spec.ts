import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { getModelToken } from '@nestjs/mongoose';
import { Weather } from './entities/weather.entity';

describe('WeatherService', () => {
  let service: WeatherService;

  const mockWeatherModel = {
    create: jest.fn(({ temperature, city }) => {
      return { temperature, city, id: '000123asd', __v: 0 };
    }),
    findOne: jest.fn(({ city }) => {
      const weather = new Weather();
      weather.temperature = 10;
      weather.city = city;
      return weather;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(Weather.name),
          useValue: mockWeatherModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the create method', async () => {
    expect(service.create(10, 'Madrid'));
    expect(mockWeatherModel.create).toHaveBeenCalled();
  });

  it('should responde with a weather object', async () => {
    await expect(service.findByCity('Madrid')).resolves.toBeInstanceOf(Weather);
    expect(mockWeatherModel.findOne).toHaveBeenCalled();
  });
});
