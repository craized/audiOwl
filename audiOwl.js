/*
 *
 * audiOwl
 * Music Management
 *
 * Startup Script
 *
 */

/* Include Libraries */
GLOBAL.basedir = __dirname;
var sys = require('sys'),
    db = require('./lib/db.js'),
    http = require('http');

/* Load Config Data */
var cfg = db.read('config');

/* Start Server */
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Welcome to audiOwl\n');
}).listen(9100, 'localhost');

sys.log('Server running at '+cfg.ip+':'+cfg.port);
