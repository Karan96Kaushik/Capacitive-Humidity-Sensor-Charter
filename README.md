# Capacitive-Humidity-Sensor-Charter

## Features

1. Reading capacitive humidity sensor data
    1. SGS Serial RS485 output
    1. Vaisala Serial RS485 output
    1. E+E Modbus RS485 output
    1. FDC2214 Eval Kit
    1. Arduino UNO
1. Storing data in CSV files

## Usage

1. Change COM Port addresses in the node script
1. Run **$ node [SCRIPT NAME]**		
1. Logs saved in log folder as configured in script

## Files & Folders

1. **FDC-Raw-Calculator/** : Calculate FDC Limit Values Calculator Web App
    1. **FDC_Val_Hum_Calc.html** : Web App HTML
    1. **calculate.js** : calc function used in FDC_Val html
1. **FDC_Humidity_Charter.ino** : Arduino Sketch for reading cap from FDC2214
1. **index-vaisala-ee-sgs.js** : Script for SGS, E+E and Vaisala (Latest)
1. **Humidity_Curve_Fitting.ipynb** : Jupyter Notebook for creating linear model from data
1. **Humidity_Modeling_(Udemy_Course).ipynb** : Jupyter Notebook for humidity data analytics
1. **index-just-modbus.js** : Modbus script for E+E
1. **index-serial-and-modbus.js** : Modbus script for E+E
1. **index-single-wo-modbus.js** : Calculate Capacitance from serial
1. **index-serial-Vais-and-modbus.js** : Script for Modbus E+E and Serial vaisala
1. **index.js** : Script for Arduino FDC Eval with E+E
1. **index-with-fdc-raw.js** : Script for raw FDC conversion
1. **map_test.js** : Script for testing the Map function in arduino 
1. **test_modbus.js** : Used for detection of port with modbus sensor 
1. **support/** : Utils 
    1. **map.js** : map function same as Arduino map function 

## Notes

Udemy Course for python: https://www.udemy.com/course/machinelearning/learn/lecture/6087182#content