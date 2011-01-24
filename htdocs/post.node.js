/*
 * Handle POST responses
 */
this.exec = function(data, callback) {
	var post = data.query; // Query Data
	var resp = { 'error' : 'Invalid Request!' }; // Response object
	var error = false;

	if (post.action == 'cfg.save') {
		// Format fields for DB
		delete post.action;

		// Handle directory input
		post.dir = post.dir == undefined ? '' : post.dir;
		if (typeof post.dir != 'object') {
			post.dir = post.dir.length > 0 ? [post.dir] : [];
		}

		// Save DB
		db.save('config', post, function() {		
			// Reload DB
			db.read('config',function (data) {
				cfg = data;

				// Formulate response and execute callback
				resp = { message: 'saved' };
				callback(error, resp);
			});
		});

		// End function
		return;
	}
	else if (post.action == 'mb.search') {
		if (!post.type || post.type == '' || !mb.search[post.type]) {
			callback(false, { error : 'Invalid Search Type' });
			return;
		}

		// Send query data to musicbrainz library
		mb.search[post.type]({ query: post.query, args: {}, flags: [] }, function (error, data) {
			if (error) {
				callback(false, { error : error });
			}
			else {
				callback(false, { debug : data });
			}
		});
		
		return;
	}
	else if (post.action == 'id3.get') {
		if (!post.file) {
			callback(false, { error : 'No File Specified' });
			return;
		}
		
		// Testing fparser functions
		// Interchangable with: getInfo, readFile, _infoFromPath
		fparser.getInfo(post.file, function(error, data) {
			if (data.found == false && data.custom == false) {
				callback(false, { req: 'Could not find match. Enter custom pattern.' });
				return;
			}

			if (error) {
				callback(false, { error : error });
				return;
			}

			callback(false, { debug : data });
		}, post.custom ? { search: post.custom, usedir: true } : false);
		
		return;
	}

	// Return error to callback
	callback(error, resp);
};
