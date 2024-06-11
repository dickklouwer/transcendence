import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../drizzle/schema';

@Injectable()
export class DbService {
  constructor(
    private readonly drizzleService: PostgresJsDatabase<typeof schema>,
  ) {}
}
