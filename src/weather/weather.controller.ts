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
    description: 'The temperature of the selected city',
  })
  @ApiInternalServerErrorResponse()
  @ApiNotFoundResponse()
  @ApiServiceUnavailableResponse()
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'country', required: false })
  @Get()
  async getWeather(
    @Query('city') city: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    attemtps = 1,
  ): Promise<WeatherResponseDto> {
    if (attemtps <= 3) {
      let fullCity = city;
      let apiUrl = `${
        process.env.OPENWEATHERMAP_API_URL ||
        'https://api.openweathermap.org/data/2.5'
      }/weather?q=${city}`;
      if (state) {
        apiUrl += `,${state}`;
        fullCity += `,${state}`;
      }
      if (country) {
        apiUrl += `,${country}`;
        fullCity += `,${country}`;
      }
      const weather = await this.weatherService.findByCity(fullCity);
      if (
        weather &&
        weather.searchDate.setHours(weather.searchDate.getHours() + 1) >=
          Date.now()
      ) {
        return parseResponse(weather.temperature, weather.city, attemtps);
      }
      apiUrl += `&units=metric&appid=31867d244f6658cf68328775fbfd49d9`;
      const response = await this.openWeatherApiService.getWeather(apiUrl);
      const failurePorcentaje = Math.random();
      if (failurePorcentaje <= 0.15) {
        attemtps++;
        this.getWeather(city, state, country, attemtps);
      }
      if (weather) {
        await this.weatherService.update(response.main.temp, fullCity);
        return parseResponse(response.main.temp, fullCity, attemtps);
      }
      const savedWeather = await this.weatherService.create(
        response.main.temp,
        fullCity,
      );
      return parseResponse(savedWeather.temperature, fullCity, attemtps);
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
