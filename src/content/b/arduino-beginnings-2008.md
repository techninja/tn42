---
title: 'Arduino Beginnings'
date: 2008-06-01T12:00:00
created: 2026-06-15
author: techninja
slug: arduino-beginnings-2008
type: blog
image: /images/blog/arduino-beginnings-2008/IMG_5944.jpg
tags:
  - 'arduino'
  - 'electronics'
  - 'hardware'
---

![Upgrading the extruder board firmware with serial passthrough](/images/blog/arduino-beginnings-2008/IMG_5944.jpg)

I finally got my hands on an Arduino. $30 for a little blue Diecimila, and suddenly I can make software that touches the physical world!

I've been coding for over a decade, but this is different. This isn't pixels on a screen. This is a servo that _moves_ when I tell it to. I start where everyone starts: blinking an LED. Then I blink a lot of LEDs.

## Wiimote Hacking

One of the first rabbit holes is hacking the Wiimote's IR camera. Nintendo packed a surprisingly capable image sensor into that thing, and with some i2c wiring and patience, you can use it as a standalone multi-point IR tracker. I have visions of turning my 1080i projection TV into a homebrew multi-touch surface, just have to convince the wife to let me break the TV!

## GPS Data Logging

The other project consuming my evenings is strapping a GPS module to my motorcycle and logging rides. I built a little shield that writes NMEA sentences to an SD card, then wrote a Processing sketch to replay the routes on a map. There's something deeply satisfying about generating physical data from a ride through the hills and then visualizing it on screen later. See more [GPS fun with this post](/b/motorcycle-pda-gps-fun).

![Arduino interfacing with the i2c interface on the MAX6995 LED driver for my piano project](/images/blog/arduino-beginnings-2008/IMG_1957.jpg)

## The Hook

What has me hooked isn't any single project. It's the realization that this $30 board bridges everything I know about code with everything I want to learn about electronics in a plug and play USB interface with headers I can stick jumpers directly into. For now though, it's just me at a desk with a breadboard and a tangle of jumper wires, grinning like an idiot because I made a servo move with code.
