const config = require('./utils/config');
const connectToDB = require('./utils/db');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const morganMiddleware = require('./middleware/morgan');
const { logger } = require('./utils/logger');

const successResponseMiddleware = require('./middleware/successResponse.middleware');
const v1Router = require('./routers');
const errorMiddleware = require('./middleware/error');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const { error } = require('winston');

const swaggerCustomCss = `
  .swagger-ui .opblock-body pre.microlight { font-size: 17px; }
  .swagger-ui textarea { font-size: 17px; }
  .swagger-ui .responses-inner h4 { font-size: 16px; }
  .swagger-ui .responses-inner h5 { font-size: 14px; }
`;

const app = express();

const PORT = config.PORT;

app.use(helmet());
app.use(morganMiddleware);
app.use(express.json());
app.use(cors());
app.use(compression());

// To "enchant" the `res` object before it enters the Controller, this middleware must be registered before the Router
app.use(successResponseMiddleware);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customCss: swaggerCustomCss })
);

app.use('/v1', v1Router);

errorMiddleware.forEach((handler) => {
  app.use(handler);
});

connectToDB();

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
