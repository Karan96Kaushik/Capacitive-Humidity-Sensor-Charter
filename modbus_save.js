const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');
const SerialPort = require('serialport');

var portComm = '/dev/ttyUSB1';

serialPort = new SerialPort(portComm, {
    baudRate: 9600,
    parity: "none"
}, function (err) {
    if (err) {
        console.log('serial port Error');
        //process.exit();
        serialPort = undefined;
    }
});

master = new ModbusMaster(serialPort, {
    responseTimeout: 1000
});

if (false)
master.writeSingleRegister(1, 7, 102).then(() => {
    console.log("Done")
 }, (err) => {
    console.log(err)
});

if(true)

master.writeSingleRegister(1, 2, 1).then(() => {
    console.log("Done")
 }, (err) => {
    console.log(err)
});

console.log("Saving...");
