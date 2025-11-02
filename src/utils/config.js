require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const optionalConfigs = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

const requiredConfigs = {
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  JWT_SECRET: process.env.JWT_SECRET,
};

// check required configs
for (const key in requiredConfigs) {
  if (requiredConfigs[key] == null) {
    throw new Error(`Missing value for env var ${key}`);
  }
}

module.exports = {
  ...optionalConfigs,
  ...requiredConfigs,
};
