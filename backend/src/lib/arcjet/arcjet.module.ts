import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  fixedWindow,
  ArcjetModule as NestArcjetModule,
  shield,
} from '@arcjet/nest';

@Global()
@Module({
  imports: [
    NestArcjetModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        key: configService.get<string>('ARCJET_KEY')!,
        rules: [
          shield({ mode: 'LIVE' }),
          fixedWindow({
            mode: 'LIVE',
            window: '60s',
            max: 10,
          }),
        ],
      }),
    }),
  ],
  exports: [NestArcjetModule],
})
export class ArcjetModule {}
