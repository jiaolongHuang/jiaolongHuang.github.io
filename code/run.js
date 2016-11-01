var fs = require('fs');

var casper = require('casper').create({
	clientScripts: ["jquery.js"]
});

casper.start('http://blog.csdn.net/mine666?viewmode=contents', function() {
	this.echo(this.getTitle());
});

var links, index = 0;
var baseurl = 'http://blog.csdn.net';
casper.then(function() {
	links = this.evaluate(getLinks);
	this.echo(links.length);

	for(var i = 0, linksLen = links.length; i < linksLen; i++){
		this.thenOpen(baseurl + links[i], function(){
			var content = this.evaluate(getContent);
			this.echo(index);
			var filePath = fs.pathJoin(fs.workingDirectory, 'html', index + '.html');
			fs.write(filePath, content, 'w');
			this.echo(index+' saved');
			index++;
		});
	}
});

function getContent(){
	var title = $('.link_title a').html(),
		postdate = $('.link_postdate').html(),
		content = $('#article_content').html();
	
		var res = '<p>title: ' + title + '</p>'
				+ '<p>date: ' + postdate + '</p>'
				+ '<p>categories: ' + '"csdn"' + '</p>'
				+ '<p>tags: ' + '[csdn]' + '</p>'
				+ '<p>---</p>'
				+ '<br>';
	return res + content;
}

function getLinks(){
	var aList = [];
	
	var linkTitles = $('#article_list').find('.link_title');
	for( var i = 0, linkTitlesLen = linkTitles.length; i < linkTitlesLen; i++){
		aList[i] = $(linkTitles[i]).find('a').attr('href');
	}
	return aList;
}

casper.run();