require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgres://campaign_user:campaign_pass@localhost:5432/campaign_manager';

module.exports = {
  development: {
    url: databaseUrl,
    dialect: 'postgres',
  },
  test: {
    url: databaseUrl.replace(/\/[^/]+$/, '/campaign_manager_test'),
    dialect: 'postgres',
  },
  production: {
    url: databaseUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
