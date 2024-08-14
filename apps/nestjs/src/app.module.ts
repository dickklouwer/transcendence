import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { PongModule } from './pong/pong.module';
import { ConfigModule } from '@nestjs/config';
import { UserGateway } from './friends/user.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    AuthModule,
    DbModule,
    PongModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService, UserGateway],
})
export class AppModule {}
