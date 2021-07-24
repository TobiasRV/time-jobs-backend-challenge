import { Controller, Get, Query } from '@nestjs/common';
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
  ): Promise<WeatherResponseDto[]> {
    const response = new Array<WeatherResponseDto>();
    for (const city of cities) {
      const apiUrl = `${process.env.OPENWEATHERMAP_API_URL}/weather?q=${city}&units=metric&appid=31867d244f6658cf68328775fbfd49d9`;
      const weather = await this.weatherService.findByCity(city);
      if (weather) {
        if (
          weather.searchDate.setHours(weather.searchDate.getHours() + 1) >=
          Date.now()
        ) {
          response.push(parseResponse(weather.temperature, weather.city, 1));
        } else {
          const apiResponse = await this.openWeatherApiService.getWeather(
            apiUrl,
          );
          await this.weatherService.update(apiResponse.main.temp, city);
          response.push(
            parseResponse(apiResponse.main.temp, city, apiResponse.attempts),
          );
        }
      } else {
        const apiResponse = await this.openWeatherApiService.getWeather(apiUrl);
        const savedWeather = await this.weatherService.create(
          apiResponse.main.temp,
          city,
        );
        response.push(
          parseResponse(savedWeather.temperature, city, apiResponse.attempts),
        );
      }
    }
    return response;
  }
}

function parseResponse(
  temperature,
  city,
  attempts: number,
): WeatherResponseDto {
  return new WeatherResponseDto(temperature, city, attempts);
}
