'use strict';

const http = require('http');
const fs = require('fs');
const config = require('../config/config.json');

let getInfo = () => {
    let options = {
        port: config.port,
        hostname: '127.0.0.1',
        method: 'GET',
        path: '/info'
    };

    const req = http.request(options, function(res) {
        res.on('data', function (chunk) {
            console.log('Response to /info', chunk.toString());
        });
    });

    req.end();
};

let getInfoDetail = () => {
    let options = {
        port: config.port,
        hostname: '127.0.0.1',
        method: 'GET',
        path: '/info/caucasus'
    };

    const req = http.request(options, function(res) {
        res.on('data', function (chunk) {
            console.log('Response to /info/caucasus', chunk.toString());
        });
    });

    req.end();
};

let downloadFiles = () => {
    let options = {
        port: config.port,
        hostname: '127.0.0.1',
        method: 'GET',
        path: '/download/caucasus.zip',
        headers: {
            'first-byte-pos': 11
            , 'last-byte-pos': 10
        }
    };

    const writer = fs.createWriteStream('caucasus.zip');
    writer.on('pipe', (src) => {
        console.log('something is piping into the writer');
        console.log(src)
    });

    const req = http.request(options);
    req.end();
    req.on('response', function(mes) {
        mes.on('data', (chunk) => {
            writer.write(chunk);
            console.log(chunk)
        });

        mes.read();
    });
};


//getInfo();
//getInfoDetail();
//downloadFiles();

