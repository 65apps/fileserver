'use strict';

const http = require('http');
const GeoJSON = require('geojson');
const fs = require('fs');
const config = require('../config/config.json');

if (!fs.existsSync(__dirname + '/../'+ config.polyline)) {
    fs.mkdirSync(__dirname + '/../'+ config.polyline);
}

let districts = [
    { path: encodeURI('/russia/crimean-fed-district.poly'), name: 'Crimea.json' }
    , { path: encodeURI('/russia/central-fed-district.poly'), name: 'Russia_Central.json' }
    , { path: encodeURI('/russia/far-eastern-fed-district.poly'), name: 'Russia_Far Eastern.json' }
    , { path: encodeURI('/russia/north-caucasus-fed-district.poly'), name: 'Russia_North Caucasian.json' }
    , { path: encodeURI('/russia/northwestern-fed-district.poly'), name: 'Russia_Northwestern.json' }
    , { path: encodeURI('/russia/siberian-fed-district.poly'), name: 'Russia_Siberian.json' }
    , { path: encodeURI('/russia/south-fed-district.poly'), name: 'Russia_Southern.json' }
    , { path: encodeURI('/russia/ural-fed-district.poly'), name: 'Russia_Urals.json' }
    , { path: encodeURI('/russia/volga-fed-district.poly'), name: 'Russia_Volga.json' }
];

for (let district of districts) {
    let options = {
        hostname: 'download.geofabrik.de',
        path: district.path,
        method: 'GET'
    };

    let req = http.request(options, (res) => {
        if (res.statusCode != 200) {
            return console.log('Not 200 code, server return - ', res.statusCode);
        }

        let result = '';
        res.on('data', (d) => {
            result += d;
        });

        res.on('end', () => {
            serialize(result, district.name);
        })
    });

    req.end();

    req.on('error', (e) => {
        console.log(e);
    });
}

function serialize(text, name) {
    let multiPolygon = text.match(/\d{1}([^ND]+)(?=END)/g);
    let resultArray = [];

    for (let polygon of multiPolygon) {
        let lines = polygon.split('\n');
        let pointArray = [];

        for (let line of lines) {
            let point = [];

            let foundСoordinates = line.match(/([\w.+]+)\b/g);
            if (foundСoordinates == null) continue;
            if (foundСoordinates.length == 2 ) {
                point.push(parseFloat(foundСoordinates[1]), parseFloat(foundСoordinates[0]));
                pointArray.push(point);
            }
        }

        resultArray.push(pointArray);
    }

    GeoJSON.parse([{ multiPolygon: [resultArray]  }], { 'MultiPolygon': 'multiPolygon' }, geojson => {

        fs.writeFile(config.polyline + name, JSON.stringify(geojson), (err) => {
            if (err) throw err;
            console.log('File ', name, 'saved');
        });
    });
}
