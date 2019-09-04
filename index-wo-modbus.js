const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

const parser = port.pipe(new Readline({ delimiter: '\n' }));


let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

var logpath = __dirname.split('/resources/app')	// When in Electron Framework

const csvWriter = createCsvWriter({
	path: path.join(logpath[0] + `/Comp_Log-${logname}.csv`),
	header: [
		{id: 'time', title: 'Time'},
		{id: 'board', title: 'Board Cap (pF)'},
		{id: 'evm', title: 'EVM Cap (pF)'},
	]
});

port.on("open", () => {
  console.log('serial port open');
});

parser.on('data', data =>{
	n = 0;

	var a = data.split('*');
	var b = data.split('#');
	var c = data.split('%');
	var d = data.split('$');

	var data0 = parseInt(a[1],10);
	var data1 = parseInt(b[1],10);
	var data2 = parseInt(c[1],10);
	var data3 = parseInt(d[1],10);

	var ch0 = calcCap(data0) - n;
	var ch1 = calcCap(data1) - n;
	var ch2 = calcCap(data2) - n;
	var ch3 = calcCap(data3) - n;

	console.log('Raw Data ', data);
	console.log('Ch0:', ch0, " pF");
	console.log('Ch1:', ch1, " pF");
	//console.log('Ch2:', ch2, " pF");
	//console.log('Ch3:', ch3, " pF");

	let now = new Date();
	let records = [
		{time : date.format(now, 'HH:mm:ss'),  board: ch0, evm: ch1}
	];
	csvWriter.writeRecords(records).then(() => {
			console.log('Done');
		});
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