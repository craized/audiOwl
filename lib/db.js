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
this.read = function(db, callback) {
	var self = this;
	fs.readFile(this.PATH+db+'.json',function(err, data) {
		// Check for errors and log event
		if (err) throw err;
		self.log('db.js','DB: '+db+'.json; Loaded');


		// Execute defined callback
		// and convert JSON to object
		callback((new Function("return ("+data+");"))());
	});
};

this.save = function(db, data, callback) {
    var self = this;
	fs.writeFile(this.PATH+db+'.json',JSON.stringify(data),'utf8', function(err) {
		// Check for errors and log event
		if (err) throw err;
    	self.log('db.js','DB: '+db+'.json; updated');

		// Execute defined callback
		callback();
	});
};
