import time
from time import sleep
import visa
import pyvisa
import sys

rm = pyvisa.ResourceManager()
# print(rm.list_resources())

oscilloscope = rm.open_resource('USB0::0x05E6::0x6510::04407440::INSTR')

# print(str(sys.argv))


f = open("SCPI_SingleFrontScript.txt", "r")

oscilloscope.timeout = 10000;

lines = f.readlines()
for a in lines :
		oscilloscope.write(a)
		time.sleep(0.1)

time.sleep(0.2)

while True:
	print(str(float(oscilloscope.query('READ? "defbuffer1"'))))
	sleep(1)

oscilloscope.close()