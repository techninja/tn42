---
title: 'Motorcycle + PDA + GPS = Fun?'
date: 2009-06-05T23:28:00
author: techninja
slug: motorcycle-pda-gps-fun
type: blog
image: /images/casio/index.jpg
tags:
  - 'altitude'
  - 'gps'
  - 'motorcycle'
---

![Yes! it is impossible!.. well.. I've heard it done.. but it's nuts](/images/casio/index.jpg)

About 2 years back I happened upon an older pocket PC. Left for dead, unable to boot, collecting dust, it was going to be chopped to bits as IT fodder. i said "No! Be not crule to old tech! It knows not of it's own obsolescence!!!".. or something to that effect. Long story short, I became the proud owner of a 2001 model Cassiopeia E-115! Having one wasn't enough, and before long for less than $50, I owned three outmoded winCE PDAs...

![e740.. if only I hadn't bought you cheap off eBay after you'd been dropped :P](/images/e740_1/index.jpg)

This story is not about those (I'll leave that for another blog post). This story is about only one, the "best" of the family of the three. The kids call it "Dad", a Toshiba e740, with two very special accessories.

**1.** An **_UBER_** 5700 mAH battery (Approx doubles it's weight, and thickness, though it might stay on for 6 months without quibbling)

**2.** The "Expansion Pack" which add's two ports, an RGB port and a USB port.

Turns out the best the RGB port could do was give you a flaccid 640x480 split screen, even though the linux version was supposed to run 800x600 (as it's native res is only 320x240, it's only understandable). Here's hoping the [linux aims](http://www.mnementh.co.uk/home/projects/linux/eseries/eseries) for these older devices aren't completely washed away!

![Just imagine this attached to a motorcycle helmet.... no, not the pen...](/images/HoluxGPS/index.jpg)

Anyways... with those two pieces to the puzzle the only thing left to make my own GPS logger from spare parts was a USB GPS unit! I'd write my own driver if I had to!.. And I didn't because those bastards at Holux wrote one _specifically for the freakin device I was using!!!!_ Amazing.

So I stuck it all together, found an open source NMEA logger, and went to town... literally.

![This is the usual way I go to my main office to work](/images/home2office1/index.png)

![This is an alternate route I found a little later.. very very different route, but almost the same trip length!](/images/home2office1alt/index.png)

![My trip down the mointain to my second office](/images/home2office2/index.png)

![My trip back home up the mountain...](/images/office2tohome/index.png)

With enough sattelites in clear view, your 2D machinations become 3D, tracking your altitude, as well as your latitude and longitude.. Now that's a lot of tude's .. dude... **facepalm**

Ok.. so, the wonderful site at [www.gpsvisualizer.com](http://www.gpsvisualizer.com/) can take any nmea GPS log and make something fantastic out of it... all the above charts were made using my dinky little PDA and GPS puck setup. As long as you can get the file to the website you can make all kinds of comparison charts, and even google earth traces.

The whole point of all this gps nonsense is to attempt to glean lots of very cool data out of my daily commute. Which way might be faster? If I looked at the top down of my commute, is there a shorter path? Am I going up a bunch of hills that I could be avoiding? Could there be a more fuel efficient route to be taken on my return trip?

The main problem with all of this is that my current vehicle gets 75 MPG without trying all that hard, so my incentive to push that even farther really isn't that heavy, not to mention my total two way commute per day ranges from only 20 to 60 mins. Most of my co-workers have to deal with 75 mins **_one way_**.
