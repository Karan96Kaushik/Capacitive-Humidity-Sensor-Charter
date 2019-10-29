// E+E 071 Modbus Humidity Sensor

const SerialPort = require('serialport');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');

var serialPort = undefined;

var AllPorts = [];

SerialPort.list().then((data) => {
	AllPorts.push(' ');
	let count = 0;
	data.forEach(element => {

		if (typeof element.productId == 'string') {
			console.log(++count + ' : ', element.comName, ' : ', element.manufacturer);
			AllPorts.push(element.comName);
		}
	});

	process.stdin.setEncoding('utf8');

	process.stdin.on('readable', () => {
		let chunk;
		// Use a loop to make sure we read all available data.
		while ((chunk = process.stdin.read()) !== null) {
			//process.stdout.write(`data: ${chunk}`);

			var selectedPort = AllPorts[parseInt(chunk)];
			console.log('Selected : ', selectedPort)

			//console.log(typeof serialPort);

			if (typeof serialPort == 'undefined') {
				start(selectedPort);
			}
		}
	});

})

//var args = (process.argv.slice(2));

//console.log(args, SerialPort.list());

function start(portComm) {

	console.log('Started\n');

	serialPort = new SerialPort(portComm, {
		baudRate: 19200,
		parity: "even"
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


	setInterval(function modbuss() {
		master.readHoldingRegisters(247, 38, 4).then((data) => {
			console.log(data[1] / 100 + " C	     " + data[3] / 100 + " %");
		}, (err) => {
			console.log("E");
		});
	}, 1500);

	serialPort.on("close", () => {
		console.log("SP Closed");
		process.exit();
	})

}
