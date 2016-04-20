const forever = require('forever-monitor');

const daemon = new (forever.Monitor)('./bin/www', {
    max: 10,
    args: []
});

daemon.on('exit', function () {
    console.log('Process exit after 10 try');
});

const execFile = require('child_process').execFile;
const child = execFile('node', ['utils/polyline.js'], (error, stdout, stderr) => {
    if (error) {
        throw error;
    }
    daemon.start();
});





