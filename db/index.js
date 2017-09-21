const pg = require('pg');
const posgresUrl = 'postgres://localhost/twitterdb';
const client = new pg.Client(posgresUrl);

client.connect();

module.exports = client;