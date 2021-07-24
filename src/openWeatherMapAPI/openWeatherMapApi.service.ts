import { HttpException, Injectable, UseFilters } from '@nestjs/common';
import fetch from 'node-fetch';
import { HttpErrorFilter } from '../utils/httpError.filter';
import statusCodes from '../constants/statusCodes';
import statusMessages from '../constants/statusMessages';
import { IOpenWeatherMapResponse } from './interfaces/openWeatherMapResponse.interface';

@UseFilters(new HttpErrorFilter())
@Injectable()
export class OpenWeatherMapService {
  async getWeather(
    url: string,
    attempts = 1,
  ): Promise<IOpenWeatherMapResponse> {
    if (attempts > 3)
      throw new HttpException(
        statusMessages.OPENWEATHERMAP_API_ERROR,
        statusCodes.SERVICE_UNAVAILABLE,
      );
    if (Math.random() <= 0.15) {
      attempts++;
      this.getWeather(url, attempts);
    }
    const response = await fetch(url);
    const responseJson = await response.json();
    if (responseJson.cod === 200) {
      responseJson as IOpenWeatherMapResponse;
      responseJson.attempts = attempts;
      return responseJson;
    } else {
      throw new HttpException(responseJson.message, responseJson.cod);
    }
  }
}
