import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema()
export class Weather {
  @ApiProperty()
  @Prop()
  temperature: number;
  @ApiProperty()
  @Prop()
  city: string;
  @Prop()
  searchDate: Date;
}
export const WeatherSchema = SchemaFactory.createForClass(Weather);
