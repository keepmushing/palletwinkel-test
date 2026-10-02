/* =============================================================================
   't Palletje — minimale statische server.

   Waarom dit bestaat: de site is puur statisch, maar de hosting draait een
   Node-proces en verwacht een startbestand. Dit serveert de bestanden uit deze
   map en doet verder niets. Geen dependencies, geen build, geen framework.

   Verhuist de site ooit naar gewone statische hosting, dan mogen dit bestand
   en package.json weg. Aan de HTML verandert er niets. Het gedrag hieronder
   loopt gelijk met serve.ps1, de lokale preview-server.
   ============================================================================= */

'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var PORT = Number(process.env.PORT) || 3000;

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf'
};

function statOrNull(p) {
  try {
    return fs.statSync(p);
  } catch (e) {
    return null;
  }
}

/* Zet een URL-pad om in een bestand op schijf, of null als dat niet kan.
   Gedraagt zich als een gewone webserver: /contact/ en /contact worden allebei
   /contact/index.html. */
function resolveFile(urlPath) {
  var rel;
  try {
    rel = decodeURIComponent(urlPath);
  } catch (e) {
    return null;
  }
  if (rel.indexOf(String.fromCharCode(0)) !== -1) {
    return null;
  }
  if (rel === '' || rel === '/') {
    rel = '/index.html';
  }

  var full = path.join(ROOT, rel);

  /* Nooit buiten de siteroot serveren. */
  var fence = ROOT.charAt(ROOT.length - 1) === path.sep ? ROOT : ROOT + path.sep;
  if (full !== ROOT && full.indexOf(fence) !== 0) {
    return null;
  }

  var st = statOrNull(full);

  if (st && st.isDirectory()) {
    full = path.join(full, 'index.html');
    st = statOrNull(full);
  } else if (!st) {
    var alt = path.join(full, 'index.html');
    var altSt = statOrNull(alt);
    if (altSt && altSt.isFile()) {
      full = alt;
      st = altSt;
    }
  }

  return st && st.isFile() ? full : null;
}

function cacheKop(file, heeftStempel) {
  var ext = path.extname(file).toLowerCase();

  /* De pagina zelf mag nooit blijven hangen. Zonder deze regel zet de CDN van
     de hosting er zelf max-age=604800 op, en dan ziet een bezoeker na een
     nieuwe versie nog een week lang de oude opbouw. Geen enkele knop in het
     hostingpaneel haalt dat uit zijn browser. */
  if (ext === '.html' || ext === '.xml' || ext === '.txt' || ext === '.json') {
    return 'no-cache';
  }

  /* Een bestand met ?v=... in de URL is per versie uniek en mag blijven staan.
     Zonder stempel houden we het op één dag, zodat een vervangen foto onder
     dezelfde naam vanzelf doorkomt. Zie README, "versiestempel". */
  return heeftStempel ? 'public, max-age=31536000, immutable' : 'public, max-age=86400';
}

function sendFile(res, file, status, headOnly, heeftStempel, inm) {
  var type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  var st = fs.statSync(file);
  var etag = '"' + st.mtimeMs.toString(36) + '-' + st.size.toString(36) + '"';

  /* Kwam de browser terug met dezelfde ETag, dan sturen we alleen 304 en geen
     bestand. Zo kost no-cache op HTML bijna niets. */
  if (inm && inm === etag) {
    res.writeHead(304, { 'ETag': etag, 'Cache-Control': cacheKop(file, heeftStempel) });
    res.end();
    return;
  }

  var body = fs.readFileSync(file);
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': body.length,
    'Cache-Control': cacheKop(file, heeftStempel),
    'ETag': etag,
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(headOnly ? undefined : body);
}

function sendText(res, status, text) {
  var body = Buffer.from(text, 'utf8');
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': body.length
  });
  res.end(body);
}

function notFound(res, headOnly) {
  var page = path.join(ROOT, '404.html');
  if (statOrNull(page)) {
    sendFile(res, page, 404, headOnly, false, null);
  } else {
    sendText(res, 404, '<!doctype html><meta charset="utf-8"><title>404</title><h1>404</h1>');
  }
}

var server = http.createServer(function (req, res) {
  var method = req.method;

  if (method !== 'GET' && method !== 'HEAD') {
    /* Het offerteformulier heeft nog geen backend (doc 01, sectie J). Zolang
       dat zo is, is dit het eerlijke antwoord op een POST. */
    sendText(
      res,
      405,
      '<!doctype html><meta charset="utf-8"><title>Nog niet aangesloten</title>' +
        '<p>Dit formulier verstuurt nog niet. Mail <a href="mailto:info@palletje.be">info@palletje.be</a> ' +
        'of bel <a href="tel:+32499196802">+32 499 19 68 02</a>.</p>'
    );
    return;
  }

  var stukken = req.url.split('#')[0].split('?');
  var urlPath = stukken[0];
  var heeftStempel = /(^|&)v=/.test(stukken[1] || '');
  var inm = req.headers['if-none-match'];
  var file = resolveFile(urlPath);

  try {
    if (file) {
      sendFile(res, file, 200, method === 'HEAD', heeftStempel, inm);
    } else {
      notFound(res, method === 'HEAD');
    }
  } catch (e) {
    sendText(res, 500, '<!doctype html><meta charset="utf-8"><title>500</title><h1>500</h1>');
  }
});

server.listen(PORT, '0.0.0.0', function () {
  console.log("'t Palletje — statische server draait op poort " + PORT);
  console.log('Map: ' + ROOT);
});
