import { Sequelize } from 'sequelize';
import { env } from './env';

const databaseUrl =
  env.NODE_ENV === 'test'
    ? env.DATABASE_URL.replace(/\/[^/]+$/, '/campaign_manager_test')
    : env.DATABASE_URL;

console.log(`[DB] Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
  },
});
