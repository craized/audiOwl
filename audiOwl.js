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
	util = require('util'),
	db = require('./lib/db.js'),
	http = require('http'),
	url = require('url'),
	jqtpl = require('./vendor/jqtpl.js'),
	mb = require('./lib/musicbrainz.js'),
	idtags = require('./vendor/id3');

// Make libraries global
GLOBAL.db = db;
GLOBAL.mb = mb;
GLOBAL.fs = fs;
GLOBAL.sys = sys;
GLOBAL.idtags = idtags;

/* Load Config Data */
var cfg = {};
db.read('config', function (data) {
	cfg = data;

	/* Start Server */
	http.createServer(function(req, res) {
		var page = url.parse(req.url, true);
		var file = page.pathname == '/' ? 'index.html' : page.pathname;
		var fpath = basedir+'/htdocs/'+file;

		// Hardcode type detection of dynamic js
		/// NOTE: replace with better system eventually ///
		if (file.indexOf('.node.js') != -1) {
			sys.log('[NJS] '+file+' Started...');
			// Load exec function from page
			require(fpath).exec(page, function(error, resp) {
				sys.log('[NJS] Response: '+error+'; '+resp);

				// Send response as JSON
				res.writeHead(200, {'Content-Type': 'text/html' });
				res.end(JSON.stringify(resp));
			});
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
				/// NOTE: replace with better system later (node-mime) ///
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
});
