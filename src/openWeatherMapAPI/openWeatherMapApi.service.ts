import { HttpException, Injectable, UseFilters } from '@nestjs/common';
import fetch from 'node-fetch';
import { HttpErrorFilter } from '../utils/httpError.filter';
import statusCodes from '../constants/statusCodes';
import statusMessages from '../constants/statusMessages';
import { IOpenWeatherMapResponse } from './interfaces/openWeatherMapResponse.interface';

@UseFilters(new HttpErrorFilter())
@Injectable()
export class OpenWeatherMapService {
  async getWeather(url: string): Promise<IOpenWeatherMapResponse> {
    let attempts = 1;
    let response = null;
    while (attempts <= 3 && !response) {
      if (Math.random() > 0.15) {
        response = await fetch(url);
      } else {
        attempts++;
      }
    }
    if (response) {
      const responseJson = await response.json();
      if (responseJson.cod === 200) {
        responseJson as IOpenWeatherMapResponse;
        responseJson.attempts = attempts;
        return responseJson;
      } else {
        throw new HttpException(responseJson.message, responseJson.cod);
      }
    } else {
      throw new HttpException(
        statusMessages.OPENWEATHERMAP_API_ERROR,
        statusCodes.SERVICE_UNAVAILABLE,
      );
    }
  }
}
