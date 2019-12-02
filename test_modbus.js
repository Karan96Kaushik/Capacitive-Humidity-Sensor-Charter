const SerialPort = require('serialport');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');

var serialPort;

var args = process.argv.slice(2);
//console.log('Started\n');

serialPort = new SerialPort(args[0], {
	baudRate: 19200,
	parity: "even"
}, function (err) {
	if (err) {
		process.send('Error');
		//process.exit();
		serialPort = undefined;
	}
});

master = new ModbusMaster(serialPort, {
	responseTimeout: 1000
});


setInterval(function modbuss() {
	master.readHoldingRegisters(247, 38, 4).then((data) => {
		console.log(data[1] / 100 + " C	     " + data[3] / 100 + " %");
		
		process.send('Success');
		process.exit();
	}, (err) => {
		process.send('Error');
		process.exit();
	});
}, 1500);

serialPort.on("close", () => {
	//console.log("SP Closed");
	process.exit();
})
