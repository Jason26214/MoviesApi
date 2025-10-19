require('dotenv').config();
const express = require('express');
const cors = require('cors');
const v1Router = require('./routers');

const app = express();
const PORT = process.env.PORT;

// a json middleware
app.use(express.json());
// cors middleware
app.use(cors());

// Mount v1Router
app.use('/v1', v1Router);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
