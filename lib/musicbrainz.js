this.BASEURL = 'http://musicbrainz.org/ws/1/';


this.search = function(type, argv) {
    var search_type = {
        'artist': {
            'valid': [
                'name',
                'limit',
            ]
        },
        'track':'',
        'release': {
            'types': '',
        },
        'label':'',
    };
    
    var valid_field = {
        'album': [
            'artist',
            'counts',
            'release-events',
            'discs',
            'tracks',
            'artist-rels',
            'label-rels',
            'release-rels',
            'track-rels',
            'url-rels',
            'track-level-rels',
            'labels'  
        ],
        'track': [
            'artist',
            'releases',
            'puids',
            'artist-rels',
            'label-rels',
            'release-rels',
            'track-rels',
            'url-rels' 
        ],
    };
    /* How are we handing failure? This is if there is a bad search type*/
    if(!type in search_type) {
        return 0;
    }

    var search_url = BASEURL+type+'?type=xml';

};
