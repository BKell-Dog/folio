---
title: Power Supply Design - Part 1 - Teardown
author: Will Kelly
date: 2025-02-26
time: 09:22:31
tags: Electronics, Power
---

A friend asked me to design a new power supply for the device he's planning to build, with the following specifications:

- Connect to an American wall outlet.
- Output a steady 12 V and 2.5 A.
- Fit inside a 40 mm x 40 mm x 3 mm volume, not including heat sink or wires.

There are a lot of efficiency features and safety mechanisms that wouldn't fit in such a small space, but this design was for a battery charger, not for an active power supply. The device would be plugged in for hours at a time, likely overnight, so transformer efficiency, immediate wattage, or voltage stability aren't as important as in other applications.

But to begin, since I haven't designed a power supply before even though I understand the basics, I wanted to tear down an existing power supply and see how professionals have done it in the past. I got my hands on a TDK-Lambda SCB343D from work which also turned main power into 12 V and 2.5 A. Luckily the PCB was not multilayered, so I could trace each connection by eye.

![SDK-Lambda SCB343D](https://i.imgur.com/RGFVf34.jpeg)

![TDK-Lambda SCB343D Backside](https://i.imgur.com/nU5MDT7.jpeg)

The first component was a fuse, and close by it an overvoltage protector. The AC lines moved to a full-bridge rectifier component, which output a positive and negative voltage lead. The whole circuit was able to take in 115 V and 230 V, deciding between the two with a switch. Each voltage level would be routed through it's own power circuit so that the output was theoretically unaffected (even though the user had to manually flip a switch on the PSU).