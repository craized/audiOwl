var MB_BASE = 'http://musicbrainz.org/ws/1/';
var querystring = require('querystring'),
	xml2object = require('../vendor/xml2object.js'),
	http = require('http'),
	url = require('url');

var searches = {
		artist: {
			query: 'name',
			mbid: '',
			fields: [
				'name',
				'limit',
			],
			inc: [
				'aliases',
				'release-groups',
				'sa',
				'va', 
				'artist-rels', 
				'label-rels', 
				'release-rels', 
				'track-rels', 
				'url-rels', 
				'tags', 
				'ratings', 
				'user-tags', 
				'user-ratings', 
				'counts', 
				'release-events', 
				'discs', 
				'labels',
			],
		},
		release_group: {
			query: 'title',
			fields: [
				'title',
				'artist',
				'artistid',
				'releasetypes',
				'limit',
			],
			inc: [
				'artist',
				'releases',
			],
		},
		release: {
			query: 'title',
			mbid: '',
			fields: [
				'title',
				'discid',
				'artist',
				'artistid',
				'releasetypes',
				'count',
				'date',
				'asin',
				'lang',
				'script',
				'cdstubs',
				'limit',
			],
			inc: [
				'artist',
				'counts', 
				'release-events', 
				'discs', 
				'tracks', 
				'release-groups', 
				'artist-rels', 
				'label-rels', 
				'release-rels', 
				'track-rels', 
				'url-rels', 
				'track-level-rels', 
				'labels', 
				'tags', 
				'ratings', 
				'user-tags', 
				'user-ratings', 
				'isrcs',
			],
		},
		track: {
			query: 'title',
			mbid: '',
			fields: [
				'title',
				'artist',
				'release',
				'duration',
				'tracknumber',
				'artistid',
				'releaseid',
				'puid',
				'count',
				'releasetype',
				'limit',
			],
			inc: [
				'artist',
				'releases',
				'puids',
				'arist-rels',
				'label-rels',
				'release-rels',
				'track-rels',
				'url-rels',
				'tags',
				'ratings',
				'user-tags',
				'user-ratings',
				'isrcs',
			],
		},
		label: {
			query: 'name',
			mbid: '',
			fields: [
				'name',
				'limit',
			],
			inc: [
				'aliases',
				'artist-rels',
				'label-rels',
				'release-rels',
				'track-rels',
				'url-rels',
				'tags',
				'ratings',
				'user-tags',
				'user-ratings',
			],
		},
		tag: {
			fields: [
				'id',
				'entity',
			]
		},
		rating: {
			fields: [
				'id',
				'entity',
				'rating',
			]
		},
};

_mb_get = function(url, callback) {
	var mb = http.createClient(80, url.hostname);
	var request = mb.request('GET', url.pathname + url.search,
		{ host: url.hostname });
	request.end();

	console.log('[HTTP Client] Loading '+url.hostname+' '+url.pathname+' '+url.search);
	
	// Wait for HTTP response
	request.on('response', function (response) {
		if(response.statusCode == 200) {
			var data = '';

			response.on('data', function(chunk) {
				data += chunk;
			});
			response.on('end', function() {
				xml2object.parseString(data, callback);
			});
		}
	});
};

_mb_parse_xml = function(xml, callback) {
	console.log(xml);
	callback(false, xml);
};

var _search = function(argv, callback) {
	var data;
	var type = argv.type;
	var flags = argv.flags || [];
	var args = argv.args || {};

	// Verify search type
	delete argv.type;
	if (!searches[type]) {
		callback("Invalid search type");
		return;
	}

	// Verify query
	if(argv.query) {
		if(!searches[type].query) {
			callback(argv.query + " is not a valid query on " + type + " searches");
			return;
		}
		else {
			argv.args[searches[type].query] = argv.query;
		}
	}
	delete argv.query;

	// Verify flags
	delete argv.flags;
	flags.forEach(function(flag) {
		if(searches[type].inc.indexOf(flag) == -1 && flag) {
			callback("Invalid flag " + flag + " specified for " + type + " search");
			return;
		}
	});

	// Arg given as object {name: Tom,}
	// Verify arguments 
	delete argv.args;
	for (var arg in args) {
		if(searches[type].fields.indexOf(arg) == -1) {
			callback("Invalid argument " + arg + " specified for " + type + " search");
			return;
		}
	}
	console.log(args);

	var qs = querystring.stringify({ inc: flags.join('+') });
	qs += "&" + querystring.stringify(args);

	_mb_get(url.parse(MB_BASE + type + '/?type=xml&' + qs), callback);
};


// Expects (Scalar(), Object(), Array(), Function())
this.search = {
	artist: function(argv, callback) {
		argv.type = 'artist';
		_search(argv, callback);
	},

	release: function(args, flags, callback) {
		_search({ type: 'release', args: args, flags: flags }, callback);
	},
	
	track: function(args, flags, callback) {
		_search({ type: 'track', args:args, flags:flags }, callback);
	},
};

