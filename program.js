const SerialPort = require('serialport');

SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
      if (port.pnpId == undefined) {} else {
        console.log(port.comName,' (',port.pnpId,' ',port.manufacturer,')');
      }
  });
});