import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import * as schema from '../../drizzle/schema';

@Module({
  imports: [
    // Method #1: Pass options object
    DrizzlePostgresModule.register({
      postgres: {
        url: process.env.DATABASE_URL,
      },
      config: { schema: { ...schema } },
    }),
  ],
  controllers: [],
  providers: [DbService],
})
export class DbModule {}
