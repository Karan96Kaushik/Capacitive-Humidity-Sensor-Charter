//unsigned long 4 Bytes 0 to 4,294,967,295
//long 4 Bytes -2,147,483,648 to 2,147,483,647
//float 4 Bytes 1.2E-38 to 3.4E+38 (6 decimal places)

#include <Wire.h>
#define DT 1 //Derivative threshold.
#define IT 1500 //Integration threshold.
#define HAND 3500 // Hand threshold.
#define AVGN 3 //Degree of the IIR filter.
#define L 1 //Leakege Factor.

byte FDC = 0x2A;// FDC address either 0x2A or 0x2B;
byte CH0MSB = 0x00; //Most significant bits of the conversion result on channel 0. [11:0]-->>[27:16]
byte CH0LSB = 0X01; //Less significant bits of the conversion result on channel 0. [15:0]-->>[15:0]
byte CH1MSB = 0x02; //Most significant bits of the conversion result on channel 0. [11:0]-->>[27:16]
byte CH1LSB = 0X03; //Less significant bits of the conversion result on channel 0. [15:0]-->>[15:0]
byte CH2MSB = 0x04; //Most significant bits of the conversion result on channel 0. [11:0]-->>[27:16]
byte CH2LSB = 0X05; //Less significant bits of the conversion result on channel 0. [15:0]-->>[15:0]
byte CH3MSB = 0x06; //Most significant bits of the conversion result on channel 0. [11:0]-->>[27:16]
byte CH3LSB = 0X07; //Less significant bits of the conversion result on channel 0. [15:0]-->>[15:0]

void LedOn() {
  digitalWrite(2, HIGH);
}

void LedOff() {
  digitalWrite(2, LOW); //Target approaching!
}

//Build the complete conversion result from the specific channel
unsigned long readChannel() {
  unsigned long val = 0;
  word c = 0;
  word d = 0;
  c = readValue(FDC, CH0MSB);
  d = readValue(FDC, CH0LSB);
  val = c;
  val <<= 16;
  val += d;
  return val;
}

unsigned long readChannel1() {
  unsigned long val = 0;
  word c = 0;
  word d = 0;
  c = readValue(FDC, CH1MSB);
  d = readValue(FDC, CH1LSB);
  val = c;
  val <<= 16;
  val += d;
  return val;
}

unsigned long readChannel2() {
  unsigned long val = 0;
  word c = 0;
  word d = 0;
  c = readValue(FDC, CH2MSB);
  d = readValue(FDC, CH2LSB);
  val = c;
  val <<= 16;
  val += d;
  return val;
}

unsigned long readChannel3() {
  unsigned long val = 0;
  word c = 0;
  word d = 0;
  c = readValue(FDC, CH3MSB);
  d = readValue(FDC, CH3LSB);
  val = c;
  val <<= 16;
  val += d;
  return val;
}

//Read bytes from register channel specified
word readValue (int FDC, int reg) {
  byte a = 0;
  byte b = 0;
  word value = 0;
  Wire.beginTransmission(FDC);
  Wire.write(reg);
  Wire.endTransmission();
  Wire.requestFrom(FDC, 2);
  while (Wire.available())
  {
    a = Wire.read();
    b = Wire.read();
  }
  value = a;
  value <<= 8;
  value += b;
  return value;
}


//IIR Filter
long average( unsigned long meassure, long avg_1, int n) {
  long avg = ((avg_1 * n) - avg_1 + meassure) / n;
  return avg;
}

void monitor() {
  long current = readChannel();
  long delta = 0, Integral = 0, Integral_1 = 0;
  long avg = 0, avg_1 = 0, last = 0;

  
  //avg = current;

  for (;;) {
    Serial.print("*");
    Serial.print(readChannel());
    Serial.print("#");
    Serial.print(readChannel1());
    Serial.print("%");
    Serial.print(readChannel2());
    Serial.print("$");
    Serial.println(readChannel3());
    //Serial.println("-------------");
    delay(1000);
    
    last = current;// Shift register. The variable last will storage the current value for the next iteration.
    current = average(readChannel(), last, AVGN);//New value for current return from IIR filter --> function average(meassure, avg_1, n)

    //Derivative integration algorithm
    delta = current - last;

    if (abs(delta) > DT) {
      Integral = Integral_1 + delta;
    }
    else {
      Integral = Integral_1;
    }

    if (abs(Integral) >= IT && abs(Integral) < HAND) {
      LedOff();
      Integral_1 = Integral;
      //Serial.println("Pot approaching...");
    }
    else {
      LedOn();
      Integral_1 = Integral * L;
    }
    //Serial.println(abs(Integral));
    //delay(100);
  }
}


//Configuring the FDC2214

void writeConfig(int FDC, byte reg, byte MSB, byte LSB) {
  Wire.beginTransmission(FDC);
  Wire.write(reg);
  Wire.write(MSB);
  Wire.write(LSB);
  Wire.endTransmission();
}

void Configuration() {
  writeConfig(FDC, 0x14, 0x20, 0x01); //CLOCK_DIVIDERS_CH0
  writeConfig(FDC, 0x1E, 0xF8, 0x00); //DRIVE_CURRENT_CH0
  writeConfig(FDC, 0x10, 0x00, 0x0A); //SETTLECOUNT_CH0
  writeConfig(FDC, 0x08, 0x69, 0xE8); //RCOUNT_CH0
  
  writeConfig(FDC, 0x15, 0x20, 0x01); //CLOCK_DIVIDERS_CH1
  writeConfig(FDC, 0x1F, 0xF8, 0x00); //DRIVE_CURRENT_CH1
  writeConfig(FDC, 0x11, 0x00, 0x0A); //SETTLECOUNT_CH1
  writeConfig(FDC, 0x09, 0x69, 0xE8); //RCOUNT_CH1
  
  writeConfig(FDC, 0x16, 0x20, 0x01); //CLOCK_DIVIDERS_CH2
  writeConfig(FDC, 0x20, 0xF8, 0x00); //DRIVE_CURRENT_CH2
  writeConfig(FDC, 0x12, 0x00, 0x0A); //SETTLECOUNT_CH2
  writeConfig(FDC, 0x0A, 0x69, 0xE8); //RCOUNT_CH2

  writeConfig(FDC, 0x17, 0x20, 0x01); //CLOCK_DIVIDERS_CH2
  writeConfig(FDC, 0x21, 0xF8, 0x00); //DRIVE_CURRENT_CH2
  writeConfig(FDC, 0x13, 0x00, 0x0A); //SETTLECOUNT_CH2
  writeConfig(FDC, 0x0B, 0x69, 0xE8); //RCOUNT_CH2
  
  writeConfig(FDC, 0x19, 0x00, 0x00); //ERROR_CONFIG
  writeConfig(FDC, 0x1B, 0xC2, 0x0C); //MUX_CONFIG
  writeConfig(FDC, 0x1A, 0x0A, 0x01); //CONFIG
}

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("Starting");
  pinMode(2, OUTPUT);
  Configuration();
}

void loop() {
  Wire.beginTransmission(FDC);
  monitor();
}