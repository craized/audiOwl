/*
 * audiOwl
 * Manage music files
 *
 * 
 */

// Expects either a filename
// or directory name, and will
// determine proper information for each
// audio file it finds
exports.getInfo = function(input, callback) {
	// Stat input to determine dir or file
	fs.stat(input, function(err, stat) {
		if (err) {
			callback(err, []);
			return;
		}
		
		// If directory, pass dir to readDirectory
		// and process each directory recursively
		if (stat.isDirectory()) {
			exports.readDirectory(input, function (error, dir) {
				if (error) {
					callback(error, []);
					return;
				}

				callback(false, dir);
			}, {
				// Filter function, run to validate each file
				callback: function (name, stat, path) {
					// Skip directories
					if (stat.isDirectory()) return true;

					// Filter based on filename
					return exports._fileFilter(path+'/'+name);
				}
			});
		}
		// If valid file, read file
		// and get ID3 or filename results
		else if (exports._fileFilter(input)) {
			exports.readFile(input, callback);
		}
		else {
			callback('Invalid/Unsupported Path Entered', []);
		}
	});
};


/*
* Filters audio file name for unsupported file types
*/
exports._fileFilter = function(file) {
	// Only validate audio files
	var ext = PATH.extname(file);
	var ret = false;

	// Supported file types
	//// Re-write as REGEX at some point ///
	switch (ext) {
		case '.mp3' :
		case '.flac' :
		case '.ogg' :
			ret = true;
	}

	return ret;
}

/*
 * Read audio file directly
 * Looking for ID3 tags.
 * Fall back to filename search if ID3 fails
 */

exports.readFile = function(file, callback) {
	fs.readFile(file, function(err, data) {
		// Return error to callback on failure
		if (err) {
			callback('Could not load specified file.', []);
			return;
		}

		// Process ID3 tags
		var tags = new idTags(data).getTags();
		
		// If no ID tags found, do file search
		if (!tags || (!tags.title && !tags.id)) {
			exports._infoFromPath(file, callback);
		}
		else callback(false, tags);
	});
};

exports._infoFromPath = function(path, callback) {
	// Info needed to gather
	var info = {
		'title' : '',
		'artist' : '',
		'album': '',
		'year' : '',
		'track' : '',
		'genre' : ''
	};

	// Get all path parts/details
	path = PATH.normalize(path);
	var fext = PATH.extname(path);
	var fdir = PATH.dirname(path).replace(fext,'');
	var fname = PATH.basename(path, fext);
	// Path without extension
	var pdir = PATH.normalize(fdir+'/'+fname);

	// Different parts avaialble
	// for building search formats
	var parts = {
		// Useful parts
		artist: '(?<artist> [\\w\\s]+)',
		album: '(?<album> [\\w\\s]+)',
		title: '(?<title> [\\w\\s]+)',
		track: '(?<track> [0-9]+)',

		// Extra info not used
		cd: '(?:(CD[\\s]?[0-9]|Disc[\\s]?[0-9]|Disk[\\s]?[0-9]))',
		spacer: '\\s?(?:-|_)\\s?'
	};
	
	// Search formats using parts specified
	var formats = [
		{
			// /artist/01 - title
			usedir: true,
			search: '/<artist>/<track><spacer><title>'
		},
		{
			// /artist/album/01 - title
			usedir: true,
			search: '/<artist>/<album>/<track><spacer><title>'
		},
		{
			// /artist/album/CD1/01 - title
			usedir: true,
			search: '/<artist>/<album>/<cd>/<track><spacer><title>'
		},
		{
			// 01 - artist - title
			search: '<track><spacer><artist><spacer><title>'
		},
		{
			// artist - title
			search: '<artist><spacer><title>'
		}
	];

	for (var exp in formats) {
		var entry = formats[exp];
		var search = entry.search.replace(/\//g,'\\/');
		var usedir = entry.usedir || false;

		// Generate regex from parts
		for (x in parts) {
			if (search.indexOf('<'+x+'>') == -1) continue;
			search = search.replace(new RegExp('<'+x+'>','g'),parts[x]);
		}

		console.log('[FP] Testing; '+entry.search);
		
		// Process parts into regex object
		search = xReg.XRegExp('^'+search+'$','gix');
		var match = search.exec(usedir ? pdir : fname);
		console.log('[FP] Match; '+match);

		// If there is a match, save results to info
		if (match) {
			for (var y in info) {
				// Make sure data exists / has not already been saved
				if (match[y] == undefined || info[y] != '') continue;

				// Save data and trim whitespace
				info[y] = trim(match[y]);
			}

			break;
		}
	}

	// Send info to callback
	callback(false, info);
	return;
};

/**
 * read a directory (recursively deep)
 * data[] = an object for each element in the directory
 *		.name = item's name (file or folder name)
 *		.stat = item's stat (.stat.isDirectory() == true IF a folder)
 *		.children = another data[] for the children
 * filter = an object with various filter settings:
 *		.depth		= max directory recursion depth to travel
 *						(0 or missing means: infinite)
 *						(1 means: only the folder passed in)
 *		.hidden		= true means: process hidden files and folders (defaults to false)
 *		.callback	= callback function: callback(name, stat, filter) -- returns truthy to keep the file
 *
 *
 * @param path		= path to directory to read (".", ".\apps")
 * @param callback	= function to callback to: callback(err, data)
 * @param [filter]	= (optional) filter object
 */
exports.readDirectory = function(path, callback, filter) {
	if (filter) {
		// process filter. are we too deep yet?
		if (!filter.depthAt) filter.depthAt = 1; // initialize what depth we are at
		if (filter.depth && filter.depth < filter.depthAt) {
			callback(undefined, []); // we are too deep. return "nothing found"
			return;
		}
	}
	// queue up a "readdir" file system call (and return)
	fs.readdir(path, function(err, files) {
		if (err) {
			callback(err);
			return;
		}

		var doHidden = false; // true means: process hidden files and folders
		if (filter && filter.hidden) {
			doHidden = true; // filter requests to process hidden files and folders
		}

		var count = 0; // count the number of "stat" calls queued up
		var countFolders = 0; // count the number of "folders" calls queued up
		var data = []; // the data to return

		// iterate over each file in the dir
		files.forEach(function (name) {
			// ignore files that start with a "." UNLESS requested to process hidden files and folders
			if (doHidden || name.indexOf(".") !== 0) {
				// queue up a "stat" file system call for every file (and return)
				count += 1;
				fs.stat(path + "/" + name, function(err, stat) {
					if (err) {
						callback(err);
						return;
					}

					var processFile = true;
					if (filter && filter.callback) {
						processFile = filter.callback(name, stat, path);
					}

					if (processFile) {
						var obj = { name: name, stat: stat };
						data.push(obj);
						
						if (stat.isDirectory()) {
							countFolders += 1;
							
							// perform "readDirectory" on each child folder (which queues up a readdir and returns)
							(function(obj2) {
								// obj2 = the "obj" object
								exports.readDirectory(path + "/" + name, function(err, data2) {
									if (err) {
										callback(err);
										return;
									}

									// entire child folder info is in "data2" (1 fewer child folders to wait to be processed)
									countFolders -= 1;
									obj2.children = data2;
									if (countFolders <= 0) {
										// sub-folders found. This was the last sub-folder to processes.
										callback(undefined, data);
									}
									else {
										// more children folders to be processed. do nothing here.
									}
								}, filter);
							})(obj);
						}
					}

					// 1 more file has been processed (or skipped)
					count -= 1;
					if (count <= 0) {
						// all files have been processed.
						if (countFolders <= 0) {
							// no sub-folders were found. DONE.
							callback(undefined, data);
						}
						else {
							// children folders were found. do nothing here (we are waiting for the children to callback)
						}
					}
				});
			}
		});
		
		// if no "stat" calls started, then this was an empty folder
		if (count <= 0) { 
			callback(undefined, []); // callback w/ empty
		}
	});
};
