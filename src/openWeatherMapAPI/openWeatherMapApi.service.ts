import { HttpException, Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { IOpenWeatherMapResponse } from './interfaces/openWeatherMapResponse.interface';

@Injectable()
export class OpenWeatherMapService {
  async getWeather(url: string): Promise<IOpenWeatherMapResponse> {
    const response = await fetch(url);
    const responseJson = await response.json();
    if (responseJson.cod === 200) {
      return responseJson as IOpenWeatherMapResponse;
    } else {
      throw new HttpException(responseJson.message, responseJson.cod);
    }
  }
}
