---
title: "Where's my smart MCU? Maybe it's here..."
date: 2009-10-26T23:15:00
author: techninja
slug: wheres-my-smart-mcu-maybe-its-here
type: blog
image: /images/OSMCUAI-Logo/index.png
tags:
  - 'artificial intelligence'
  - 'hobby'
  - 'neural net'
  - 'robot'
  - 'µCAI'
  - 'neat'
---

Ok, so.. maybe I'm crazy but... ever since my initial foray into Micro-controllers, so little emphasis is kept on the actual building when it comes to "moving" bots. On the beloved [arduino](http://arduino.cc/), all it takes is a single [open source shield](http://www.ladyada.net/make/mshield/) (or less) to start making a chassis move, and right out of the box you can receive and measure various sensors and inputs.

The real emphasis eventually becomes.. the "smart", the what you want it to do, the making sense of what the world is, and finding the action to make within it. I remember at this years Makerfaire, meeting an awesome maker by the name of Kris Magri who demoed the assembly of a very nice intro bot called ["Makey"](http://makezine.com/19/makey/). One of the audience members at the demo asked about the code for the robot, and she replied with something along the lines of.. you can spend a couple weeks building it to sense and move, but you can spend years on the code...

As I nodded I felt the same lump of despair I've always had about making a wheeled autonomous bot. The idea that it would never become anything more than a wall rammer, a table lemming, or a thin veneer of intelligence based on trickery and careful timing. Remote controls become extensions of yourself, but a real bot out on it's own.. you've created your own "life". It's probably the dream we've always had when making bots, but when you get down to coding it, the learning curve is so steep as to stop you in your tracks.. unless it's your major at MIT.

I intend to officially put forth an idea today. I call it, µCAI, or the Micro-controller Artificial Intelligence project.

![I made up this cool logo in about 5 minutes.. just to make the idea concrete. Man that green is awful...](/images/OSMCUAI-Logo/index.png)

The main idea behind µCAI (other than being hard to type) would be to lower the barrier for students and advanced hobbyists alike to enter into the field of machine learning, neural networks and simple artificial intelligence for use with the myriad micro controller options available. You give your bot eyes, ears and legs, and µCAI would be the brain.

An open source abstraction layer/library ported for many MCU types, allowing all sensor types and inputs to be directly interpreted as needed into action to output through servos, dc motors or speech/sound modules. Light sensing could, with only a few lines of setup code describing what pins contain a photo-resistor, and what functions activate the motors, be transmuted into light tracking/avoiding behavior. Given enough sensors and physical outputs, behavior could give certain weights to light, others to distance, simple area mapping. The possibilities could be endless, as long as it's built open enough.

Yea, I'm probably crazy... but I've seen far too many bot projects fall by the wayside for simple lack of code understanding the physical world.

I don't think anything like this has been done yet, or at least I haven't found it. Enough work has been done out there in code small enough to count that I think there's real hope for this. As a plus to all this, I've never done any machine learning or AI.. but I'm a real fan of [Mario AI](http://www.doc.ic.ac.uk/~rb1006/projects:marioai) ;)
