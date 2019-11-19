// E+E 071 Modbus Humidity Sensor

const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');
const { fork } = require('child_process');
const map = require('./support/map')

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

console.log(logname, path.join(__dirname + `/ProbeCompLogs/Log-${logname}.csv`));

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
		{id: 'scalc', title: 'SGS Calc'},
		{id: 'shum2', title: 'SGS 2 Hum'},
		{id: 'stemp2', title: 'SGS 2 Temp'},
		{id: 'sraw2', title: 'SGS 2 RAW'},
		{id: 'scalc2', title: 'SGS 2 Calc'},
	]
});

var vhum; 
var ehum; 
var vtemp; 
var etemp; 
var stemp2; 
var stemp; 
var shum2;
var shum;
var sraw;
var sraw2;
var scalc;
var scalc2;

var ee_addr = '/dev/ttyUSB0';
var vais_addr = '/dev/ttyUSB1';
var sgs_addr;
var sgs2_addr;

var Ports485 = [];

SerialPort.list().then((data) => {
	//console.log(data)

	data.map((el)=>{
		if (typeof el.manufacturer != 'undefined') {
			console.log(el.manufacturer, el.comName)

			if(el.manufacturer == 'Prolific Technology Inc.') {
				sgs_addr = el.comName;
			} else if (el.manufacturer == 'Moxa Technologies Co., Ltd.') {
				sgs2_addr = el.comName;
			} else if (el.manufacturer == "1a86") {
				Ports485.push(el.comName)
				//console.log(Ports485);
				if (Ports485.length == 2) {
					//console.log(testModbus(Ports485[0]))
					testModbus(Ports485[0]).then(()=>{
						//console.log('This')
						ee_addr = Ports485[0];
						vais_addr = Ports485[1];
						startLogging();
					},(e)=> {
						testModbus(Ports485[1]).then(()=>{
							//console.log('This2')
							ee_addr = Ports485[1];
							vais_addr = Ports485[0];
							startLogging();
						})
					})
				}
			}
			//sgs_addr = el.comName;
		}
	})

	//console.log(sgs_addr)


})

function testModbus(addr) {
	return new Promise(function (resolve, reject) {
		//console.log('Testing ',addr)

		var test_modbus = fork('test_modbus.js',[addr]);
	
		test_modbus.on('message', (data) => {
			//console.log(`stdout: >${data}<`);
			if (data == 'Success') {
				resolve();
				return true;
			} else if (data == 'Error') {
				reject();
				return false;
			}
		});

		test_modbus.on('exit', (data) => {
			//console.log(`Exit: >${data}<`);
			
			});
	});
}

function startLogging() {
	//console.log('Starting')
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

	SerPortS2 = new SerialPort(sgs2_addr, {  // SGS2
		baudRate: 9600,
		parity: "none"
	}, function (err) {
		if (err) {
			console.log('SGS 2 serial port Error');
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
	const parserS2 = SerPortS2.pipe(new Readline({ delimiter: '\n' }));
	const parserV = SerPortV.pipe(new Readline({ delimiter: '\n' }));

	const master = new ModbusMaster(ModPort, {
		responseTimeout: 1000
	});

	SerPortS.on("open", () => {
		console.log('SGS Serial port open');
	});

	SerPortS2.on("open", () => {
		console.log('SGS Serial port open');
	});

	SerPortV.on("open", () => {
		console.log('Vaisala Serial port open');
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
			var StrRaw = datas.split('C');

			shum = parseFloat(Str[0]);
			stemp = parseFloat(Str[1]);
			sraw = parseInt(StrRaw[1]);
			scalc = Math.round(map(sraw,55430,57173,0,98)*100)/100
			//console.log('S:',hum,temp )

		}

	})

	parserS2.on('data', datas => {

		process.stdout.write("@");
		if (parseInt(datas) > 40000) {
			sraw2 = parseInt(datas);
			//console.log('S raw:',parseInt(datas))
		} else {
			var Str = datas.split('%');
			var StrRaw = datas.split('C');

			shum2 = parseFloat(Str[0]);
			stemp2 = parseFloat(Str[1]);
			sraw2 = parseInt(StrRaw[1]);
			scalc2 = Math.round(map(sraw2,57024,60757,0,98)*100)/100
			//console.log('S:',hum,temp )

		}

	})

	parserV.on('data', datas => {
		//var Str = datas.split('%RH');
		//vhum = parseFloat(Str[0].split('RH= ')[1]);
		process.stdout.write("#");

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
					sraw2: sraw2,
					stemp2: stemp2,
					shum2: shum2,
					sraw: sraw,
					vtemp: vtemp,
					vhum: vhum,
					scalc:scalc,
					scalc2:scalc2,
				}
			];

			csvWriter.writeRecords(records).then(() => {
					//console.log('Done');
				});
				

		}, (err) => {
			now = new Date();
			let records = [
				{
					time : date.format(now, 'HH:mm:ss'),
					//ehum: data[3] / 100,
					//etemp: data[1] / 100,
					stemp: stemp,
					shum: shum,
					sraw2: sraw2,
					stemp2: stemp2,
					shum2: shum2,
					sraw: sraw,
					vtemp: vtemp,
					vhum: vhum,
					scalc:scalc,
					scalc2:scalc2,
				}
			];
			csvWriter.writeRecords(records).then(() => {
				//console.log('Done');
			});

			console.log("E");
		});

	}, 1000);


	setInterval(function modbuss() {

	}, 1000);
}