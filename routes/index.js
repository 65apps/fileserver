'use strict';

const config = require('../config/config.json');
const express = require('express');
const fs = require('fs');

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

      info.push( { size: stat.size, name: name, file: el, ctime: stat.ctime, polygons: JSON.parse(polygons) } );
    });

    resolve(info)
  })
}
