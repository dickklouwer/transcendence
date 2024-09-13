import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { PongModule } from './pong/pong.module';
import { ConfigModule } from '@nestjs/config';
import { MessagesGateway } from './messages/messages.gateway';
import { UserGateway } from './user/user.gateway';

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
  providers: [AppService, DbService, UserGateway, MessagesGateway],
})
export class AppModule {}
