import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponseDto {
  constructor(temperature: number, city: string, apiCalls: number) {
    this.temperature = temperature;
    this.city = city;
    this.attempts = apiCalls;
  }
  @ApiProperty()
  temperature: number;
  @ApiProperty()
  city: string;
  @ApiProperty()
  attempts: number;
}
