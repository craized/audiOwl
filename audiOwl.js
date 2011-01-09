/*
 *
 * audiOwl
 * Music Management
 *
 * Startup Script
 *
 */

GLOBAL.basedir = __dirname;

/* Include Libraries */
var sys = require('sys'),
	fs = require('fs'),
	db = require('./lib/db.js'),
	http = require('http'),
	url = require('url'),
	jqtpl = require('./vendor/jqtpl.js');

/* Load Config Data */
var cfg = db.read('config');

/* Start Server */
http.createServer(function(req, res) {
	var page = url.parse(req.url, true);
	var file = page.pathname == '/' ? 'index.html' : page.pathname;
	var fpath = basedir+'/htdocs/'+file;

	// Hardcode POST page
	/// NOTE: replace with better system later ///
	if (file == '/post') {
		var resp = { 'error' : 'Invalid Request' }; // Response object
		var post = page.query; // Query Data

		if (post.action == 'cfg.save') {
			// Format fields for DB
			delete post.action;

			// Handle directory input
			post.dir = post.dir == undefined ? '' : post.dir;
			if (typeof post.dir != 'object') {
				post.dir = post.dir.length > 0 ? [post.dir] : [];
			}

			// Save DB
			db.save('config',post);

			// Reload DB
			cfg = db.read('config');

			resp = {'message': 'saved'};
		}

		// Send response as JSON
		res.writeHead(200, {'Content-Type': 'text/json' });
		res.end(JSON.stringify(resp));
	}
	else {
		// Attempt to load requested file
		fs.readFile(fpath, function(err, content) {
			// Throw 404 on error
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end('Error 404! Page could not be found.');
				sys.log('[E404] Page not found ('+file+')');
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

			// If HTML, process with templates
			if (type == 'text/html') {
				content = jqtpl.tmpl(content.toString(), {
					cfg: cfg,
				});
			}

			// Send data to browser
			res.writeHead(200, {'Content-Type': type });
			res.end(content);

			sys.log('['+req.method+'] Sent file requested ('+file+'; '+type+')');
		});
	}
}).listen(cfg.port, cfg.ip);

sys.log('Server running at '+cfg.ip+':'+cfg.port);
