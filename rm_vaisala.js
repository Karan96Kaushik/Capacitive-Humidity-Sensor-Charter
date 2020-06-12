// E+E 071 Modbus Humidity Sensor

var vais_addr = '/dev/ttyUSB0';
var sgs_addr = '/dev/ttyUSB1';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');
const { fork } = require('child_process');
const map = require('./support/map')
const { PythonShell } = require('python-shell');

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

//console.log(logname, path.join(__dirname + `/ProbeCompLogs/Log-${logname}.csv`));

const csvWriter = createCsvWriter({
	path: path.join(__dirname + `/RMY_Vais_June/Log-${logname}.csv`),
	header: [
		{ id: 'time', title: 'Time' },
		{ id: 'vhum', title: 'Vaisala Hum' },
		{ id: 'vtemp', title: 'Vaisala Temp' },
		{ id: 'shum', title: 'RMY Hum' },
		{ id: 'stemp', title: 'RMY Temp' },
	]
});

var vhum;
var vtemp;
var rtemp = 0;
var rhum = 0;

var options = {
	mode: 'text',
	// pythonPath: './gogoanime_get_link.py',
	pythonOptions: ['-u'], // get print results in real-time
	// scriptPath: 'gogoanime_get_link.py',
	// args: [response.data, 'value2', 'value3']
};

startLogging();

function startLogging() {

	let pyshell = new PythonShell('SCPI_DAQ6510_Single_Front_Channel.py', options);

	// sends a message to the Python script via stdin

	pyshell.on('message', function (message) {
		// received a message sent from the Python script (a simple "print" statement)
		rhum = parseFloat(message) * 100
		// console.log(message);
	});

	// end the input stream and allow the process to exit
	pyshell.end(function (err, code, signal) {
		if (err) throw err;
		console.log('The exit code was: ' + code);
		console.log('The exit signal was: ' + signal);
		console.log('finished');
	});

	console.log('')
	console.log('---Starting---')
	console.log('Vaisala :', vais_addr)
	console.log('')

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

	const parserV = SerPortV.pipe(new Readline({ delimiter: '\n' }));

	SerPortV.on("open", () => {
		console.log('Vaisala Serial port open');
		SerPortV.write('r\r\n')
		SerPortV.write('r\r\n')
	});

	///////////////////////////////////////////////////////////////////////


	parserV.on('data', datas => {
		//var Str = datas.split('%RH');
		//vhum = parseFloat(Str[0].split('RH= ')[1]);
		process.stdout.write("#");

		vhum = parseFloat(datas.split('RH= ')[1]);
		//console.log( parseFloat(datas.split('T=')[1]) );
		vtemp = parseFloat(datas.split('T=')[1]);

		if (isNaN(vtemp)) {
			vtemp = parseFloat(datas.split('T= ')[1]);
		}
		//console.log(vtemp )
	})

	setInterval(function modE() {

		now = new Date();

		let records = [
			{
				time: date.format(now, 'HH:mm:ss'),
				stemp: rtemp,
				shum: rhum,
				vtemp: vtemp,
				vhum: vhum,
			}
		];

		csvWriter.writeRecords(records).then(() => {
			//console.log('Done');
		});
	}, 1000);

}
