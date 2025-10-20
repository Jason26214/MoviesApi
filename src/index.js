const path = require('path');

const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envPath });

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const morganMiddleware = require('./middleware/morgan');
const { logger } = require('./utils/logger');

const v1Router = require('./routers');

const app = express();
const PORT = process.env.PORT || 3000;

// as the first middleware to set security headers
app.use(helmet());
app.use(morganMiddleware);
app.use(express.json());
app.use(cors());
app.use(compression());

// Mount v1Router
app.use('/v1', v1Router);

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
