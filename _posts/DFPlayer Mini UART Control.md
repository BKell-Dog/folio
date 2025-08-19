---
title: DFPlayer Mini UART Control
author: Will Kelly
date: 2025-03-31
tags: Electronics, Microcontrollers
---

This post is a companion to [KT0803L I²C Control - Part 1 - Basic I²C](https://bkelldog.neocities.org/log/post.html?file=.%2Flog_files%2FKT0803L%20I2C%20Control%20-%20Part%201%20-%20Basic%20I2C.md), in which I go over basic control of the KT0803L IC using I²C from an Arduino Uno. I wired the Uno to both the DFPlayer Mini module and the KT0803L, since the KT is controlled over I²C and the DFPlayer over UART.

First I will wire the KT0803L and the DFPlayer together (i.e. DFplayer output pins (i.e. pin 4: DAC_R and pin 5: DAC_L) to KT0803L input pins (i.e. pin 7: INR and pin 6: INL)) and to power; then I will add in the Uno, which will provide power from its 3.3 V pin, and connect the TX/RX on the DFPlayer to pins 11~/10~ on the Uno, and the SDA/SCL on the KT0803L to the A4/A5 pins on the Uno. For now, though, the KT0803L will be inactive.

![Arduino x DFPlayer x KT0803L](https://i.imgur.com/EcnbO61.png)

To demonstrate basic UART control of the DFPlayer module, I uploaded this script to the Arduino Uno. It uses pins 10 and 11 for UART communication to the DFPlayer, and uses the DFRobotDFPlayerMini library to simplify UART communications. It sets the volume to 25 out of 30, and plays the third song on the SD card. Refer to other manuals on the DFPlayer to understand how to properly structure files on the SD card.

```C
#include "SoftwareSerial.h"

#include "DFRobotDFPlayerMini.h"

SoftwareSerial mySerial(10, 11); // RX, TX
DFRobotDFPlayerMini myDFPlayer;

void setup() {
	 	 Serial.begin(9600);
	 	 mySerial.begin(9600);

	 	 if (!myDFPlayer.begin(mySerial)) {
	 	 	 	 Serial.println("DFPlayer Mini not detected!");
	 	 	 	 while (true);
	 	 }
	 	 
	 	 Serial.println("DFPlayer Mini ready!");
	 	 myDFPlayer.volume(25); 	// Set volume (0 to 30)
	 	 Serial.println("Playing File 001.mp3");
	 	 myDFPlayer.play(); 	 	 	// Play first MP3 file
}

void loop() {
}
```

The DFPlayer library provides the following commands for controlling the module. There are more, but these are likely all that I will ever need:

```C
dfplayer.next(); // Play next track
dfplayer.previous(); // Play previous track
dfplayer.pause(); // Pause playback
dfplayer.start(); // Start/resume playback
dfplayer.volume(15); // Set volume 0-30
dfplayer.volumeUp(); // Increment volume
dfplayer.volumeDown(); // Decrement volume
dfplayer.play(2); // Play song 2
dfplayer.playFolder(2, 3); // Play song 3 in folder 2.
dfplayer.loop(4); // Loop song 4
dfplayer.reset(); // Reset playback at song 001 in folder.

// Find all functions here https://github.com/DFRobot/DFRobotDFPlayerMini/blob/master/DFRobotDFPlayerMini.cpp
```

I also added a little test to see if the DFPlayer would start playing one song, wait 5 seconds, then switch to another song at a different volume.

```C
Serial.println("DFPlayer Mini ready!");
myDFPlayer.volume(25); // Set volume (0 to 30)
myDFPlayer.play(3); // Play third MP3 file
delay(5000);
myDFPlayer.volume(15);
myDFPlayer.loop(4);
```