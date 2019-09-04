const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

const parser = port.pipe(new Readline({ delimiter: '\n' }));

let now = new Date();

port.on("open", () => {
  console.log('serial port open');
});

parser.on('data', data =>{
        n = 0;
        
		var data0 = parseInt(data,10);

		var ch0 = calcCap(data0) - n;

		console.log('Raw Data ', data);
		console.log('Ch0:', ch0, " pF");
});

function calcCap(data) {
	var data1 = data/268435456;
	data1 *= 80*6.28;
	data1 = data1*data1;
	data1 *= 18;
	var capval = (1/data1)*1000000;
	return capval;
	//console.log('Ch0:', capval, " pF");
}