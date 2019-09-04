// E+E 071 Modbus Humidity Sensor

const SerialPort = require('serialport');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');

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


setInterval(function modbuss() {
	master.readHoldingRegisters(247, 38, 4).then((data) => {
		console.log(data[1]/100 + " C	     " + data[3]/100 + " %");
	}, (err) => {
	});	
}, 1000);