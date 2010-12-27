/*
 *
 * audiOwl
 * Music Management
 *
 * Startup Script
 *
 */

GLOBAL.basedir = __dirname;
GLOBAL.in_array = function (needle, haystack, argScript) {
    var key = '', strict = !!argStrict;
 
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }
 
    return false;
};

/* Include Libraries */
var sys = require('sys'),
    db = require('./lib/db.js'),
    http = require('http');

/* Load Config Data */
var cfg = db.read('config');

/* Start Server */
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Welcome to audiOwl\n');
}).listen(cfg.port, cfg.ip);

sys.log('Server running at '+cfg.ip+':'+cfg.port);
