const forever = require('forever-monitor');

var child = new (forever.Monitor)('./bin/www', {
    max: 10,
    args: []
});

child.on('exit', function () {
    console.log('Process exit after 10 try');
});

child.start();
