const express = require('express');
const cors = require('cors');
const apolloServer = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const provideContext = require('./context');

require('dotenv').config();

const app = express();
app.use(cors());

const server = new apolloServer({
	typeDefs,
	resolvers,
	context: (req) => provideContext(req);
});

const port = process.env.PORT || 3001;

app.get('/api', (req,res) => res.send("it is working."));

app.listen(port, () => console.log(`Example app listening on port ${port}`));