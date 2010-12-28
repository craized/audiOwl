/*
 *
 * audiOwl
 * db.js Library
 * Manages JSON databases
 *
 */

var sys = require('sys'),
	fs = require('fs');

this.log = function(file, entry) {
   sys.log('['+file+'] '+entry);
};


this.PATH = basedir+'/db/';

/*
 * Returns all data from specified DB
 */
this.read = function(db) {
	this.log('db.js','DB: '+db+'.json; loading...');
    return (new Function("return ("+fs.readFileSync(this.PATH+db+'.json')+")"))();
};

this.save = function(db, data) {
    fs.writeFileSync(this.PATH+db+'.json',JSON.stringify(data),'utf8');
    this.log('db.js','DB: '+db+'.json; updated');
};
