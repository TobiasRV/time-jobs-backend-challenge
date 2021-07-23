import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Weather, WeatherDocument } from './entities/weather.entity';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async findOne(weatherFilterQuery: FilterQuery<Weather>): Promise<Weather> {
    return this.weatherModel.findOne(weatherFilterQuery);
  }

  async find(weatherFilterQuery: FilterQuery<Weather>): Promise<Weather[]> {
    return this.weatherModel.find(weatherFilterQuery);
  }

  async create(weather: Weather): Promise<Weather> {
    const newWeather = new this.weatherModel(weather);
    return newWeather.save();
  }

  async findOneAndUpdate(
    weatherFilterQuery: FilterQuery<Weather>,
    weather: Partial<Weather>,
  ): Promise<Weather> {
    return this.weatherModel.findByIdAndUpdate(weatherFilterQuery, weather);
  }
}
