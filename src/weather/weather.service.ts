import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './entities/weather.entity';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(temperature: number, city: string): Promise<Weather> {
    return this.weatherModel.create({
      temperature,
      city,
      searchDate: new Date(Date.now()),
    });
  }

  async findByCity(city: string): Promise<Weather> {
    return this.weatherModel.findOne({ city });
  }

  async update(temperature: number, city: string) {
    return this.weatherModel.updateOne(
      { city },
      { temperature, city, searchDate: new Date(Date.now()) },
    );
  }
}
