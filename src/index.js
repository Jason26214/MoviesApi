const config = require('./utils/config');
const connectToDB = require('./utils/db');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const morganMiddleware = require('./middleware/morgan');
const { logger } = require('./utils/logger');

const v1Router = require('./routers');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

const app = express();

const PORT = config.PORT;

app.use(helmet());
app.use(morganMiddleware);
app.use(express.json());
app.use(cors());
app.use(compression());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/v1', v1Router);

connectToDB();

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
