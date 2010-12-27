/*
 *
 * audiOwl
 * Music Management
 *
 * Startup Script
 *
 */

/* Include Libraries */
var db = require('./lib/db.js'),
    http = require('http');

/* Load Config Data */
var cfg = db.read('config');

/* Start Server */
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Welcome to audiOwl\n');
}).listen(cfg.port, cfg.ip);

console.log('Server running at '+cfg.ip+':'+cfg.port);
