var MB_BASE = 'http://musicbrainz.org/ws/1/';
var querystring = require('querystring'),
    xml2object = require('../vendor/xml2object.js'),
    http = require('http'),
    url = require('url');

var searches = {
        artist: {
            mbid: '',
            name: '',
            limit: '',
            inc: [
                'aliases',
                'release_groups',
                'sa',
                'va', 
                'artist_rels', 
                'label_rels', 
                'release_rels', 
                'track_rels', 
                'url_rels', 
                'tags', 
                'ratings', 
                'user_tags', 
                'user_ratings', 
                'counts', 
                'release_events', 
                'discs', 
                'labels',
            ],
        },
        release_group: {
            title: '',
            artist: '',
            artistid: '',
            releasetypes: '',
            limit: '',
            inc: [
                'artist',
                'releases',
            ],
        },
        release: {
            mbid: '',
            title: '',
            discid: '',
            artist: '',
            artistid: '',
            releasetypes: '',
            count: '',
            date: '',
            asin: '',
            lang: '',
            script: '',
            cdstubs: '',
            limit: '',
            inc: [
                'artist',
                'counts', 
                'release_events', 
                'discs', 
                'tracks', 
                'release_groups', 
                'artist_rels', 
                'label_rels', 
                'release_rels', 
                'track_rels', 
                'url_rels', 
                'track_level_rels', 
                'labels', 
                'tags', 
                'ratings', 
                'user_tags', 
                'user_ratings', 
                'isrcs',
            ],
        },
        track: {
            mbid: '',
            title: '',
            artist: '',
            release: '',
            duration: '',
            tracknumber: '',
            artistid: '',
            releaseid: '',
            puid: '',
            count: '',
            releasetype: '',
            imit: '',
            inc: [
                'artist',
                'releases',
                'puids',
                'arist_rels',
                'label_rels',
                'release_rels',
                'track_rels',
                'url_rels',
                'tags',
                'ratings',
                'user_tags',
                'user_ratings',
                'isrcs',
            ],
        },
        label: {
            mbid: '',
            name: '',
            limit: '',
            inc: [
                'aliases',
                'artist_rels',
                'label_rels',
                'release_rels',
                'track_rels',
                'url_rels',
                'tags',
                'ratings',
                'user_tags',
                'user_ratings',
            ],
        },
        tag: {
            id: '',
            entity: '',
        },
        rating: {
            id: '',
            entity: '',
            rating: '',
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

var _search = function(args, callback) {
    var data;
    var type = args.type;
	var flags = args.flags;
    var query = args.query;

	// Verify query
	delete args.query;
	if (!query) {
		callback("Search query omitted");
		return;
    }

	// Verify search type
    delete args.type;
    if (!searches[type]) {
        callback("Invalid search type");
		return;
    }

	// Verify flags
	delete args.flags;
    flags.forEach(function(flag) {
        if(searches[type].inc.indexOf(flag) == -1 && flag) {
            callback("Invalid flag " + flag + " specified for " + type + " search");
			return;
        }
    });

	// Verify arguments 
    for (arg in args) {
        if(!searches[type][arg]) {
            callback("Invalid argument " + arg + " specified for " + type + " search");
			return;
        } 
    }

	var qs = querystring.stringify({
		query: query,
		args: args,
		flags: flags
	});

    _mb_get(url.parse(MB_BASE + type + '/?type=xml&' + qs), callback);
};


// Expects (Scalar(), Object(), Array(), Function())
this.search = {
    artist: function(query, flags, callback) {
        _search({ type: 'artist', query: query, flags: flags }, callback);
    },

    release: function(query, flags, callback) {
        _search({ type: 'release', query:query, flags: flags }, callback);
    },
    
    track: function(query, flags, callback) {
        _search({ type: 'track', query:query, flags:flags }, callback);
    },
};

