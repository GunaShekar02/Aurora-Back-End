const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

app.get('/api', (req,res) => res.send("it is working."));

app.listen(port, () => console.log(`Example app listening on port ${port}`));