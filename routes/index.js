'use strict';

const config = require('../config/config.json');
const express = require('express');
const fs = require('fs');
//const crypto = require('crypto');

const router = express.Router();

let dir = null;


fs.watch(config.files, (event, filename) => {
  readDir();
});

readDir();

router.get('/', (req, res) => {
  res.render('index', { files: dir });
});

router.get('/info', (req, res) => {
  res.json(dir);
});

router.get('/info/:name', (req, res) => {
  let search = null;
  dir.forEach( el => {
    if (el.name == req.params.name) return search = el;
  });

  search ? res.json(search) : res.status(404).json({ result: 'Not found' });
});

/*
router.get('/download/:file', (req, res) => {
  console.log(req.headers);

  let search = null;
  dir.forEach( el => {
    if (el.file == req.params.file) return search = el;
  });

  if (!search) return res.status(404).json({ result: 'Not found' });
  let start, end;

  if (req.headers['range']) {
    let array = req.headers['range'].split(/bytes=([0-9]*)-([0-9]*)/);
    start = +array[1] | 0;
    end = +array[2] | 0;
  } else if(req.headers['first-byte-pos'] || req.headers['last-byte-pos']) {
    start = +req.headers['first-byte-pos'] | 0;
    end = +req.headers['last-byte-pos'] | search.size-1;
  } else {
    start = 0;
    end = search.size-1;
  }

  if (start < 0) {
    start = 0;
  }

  if (end > search.size - 1 ) {
    end = search.size - 1;
  }

  if (start >= end ) {
    start = 0;
    end = search.size - 1;
  }

  let headers = {
    'Content-Type':'application/octet-stream'
    , 'Content-Disposition': 'attachment; filename=' + search.file
    , 'Accept-Ranges': 'bytes'
    , 'Content-Length': (end - start + 1)
    , 'Content-Range': 'bytes ' + start + '-' + end + '/' + search.size
    , 'ETag': search.etag
  };

  if(req.headers['if-match']) {
    return console.log(req.headers['if-match']);

    //req.headers['if-match'] == search.etag ? res.status(200) : res.status(412);
  }

  (start == 0 && end == search.size - 1) ? res.status(200) : res.status(206);


  res.set(headers);

  let reader = fs.createReadStream(config.files + search.file, { start: start, end: end });

  reader.on('error', function(err) {
    console.log(err);
    res.status(500).end('Internal error');
  });

  reader.pipe(res);
}); */

module.exports = router;


function readDir() {
  readFiles()
    .then(readStat)
    .then( info => {
      dir = info;
    })
    .catch((err) => {
      console.log('dir read error', err);
    });
}

function readFiles() {
  return new Promise( (resolve, reject) => {
    fs.readdir(config.files, (err, files) => {
      if(err) return reject(err);
      if(files.length == 0) return reject(new Error('files not found'));
      resolve(files);
    });
  })
}

function readStat(files) {
  return new Promise( (resolve, reject) => {
    let info = [];

    files.forEach(el => {
      let name = el.split('.')[0];
      let stat = fs.statSync(config.files + el);
      let polygons = fs.readFileSync(config.polyline + name + '.json');
      polygons = polygons.toString();

      //let etag = crypto.createHmac('sha256', name + stat.ctime)
      //    .digest('hex');

      info.push( { size: stat.size, name: name, file: el, ctime: stat.ctime, polygons: JSON.parse(polygons) } );
    });

    resolve(info)
  })
}
