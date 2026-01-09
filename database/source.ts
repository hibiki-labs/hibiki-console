import 'reflect-metadata';

import { DataSource, DataSourceOptions, EntityManager } from 'typeorm';
import User from './entities/User';
import { seedDatabase } from './seed';

let isSeeded = false;

const entities = [User];

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '1521', 10),
  username: process.env.DB_USER_NAME,
  password: process.env.DB_USER_PASS,
  database: process.env.DB_NAME,
  logging: false,
  synchronize: process.env.NODE_ENV === 'development',
  dropSchema: process.env.NODE_ENV === 'development',
  entities,
  subscribers: [],
  migrations: [],
};

export default class AppDataSource {
  private static dataSource = new DataSource(dataSourceOptions);

  static async getConnection(): Promise<DataSource> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();

      // Auto-seed on first initialization
      if (!isSeeded && process.env.NODE_ENV === 'development') {
        await seedDatabase();
        isSeeded = true;
      }
    }
    return this.dataSource;
  }

  static async getManager(): Promise<EntityManager> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();

      // Auto-seed on first initialization
      if (!isSeeded && process.env.NODE_ENV === 'development') {
        await seedDatabase();
        isSeeded = true;
      }
    }
    return this.dataSource.manager;
  }
}
