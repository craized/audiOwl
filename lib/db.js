/*
 *
 * audiOwl
 * db.js Library
 * Manages JSON databases
 *
 */

var fs = require('fs');

this.log = function(file, entry) {
    console.log('['+file+'] '+entry);
};

this.PATH = '/home/tomoc/git/audiOwl/db/';

/*
 * Returns all data from specified DB
 */
this.read = function(db) {
    return (new Function("return ("+fs.readFileSync(this.PATH+db+'.json')+")"))();
};

this.save = function(db, data) {
    fs.writeFileSync(this.PATH+db+'.json',JSON.stringify(data),function() {
        this.log('db.js','Database '+db+' updated');
    });

};
