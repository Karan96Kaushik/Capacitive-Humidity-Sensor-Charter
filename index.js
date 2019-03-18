const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const port = new SerialPort('/dev/ttyACM1', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

var logpath = __dirname.split('/resources/app')	// When in Electron Framework

const csvWriter = createCsvWriter({
	path: path.join(logpath[0] + `/logs_18_3_19/Log-${logname}.csv`),
	header: [
		{id: 'time', title: 'Time'},
		{id: 'ist', title: 'IST Cap (pF)'},
		{id: 'vaisala', title: 'Vaisala Cap(pF)'},
		{id: 'ist2', title: 'New IST Cap (pF)'},
		{id: 'open', title: 'Open (Reference) (pF)'}
	]
});

serialPort = new SerialPort('/dev/ttyUSB0', {
	baudRate: 19200,
	parity: "even"
}, function (err) {
	if (err) {
		console.log('serial port Error');
	}
});

master = new ModbusMaster(serialPort, {
	responseTimeout: 1000
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

	console.log('Ch0:', ch0, " pF");
	console.log('Ch1:', ch1, " pF");
	console.log('Ch2:', ch2, " pF");
	console.log('Ch3:', ch3, " pF");
	
	//modbus();

	let now = new Date();
			let records = [
				{time : date.format(now, 'HH:mm:ss'),  ist:ch0 , vaisala:ch1 , ist2:ch2 , open:ch3}
			];
			csvWriter.writeRecords(records).then(() => {
					console.log('...Done');
				});
});

//modbus();

function modbus() {
	//master.readHoldingRegisters(247, 10, 5, DATA_TYPES.UINT).then((data) => {
	master.readHoldingRegisters(247, 0, 5).then((data) => {
		console.log(data);
	}, (err) => {
		console.log('Error!!!');
	});
}

function calcCap(data) {
	var data1 = data/268435456;
	data1 *= 80*6.28;
	data1 = data1*data1;
	data1 *= 18;
	var capval = (1/data1)*1000000;
	return capval;
	//console.log('Ch0:', capval, " pF");
}