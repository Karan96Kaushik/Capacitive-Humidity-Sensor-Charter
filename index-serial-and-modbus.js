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

var logpath = __dirname.split('/resources/app')	// When in Electron Framework

const csvWriter = createCsvWriter({
	path: path.join(logpath[0] + `/Ser+Modbus-Log-${logname}.csv`),
	header: [
		{id: 'time', title: 'Time'},
		{id: 'ehum', title: 'E+E Hum'},
		{id: 'etemp', title: 'E+E Temp'},
		{id: 'shum', title: 'SGS Hum'},
		{id: 'stemp', title: 'SGS Temp'},
	]
});


ModPort = new SerialPort('/dev/ttyUSB0', {
    baudRate: 19200,
    parity: "even"
}, function (err) {
    if (err) {
        console.log('modbus port Error');
    }
});

SerPort = new SerialPort('/dev/ttyUSB1', {
    baudRate: 9600,
    parity: "none"
}, function (err) {
    if (err) {
        console.log('serial port Error');
    }
});

const parser = SerPort.pipe(new Readline({ delimiter: '\n' }));

const master = new ModbusMaster(ModPort, {
    responseTimeout: 1000
});

SerPort.on("open", () => {
    console.log('serial port open');
});

parser.on('data', datas => {

    var Str = datas.split('%');

    var hum = parseFloat(Str[0]);
    var temp = parseFloat(Str[1]);

    master.readHoldingRegisters(247, 38, 4).then((data) => {
        console.log('E+E        ', data[3] / 100 + " %      " + data[1] / 100 + " C");
        console.log('SGS        ', hum + " %       " + temp + " C");
        //console.log('SGS        ', datas);
        console.log('---------------------');

        let records = [
            {time : date.format(now, 'HH:mm:ss'),  ehum: data[3] / 100, etemp: data[1] / 100, stemp: temp, shum: hum}
        ];

        csvWriter.writeRecords(records).then(() => {
                //console.log('Done');
            });


    }, (err) => {
        console.log("E");
    });

})



setInterval(function modbuss() {

}, 1000);