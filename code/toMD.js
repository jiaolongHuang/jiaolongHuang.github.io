var fs = require('fs');
var path = require('path');
var toMarkdown = require('to-markdown');
var xss = require('xss');

var options = {
	whiteList: {
		p: [],
		pre: [],
		h1: [],
		h2: []
	},
	stripIgnoreTag: true
};

var root = path.dirname( __filename );
var srcDir = path.join( root, 'html' );

var exec = require('child_process').exec;

var ls = exec('casperjs run.js', function (error, stdout, stderr) {
	if (error) {
		console.log(error.stack);
		console.log('Error code: ' + error.code);
	}
	fs.readdir(srcDir, function(err, files){
		if(err){
			console.log( err );
			return;
		}
		
		files.forEach(function(filename){
			var src = path.join( srcDir, filename );
			var fileData = fs.readFileSync( src ).toString().trim();
			var html = xss( fileData, options );
			var mk = toMarkdown( html );

			var destName = filename.split('.')[0] + '.md';
			var dest = path.join( root, 'md', destName );

			fs.writeFile(dest, mk, function (err) {
				if (err) throw err;
				console.log('It\'s saved!'); //文件被保存
			});
		});
	});
});
