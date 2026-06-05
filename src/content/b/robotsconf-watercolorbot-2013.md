---
title: "RobotsConf Keynote & WaterColorBot"
date: 2013-11-01T12:00:00
created: 2026-06-15
author: techninja
slug: robotsconf-watercolorbot-2013
type: blog
image: /images/blog/robotsconf-watercolorbot-2013/IMG_20130410_231346.jpg
tags:
  - "cncserver"
  - "watercolorbot"
  - "conference"
  - "robots"
  - "speaking"
---

![The very first image painted on the very first WaterColorBot prototype](/images/blog/robotsconf-watercolorbot-2013/IMG_20130410_231346.jpg)

Two threads of my life converge on a stage in Florida: robots and art.

## WaterColorBot

The WaterColorBot is originally Sylvia's idea. She wants a robot that paints. Evil Mad Scientist Laboratories turns it into a real product [earlier this year](https://sylviashow.com/blog/techninja/2013/02/28/steam-day-robot-building-and-new-episodes/), a beautifully engineered XY plotter with a brush holder. My job is writing the software to drive it.

That software is [CNC Server](/portfolio/cncserver), a RESTful API layer that turns complex CNC motion planning into simple HTTP calls. Want to move the brush to coordinates? POST. Want to dip in paint? POST. Want to wash? POST. If you can make a web request, you can make art with a robot. No special drivers, no G-code knowledge, just URLs and JSON.

It works. Kids are painting with it within minutes of sitting down. Artists are generating algorithmic pieces. Developers are writing creative code that produces physical output. The gap between "I had an idea" and "I made a thing" gets very small.

![Sylvia at the booth showing what her watercolorbot can do at Maker Faire Kansas City 2013](/images/blog/robotsconf-watercolorbot-2013/IMG_1149.jpg)

## RobotsConf Keynote

Keynoting at RobotsConf is surreal. The conference is a who's-who of the JavaScript robotics community. The Johnny-Five crew, the NodeBots organizers, hardware hackers who write firmware in the morning and React components in the afternoon. And they want me to kick it off.

![youtube](Eocz0T7sS0k)

I talk about CNC Server, about the WaterColorBot, about making physical computing accessible through web technologies. But mostly I talk about what happens when you remove barriers between having an idea and executing it. The best robots aren't the most complex. They're the ones that let you get from thought to action fastest.

The WaterColorBot lives at that intersection. The most impactful tool you can build isn't the most powerful. It's the most inviting.
