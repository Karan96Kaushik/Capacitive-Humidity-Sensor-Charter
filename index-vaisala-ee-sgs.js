// E+E 071 Modbus Humidity Sensor

const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

console.log(logname);

const csvWriter = createCsvWriter({
	path: path.join(__dirname + `/ProbeCompLogs/Log-${logname}.csv`),
	header: [
		{id: 'time', title: 'Time'},
		{id: 'ehum', title: 'E+E Hum'},
		{id: 'etemp', title: 'E+E Temp'},
		{id: 'vhum', title: 'Vaisala Hum'},
		{id: 'vtemp', title: 'Vaisala Temp'},
		{id: 'shum', title: 'SGS Hum'},
		{id: 'stemp', title: 'SGS Temp'},
		{id: 'sraw', title: 'SGS RAW'},
	]
});

var vhum; 
var ehum; 
var vtemp; 
var etemp; 
var stemp; 
var shum;
var sraw;

var ee_addr = '/dev/ttyUSB0';
var vais_addr = '/dev/ttyUSB1';
var sgs_addr = '/dev/ttyUSB2';

ModPort = new SerialPort(ee_addr, {  // E+E
	baudRate: 19200,
	parity: "even"
}, function (err) {
	if (err) {
		console.log('E+E serial port Error');
	}
});

SerPortS = new SerialPort(sgs_addr, {  // SGS
	baudRate: 9600,
	parity: "none"
}, function (err) {
	if (err) {
		console.log('SGS serial port Error');
	}
});

SerPortV = new SerialPort(vais_addr, {  // Vaisala
	baudRate: 4800,
	parity: "even",
	dataBits: 7,
	stopBits: 1
}, function (err) {
	if (err) {
		console.log('Vaisala serial port Error');
	}
});

const parserS = SerPortS.pipe(new Readline({ delimiter: '\n' }));
const parserV = SerPortV.pipe(new Readline({ delimiter: '\n' }));

const master = new ModbusMaster(ModPort, {
	responseTimeout: 1000
});

SerPortS.on("open", () => {
	console.log('SGS Serial port open');
});

SerPortV.on("open", () => {
	console.log('Vaisala Serial port open');
});

///////////////////////////////////////////////////////////////////////

parserS.on('data', datas => {

	if (parseInt(datas) > 40000) {
		sraw = parseInt(datas);
		//console.log('S raw:',parseInt(datas))
	} else {
		var Str = datas.split('%');
		var StrRaw = datas.split('C');

		shum = parseFloat(Str[0]);
		stemp = parseFloat(Str[1]);
		sraw = parseInt(StrRaw[1]);
		//console.log('S:',hum,temp )

	}

})

parserV.on('data', datas => {
	//var Str = datas.split('%RH');
	//vhum = parseFloat(Str[0].split('RH= ')[1]);
	vhum = parseFloat(datas.split('RH= ')[1]);
	vtemp = parseFloat(datas.split('T= ')[1]);
	//console.log('V:',hum,temp )
})

setInterval(function modbussE() {
	master.readHoldingRegisters(247, 38, 4).then((data) => {
		//console.log('E:', data[3] / 100, data[1] / 100);
		now = new Date();
		let records = [
			{
				time : date.format(now, 'HH:mm:ss'),
				ehum: data[3] / 100,
				etemp: data[1] / 100,
				stemp: stemp,
				shum: shum,
				sraw: sraw,
				vtemp: vtemp,
				vhum: vhum, 
			}
        ];

        csvWriter.writeRecords(records).then(() => {
                //console.log('Done');
			});
			

	}, (err) => {
		console.log("E");
	});

}, 1000);


setInterval(function modbuss() {

}, 1000);