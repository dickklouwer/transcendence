import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../drizzle/schema';

@Injectable()
export class DbService {
  constructor(
    @Inject('DB') private drizzleService: PostgresJsDatabase<typeof schema>,
  ) {}
}
