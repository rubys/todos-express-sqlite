var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var path = require('path');

const DBFILE = process.env.DATABASE_URL ? 
  new URL(process.env.DATABASE_URL).pathname : './var/db/todos.db'

mkdirp.sync(path.dirname(DBFILE))

var db = new sqlite3.Database(DBFILE);

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER PRIMARY KEY, \
    title TEXT NOT NULL, \
    completed INTEGER \
  )");
});

module.exports = db;
