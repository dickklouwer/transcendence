import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { PongModule } from './pong/pong.module';

@Module({
  imports: [AuthModule, DbModule, PongModule],
  controllers: [AppController],
  providers: [AppService, DbService],

})
export class AppModule { }
