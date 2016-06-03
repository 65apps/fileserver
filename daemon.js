const forever = require('forever-monitor');

const daemon = new (forever.Monitor)('./bin/www', {
    max: 10,
    args: []
});

daemon.start();

daemon.on('exit', function () {
    console.log('Process exit after 10 try');
});