const express = require('express');
const cors = require('cors');
const v1Router = require('./routers');

const app = express();

// a json middleware
app.use(express.json());
// cors middleware
app.use(cors());

// Mount v1Router
app.use('/v1', v1Router);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
