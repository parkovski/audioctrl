var http = require('http');
var fs = require('fs');
var exec = require('child_process').execFile;

var index = '' + fs.readFileSync('./index.html');

var freq = '101.1';
var rate = '44200';
var song = '---';

var process = null;

function getIndex() {
  return index
    .replace('$freq', freq)
    .replace('$rate', rate)
    .replace('$song', song)
    .replace('$playing', (!process ? 'not ' : '') + 'playing');
}

function getSongSel(res) {
  var s = '<!DOCTYPE html>\n'
    + '<html>\n'
    + '<head>\n'
    + '<title>Pick song</title>\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1" />\n'
    + '</head>\n'
    + '<body>\n'
    + '<div>songs | <a href="/">back</a></div>\n';

  // + 'filt <input type="text" id="filter">\n'

  fs.readdir('./songs/', function(err, files) {
    if (err) {
      res.end(err);
      return;
    }

    files.forEach(function(file) {
      s += '<div><a href="/set?x=' + file + '">' + file + '</a></div>\n';
    });

    s += '</body>\n</html>';

    res.end(s);
  });
}

function start(req, res, home) {
  process = exec('./pifm', ['./songs/' + song, freq, rate], null, function() {
    process = null;
  });
  home();
}

function stop() {
  process && process.kill();
  process = null;
}

http.createServer(function(req, res) {
  var x = req.url.split('?');
  var url = x[0];
  var param = x[1];
  if (param) {
    param = param.substring(param.indexOf('=') + 1);
  }

  var home = function() {
    res.writeHead(302, { 'Location': '/' });
    res.end();
  };

  if (url === '/') {
    res.end(getIndex());
  } else if (url === '/freq') {
    freq = param;
    home();
  } else if (url === '/rate') {
    rate = param;
    home();
  } else if (url === '/song') {
    getSongSel(res);
  } else if (url === '/set') {
    song = param;
    stop();
    home();
  } else if (url === '/start') {
    start(req, res, home);
  } else if (url === '/stop') {
    stop();
    home();
  } else {
    res.end('no');
  }
}).listen(process.env.PORT || 8080);
