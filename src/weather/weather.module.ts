import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from './entities/weather.entity';
import { OpenWeatherMapService } from '../openWeatherMapAPI/openWeatherMapApi.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, OpenWeatherMapService],
})
export class WeatherModule {}
