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
	path: path.join(__dirname + `/RMY_SGS_Vais/Log-${logname}.csv`),
	header: [
		{ id: 'time', title: 'Time' },
		{ id: 'vhum', title: 'Vaisala Hum' },
		{ id: 'vtemp', title: 'Vaisala Temp' },
		{ id: 'shum', title: 'SGS Hum' },
		{ id: 'stemp', title: 'SGS Temp' },
		{ id: 'sraw', title: 'SGS Raw' },
		{ id: 'rtemp', title: 'RMY Temp' },
		{ id: 'rhum', title: 'RMY Hum' },
	]
});

var vhum;
var vtemp;
var stemp;
var shum;
var sraw;
var rtemp = 0;
var rhum = 0;

var options = {
	mode: 'text',
	pythonOptions: ['-u'], // get print results in real-time
};

startLogging();

function startLogging() {
    let pyshell = new PythonShell('SCPI_DAQ6510_Single_Front_Channel.py', options);

	pyshell.on('message', function (message) {
		rhum = parseFloat(message) * 100
	});

	pyshell.end(function (err, code, signal) {
		if (err) throw err;
		console.log('The exit code was: ' + code);
		console.log('The exit signal was: ' + signal);
		console.log('finished');
    });
    
	console.log('')
	console.log('---Starting---')
	console.log('SGS :', sgs_addr)
	console.log('Vaisala :', vais_addr)
	console.log('')

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

	SerPortS.on("open", () => {
		console.log('SGS Serial port open');
	});

	SerPortV.on("open", () => {
		console.log('Vaisala Serial port open');
		SerPortV.write('r\r\n')
		SerPortV.write('r\r\n')
	});

	///////////////////////////////////////////////////////////////////////

	parserS.on('data', datas => {
		process.stdout.write("!");

		if (parseInt(datas) > 40000) {
			sraw = parseInt(datas);
			//console.log('S raw:',parseInt(datas))
		} else {
			var Str = datas.split('%');
			var StrRaw = datas.split('C ');

			shum = parseFloat(Str[0]);
			stemp = parseFloat(Str[1]);
			sraw = parseInt(StrRaw[1]);
			//console.log('S:',hum,temp )

		}

	})

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
	}, 1000);

}
