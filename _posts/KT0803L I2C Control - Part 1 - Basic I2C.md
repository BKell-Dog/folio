---
layout: post
title: KT0803L I²C Control - Part 1 - Basic I²C
author: Will Kelly
date: 2025-03-29
tags: Electronics, Microcontrollers
---

I bought the [KT0803L](https://a.aliexpress.com/_mMrsfy3) FM Modulator chip on AliExpress. My plan is to connect this chip to the in sequence with the output of the YX5200 a.k.a. DFPlayer, which reads music files from an SD card and outputs audio. This chip will then, presumably, take in the audio signal and modulate it into an FM signal which can then be transmitted over the air, and received by handheld radios, cars, etc. My ultimate goal is to build a device that can be loaded with a personal music playlist in .mp3 files which will play over your car's radio whenever your car electronics are turned on.

This KT0803L promises to be a lynchpin in that structure, transforming plain audio into FM. But first the chip must be understood, and controlled. Thankfully it accepts I²C commands over a shared device bus, and in the development phase can be controlled by any microcontroller, like an Arduino. In production, I plan to control it with a CH32V003 chip from WCH.

The chip registers are defined in the [datasheet](https://www.alldatasheet.com/datasheet-pdf/view/1134996/ETC2/KT0803L.html), and can be read to and written from with I²C. An Arduino is a quick and easy I²C controller (any type, but I choose the Uno) with ample libraries, which I will use for this post just to verify that I²C control works;

The following code is probably the most basic form of I²C possible. It scans for the first available device by initiating a transmission at every possible address, until it finds a device that returns an ACK byte which causes the Wire.endTransmission() function to return 0 (i.e. without an error), and returns the address of that device. Then it prints that address to the serial monitor.

```C
#include <Wire.h>

void setup() {
	 Serial.begin(9600);
	 
	 uint8_t KT0803L_Addr = scanForDevices();
	 Serial.println(KT0803L_Addr);
}

void loop() {
}

uint8_t scanForDevices() {
	 Wire.begin();
	 for (uint8_t address = 1; address < 127; address++) {
	 	 Wire.beginTransmission(address);
	 	 if (Wire.endTransmission() == 0) {
	 	 	 Serial.print("Device found at 0x");
	 	 	 return address;
	 	 }
	 }
}
```

When I run this code, I find the KT0803L device at address 0x36 (0x0110110 in binary). When I've run this code before with a different KT chip, I found the chip at the location 0x3E (0x0111110 in binary). So despite the [documentation](https://d148k72crfmm2d.cloudfront.net/wp-content/uploads/2020/07/KT0803L-KTMicro.pdf) stating that the chip's default address is 0x0111110, in reality the address can vary, and it would be wise to scan for the devices address at the beginning of each script.
