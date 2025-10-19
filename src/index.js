const path = require('path');
const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envPath });
const express = require('express');
const cors = require('cors');
const v1Router = require('./routers');

const app = express();
const PORT = process.env.PORT || 3000;

// a json middleware
app.use(express.json());
// cors middleware
app.use(cors());

// Mount v1Router
app.use('/v1', v1Router);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
