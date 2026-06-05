---
title: 'CNCServer v3 & Automating Art in Lockdown'
date: 2020-04-01T12:00:00
created: 2026-06-15
author: techninja
slug: cncserver-v3-automating-art-2020
type: blog
image: /images/blog/cncserver-v3-automating-art-2020/IMG_20200210_164841.jpg
tags:
  - 'cncserver'
  - 'art'
  - 'pen-plotting'
---

![Single line filled circles by T. Foust, used and traced with permission](/images/blog/cncserver-v3-automating-art-2020/IMG_20200210_164841.jpg)

When the world stops in March 2020, I dive deep into CNCServer's fill algorithms. Honestly COVID hasn't changed life for me that much. I've been full time remote for years and have been using Zoom before most people knew what it was. But the suddenly empty calendar gives me more reason to dive in and figure out vectorization and fill for the next version of CNCServer .

## The Problem

Pen plotters and painting robots need to fill areas with ink. Sounds simple, but the math behind making a robot fill a shape beautifully is anything but. Parallel lines are boring. Random walks are chaotic. I want something that looks intentional, that has texture and personality.

I spend months rewriting the fill system from scratch. New algorithms for path planning, spacing optimization, overlap management. The abstraction layer grows to handle not just simple fills but complex multi-pass techniques: hatching, cross-hatching, spiral fills, and eventually the one that really catches my eye... squiggle fills.

## Squiggle Fills and CMYK

The breakthrough is getting CNCServer v3 to render full color images using CMYK pen overlays. Four passes, four colors, each rendered as controlled squiggles whose amplitude and frequency encode the color density. Up close it looks like controlled chaos. Step back and you see a photograph.

![CMYK pen wiggle overlay vectorized color representation detail](/images/blog/cncserver-v3-automating-art-2020/PXL_20200930_213504314.MP.jpg)

![Full version of Carl the boston terrier rendered in CMYK squiggles by Axidraw and CNCServer v3](/images/blog/cncserver-v3-automating-art-2020/PXL_20200930_213724427.MP.jpg)

## Single Line Art

Saw some amazing work on Reddit by artist T. Foust, using one line to greate entire images. His work immediately thrilled me for the iherent plotter compatibility and creativity, continuous line drawings that form complex images without the pen ever lifting would be so mezmerizing to watch as the work becomes visible, retracing exactly what the artist did to create it in the first place. I reached out and he gave me permission to recreate some of these.

![Single line crescent moon by T. Foust printed with fine sharpie with permission.](/images/blog/cncserver-v3-automating-art-2020/PXL_20200930_183951738.MP.jpg)

Here's hoping I can get this new fill and project abstraction work out in a complete v3 release for CNCServer before my twins are born and completely derail my entire life and priorities! 🤞
