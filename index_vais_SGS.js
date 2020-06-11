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
	path: path.join(logpath[0] + `/Mar19-Ser+Modbus-Log-${logname}.csv`),
	header: [
		{id: 'time', title: 'Time'},
		{id: 'vhum', title: 'V Hum'},
		{id: 'vtemp', title: 'V Temp'},
		{id: 'shum', title: 'SGS Hum'},
		{id: 'stemp', title: 'SGS Temp'},
	]
});


SerPort = new SerialPort('/dev/ttyUSB0', {
    baudRate: 4800,
    parity: "even",
    stopBits : 1,
    dataBits : 7
}, function (err) {
    if (err) {
        console.log('modbus port Error');
    }
});

ModPort = new SerialPort('/dev/ttyUSB1', {
    baudRate: 9600,
    parity: "none"
}, function (err) {
    if (err) {
        console.log('serial port Error');
    }
});

const parser = SerPort.pipe(new Readline({ delimiter: '\r\n' }));

const master = new ModbusMaster(ModPort, {
    responseTimeout: 1000
});

SerPort.on("open", () => {
    console.log('serial port open');
});

var vhum, vtemp;

parser.on('data', datas => {

   // console.log(datas)

    vhum = parseFloat(datas.split('RH= ')[1]);
    vtemp = parseFloat(datas.split('T= ')[1]);

    master.readHoldingRegisters(1, 0, 2).then((data) => {
        console.log('SGS            ', data[0] / 10 + " %      " + data[1] / 10 + " C");
        console.log('Vais           ', vhum + " %       " + vtemp + " C");
        //console.log('SGS        ', datas);
        console.log('---------------------');

        var now = new Date()
        let records = [
            {time : date.format(now, 'HH:mm:ss'),  shum: data[0] / 10, stemp: data[1] / 10, vtemp: vtemp, vhum: vhum}
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