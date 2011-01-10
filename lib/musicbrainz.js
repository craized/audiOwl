this.BASEURL = 'http://musicbrainz.org/ws/1/';
var querystring = require('querystring'),
    xml2object = require('../vendor/xml2object.js'),
    http = require('http'),
    url = require('url');

this.searches = {
        artist: {
            mbid: '',
            name: '',
            limit: '',
            inc: {
                aliases: '',
                release_groups: '',
                sa: '',
                va: '', 
                artist_rels: '', 
                label_rels: '', 
                release_rels: '', 
                track_rels: '', 
                url_rels: '', 
                tags: '', 
                ratings: '', 
                user_tags: '', 
                user_ratings: '', 
                counts: '', 
                release_events: '', 
                discs: '', 
                labels: '',

            },
        },
        release_group: {
            title: '',
            artist: '',
            artistid: '',
            releasetypes: '',
            limit: '',
            inc: {
                artist: '',
                releases: '',
            },
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
            inc: {
                artist: '',
                counts: '', 
                release_events: '', 
                discs: '', 
                tracks: '', 
                release_groups: '', 
                artist_rels: '', 
                label_rels: '', 
                release_rels: '', 
                track_rels: '', 
                url_rels: '', 
                track_level_rels: '', 
                labels: '', 
                tags: '', 
                ratings: '', 
                user_tags: '', 
                user_ratings: '', 
                isrcs: '',
            },
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
            inc: {
                artist: '',
                releases: '',
                puids: '',
                arist_rels: '',
                label_rels: '',
                release_rels: '',
                track_rels: '',
                url_rels: '',
                tags: '',
                ratings: '',
                user_tags: '',
                user_ratings: '',
                isrcs: '',
            },
        },
        label: {
            mbid: '',
            name: '',
            limit: '',
            inc: {
                aliases: '',
                artist_rels: '',
                label_rels: '',
                release_rels: '',
                track_rels: '',
                url_rels: '',
                tags: '',
                ratings: '',
                user_tags: '',
                user_ratings: '',
            },
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

this.search = {
    artist: function(query, flags, callback) {
        this._search({ type: 'artist', query: query, flags: flags }, callback);
    },

    release: function(query, flags, callback) {
        this._search({ type: 'release', query:query, flags: flags }, callback);
    },
    
    track: function(query, flags, callback) {
        this._search({ type: 'track', query:query, flags:flags }, callback);
    },
}

this._get_xml = function(url, callback) {
    var mb = http.createClient(80, url.hostname);
    var request = mb.request('GET', url.pathname + url.search,
        { host: url.hostname });
    request.end();

    request.on('response', function (response) {
        if(response.statusCode == 200) {
            console.log('[STATUS] ' + response.statusCode);
            response.on('data', function(chunk) {
                callback(false, xml2object.parseString(chunk));
            });
        }
    });
}

this._mb_parse_xml = function(xml, callback) {
    console.log(xml);
    callback(false, xml);
};

this._search = function(args, callback) {
    var data;
    var type = args.type
    delete args.type;
    if(!this.searches[type]) {
        
        callback("Invalid search type");
    }
    for (flag in args.flags) {
        if(!this.searches[type][flag]) {
            callback("Invalid flag " + flag + " specified for " + type + " search");
        }
    }
    delete args.flags;
    for(arg in args) {
        if(!this.searches[type][arg]) {
            callback("Invalid argument " + arg + " specified for " + type + " search");
        } 
    }

    this._mb_get(url.parse(BASEURL + "/" + type + '/?type=xml&' + querystring.stringify(args)), callback);
};


