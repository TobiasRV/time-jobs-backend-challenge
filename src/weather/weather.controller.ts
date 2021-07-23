import { Controller, Get, HttpException, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherResponseDto } from './dto/weatherResponse.dto';
import { WeatherService } from './weather.service';
import statusCodes from '../constants/statusCodes';
import statusMessages from '../constants/statusMessages';
import { OpenWeatherMapService } from '../openWeatherMapAPI/openWeatherMapApi.service';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly openWeatherApiService: OpenWeatherMapService,
  ) {}

  @ApiOkResponse({
    type: WeatherResponseDto,
    isArray: true,
    description: 'The temperature of the selected city',
  })
  @ApiInternalServerErrorResponse()
  @ApiNotFoundResponse()
  @ApiServiceUnavailableResponse()
  @ApiQuery({ name: 'cities', required: true, isArray: true })
  @Get()
  async getWeather(
    @Query('cities') cities: string[],
    attemtps = 1,
  ): Promise<WeatherResponseDto[]> {
    if (attemtps <= 3) {
      const response = new Array<WeatherResponseDto>();
      for (const city of cities) {
        const apiUrl = `${
          process.env.OPENWEATHERMAP_API_URL ||
          'https://api.openweathermap.org/data/2.5'
        }/weather?q=${city}&units=metric&appid=31867d244f6658cf68328775fbfd49d9`;
        const weather = await this.weatherService.findByCity(city);
        if (
          weather &&
          weather.searchDate.setHours(weather.searchDate.getHours() + 1) >=
            Date.now()
        ) {
          response.push(
            parseResponse(weather.temperature, weather.city, attemtps),
          );
          continue;
        }
        const apiResponse = await this.openWeatherApiService.getWeather(apiUrl);
        const failurePorcentaje = Math.random();
        if (failurePorcentaje <= 0.15) {
          attemtps++;
          this.getWeather(cities, attemtps);
        }
        if (weather) {
          await this.weatherService.update(apiResponse.main.temp, city);
          response.push(parseResponse(apiResponse.main.temp, city, attemtps));
          continue;
        }
        const savedWeather = await this.weatherService.create(
          apiResponse.main.temp,
          city,
        );
        response.push(parseResponse(savedWeather.temperature, city, attemtps));
      }
      return response;
    } else {
      throw new HttpException(
        statusMessages.OPENWEATHERMAP_API_ERROR,
        statusCodes.SERVICE_UNAVAILABLE,
      );
    }
  }
}

function parseResponse(
  temperature,
  city,
  attempts: number,
): WeatherResponseDto {
  return new WeatherResponseDto(temperature, city, attempts);
}
