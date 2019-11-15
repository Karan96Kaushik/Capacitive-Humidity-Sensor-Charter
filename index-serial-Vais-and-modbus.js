// E+E 071 Modbus Humidity Sensor

const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const { ModbusMaster, DATA_TYPES } = require('modbus-rtu');

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

console.log("CSV File:", path.join(__dirname + `/Vaisala_E+E_Logs/Log-${logname}.csv`));

var AllPorts = [];


const csvWriter = createCsvWriter({
	path: path.join(__dirname + `/Vaisala_E+E_Logs/Log-${logname}.csv`),
	header: [
		{id: 'time', title: 'Time'},
		{id: 'ehum', title: 'E+E Hum'},
		{id: 'etemp', title: 'E+E Temp'},
		{id: 'vhum', title: 'Vaisala Hum'},
		{id: 'vtemp', title: 'Vaisala Temp'},
	]
});

var vhum; 
var ehum; 
var vtemp; 
var etemp; 

var ee_addr;
var vais_addr;

SerialPort.list().then((data) => {
	//console.log(data)
    AllPorts.push(' ');
    let count = 0;
    
	data.map((el)=>{
		if (typeof el.manufacturer != 'undefined') {
			//console.log(el.manufacturer, el.comName)

            console.log(++count + ' : ', el.comName, ' : ', el.manufacturer);
            AllPorts.push(el.comName);
            
			//sgs_addr = el.comName;
		} else {
			
		}
    })

    console.log('Select E+E Port')
    
    process.stdin.setEncoding('utf8');

	process.stdin.on('readable', () => {
		let chunk;
		// Use a loop to make sure we read all available data.
		while ((chunk = process.stdin.read()) !== null) {
			//process.stdout.write(`data: ${chunk}`);

			console.log('Selected : ', AllPorts[parseInt(chunk)])

			//console.log(typeof serialPort);

			if (typeof ee_addr == 'undefined') {
                ee_addr = AllPorts[parseInt(chunk)];
                console.log("Select Vaisala port");                
			} else if (typeof vais_addr == 'undefined') {
                vais_addr = AllPorts[parseInt(chunk)];
                console.log("Starting...");
                startRec();      

            }
		}
    });

})

function startRec() {

	ModPort = new SerialPort(ee_addr, {  // E+E
		baudRate: 19200,
		parity: "even"
	}, function (err) {
		if (err) {
			console.log('E+E serial port Error');
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

	const parserV = SerPortV.pipe(new Readline({ delimiter: '\n' }));

	const master = new ModbusMaster(ModPort, {
		responseTimeout: 1000
	});

	SerPortV.on("open", () => {
		console.log('Vaisala Serial port open');
		SerPortV.write('r\r\n')
	});

	///////////////////////////////////////////////////////////////////////

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
					vtemp: vtemp,
					vhum: vhum, 
				}
			];

			csvWriter.writeRecords(records).then(() => {
					console.log('V:',vtemp,'C',vhum,'%','   ','E:',data[1] / 100,'C',data[3] / 100,'%');
				});
				

		}, (err) => {
			console.log("E");
		});

	}, 1000);


	setInterval(function modbuss() {

	}, 1000);
}