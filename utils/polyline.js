'use strict';

const http = require('http');
const GeoJSON = require('geojson');
const fs = require('fs');

let options = {
    hostname: 'download.geofabrik.de',
    path: encodeURI('/russia/volga-fed-district.poly'),
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
        serialize(result);
    })
});

req.end();

req.on('error', (e) => {
    console.log(e);
});


function serialize(text) {
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
                point.push(parseFloat(foundСoordinates[0]), parseFloat(foundСoordinates[1]));
                pointArray.push(point);
            }
        }

        resultArray.push(pointArray);
    }

    GeoJSON.parse([{ multiPolygon: resultArray  }], { 'MultiPolygon': 'multiPolygon' }, geojson => {

        fs.writeFile('volga.json', JSON.stringify(geojson), (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    });
}
