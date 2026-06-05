---
title: 'RoboSapien v2 Hacking'
date: 2009-06-01T12:00:00
created: 2026-06-15
author: techninja
slug: robosapien-v2-hacking-2009
type: blog
tags:
  - 'robots'
  - 'arduino'
  - 'electronics'
  - 'hacking'
---

I pick up a WowWee RoboSapien v2 at a thrift store for $8, missing the remote, which turns out to be a feature, not a bug. Without the IR remote, I have to figure out the control protocol myself. After some logic analyzer work and a lot of trial and error, I have it responding to commands from an Arduino over a single wire. The v2 has surprisingly sophisticated sensors built in: touch, sound, IR vision. Once you have programmatic control, it becomes a genuinely useful robotics platform for experimentation.

![Dorian plays with his modded RoboSapien on Sylvia's birthday](/images/blog/robosapien-v2-hacking-2009/MVI_2058.AVI)

Next step is getting it to respond to sensor input autonomously. Right now it just does what I tell it, but the goal is a basic behavior tree so it can wander, detect obstacles, and react. The $8 thrift store find might end up being the most capable robot in the house.
