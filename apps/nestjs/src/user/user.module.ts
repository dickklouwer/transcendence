import { Module } from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { DbService } from '../db/db.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule], // Import DbModule to access DbService
  providers: [UserGateway],
  exports: [UserGateway], // Export UserGateway so it can be used in other modules
})
export class UserModule {}