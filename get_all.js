'use strict';

const request = require('request');
const fs = require('fs');
const co = require('co');

co(function* () {
   let files = yield new Promise((resolve, reject) => {
       fs.readdir('borders', (err, res) => {
           if (err) return reject(err);
           resolve(res);
       })
   });

   let generatorFn = [];

    files.forEach(file => {
        let fn = function* () {
            let mwm = file.replace('poly', 'mwm');

            let mwmRes = yield new Promise( (resolve, reject) => {
                let length;
                let mwm_file = fs.createWriteStream('files/'+ mwm);
                mwm_file.on('open', () => {
                    let watcher = fs.watch('files/'+ mwm, (event, filename) => {
                    if (fs.lstatSync('files/'+ mwm).size == length) {
                        console.log(event, fs.lstatSync('files/'+ mwm).size, length);
                        watcher.close();
                        resolve('file is download - ' + mwm);
                    }
                });

                request
                    .get('http://direct.mapswithme.com/direct/160510/' + mwm)
                    .on('response', function(response) {
                        console.log(response.statusCode) // 200
                        console.log(response.headers['content-length']) //
                        length = response.headers['content-length'];
                    })
                    .on('error', err => {
                        reject(err)
                    })
                    .pipe(mwm_file);

                });
            });
            console.log(mwmRes);

            let zipName = mwm.replace('mwm', 'zip');
            let content = fs.readFileSync('files/'+ mwm);

            let zip = new require('node-zip')();
            zip.file(mwm, content);
            let data = zip.generate({base64:false,compression:'DEFLATE'});
            fs.writeFileSync('files/' + zipName, data, 'binary');

            fs.unlinkSync('files/' + mwm);
            return 'file is done - '+ zipName;
        };

        generatorFn.push(fn);
    });

    let res = yield generatorFn;
    console.log(res);
})
.catch(err => {
    console.log(err);
});
