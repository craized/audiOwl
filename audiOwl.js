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
	fs = require('fs'),
	db = require('./lib/db.js'),
	http = require('http'),
	url = require('url');

/* Load Config Data */
var cfg = db.read('config');

/* Start Server */
http.createServer(function(req, res) {
	var page = url.parse(req.url, true);
	var file = page.pathname == '/' ? 'index.html' : page.pathname;
	var fpath = basedir+'/htdocs/'+file;

	// Attempt to load requested file
	fs.readFile(fpath, function(err, data) {
		// Throw 404 on error
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Error 404! Page could not be found.');
			return;
		}
		
		// Determine MIME TYPE
		/// NOTE: replace with better system later ///
		var type = 'text/plain';
		if (file.indexOf('.html') != -1) type = 'text/html';
		else if (file.indexOf('.js') != -1) type = 'text/javascript';
		else if (file.indexOf('.css') != -1) type = 'text/css';
		else if (file.indexOf('.png') != -1) type = 'image/png';
		else if (file.indexOf('.jpg') != -1) type = 'image/jpg';

		// Send data to browser
		res.writeHead(200, {'Content-Type': type });
		res.end(fs.readFileSync(fpath));

		sys.log('[GET] Sent file requested ('+file+'; '+type+')');
	});
}).listen(cfg.port, cfg.ip);

sys.log('Server running at '+cfg.ip+':'+cfg.port);
