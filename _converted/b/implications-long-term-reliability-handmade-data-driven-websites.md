---
title: "The implications of long term reliability in handmade data driven websites..."
date: 2009-06-07T17:57:00
author: techninja
slug: implications-long-term-reliability-handmade-data-driven-websites
type: blog
image: /images/superwheel/index.jpg
tags:
  - "drupal"
  - "handmade"
  - "websites"
  - "how to..."
---

...or, ***How I Learned to Stop Worrying and Love the Drupal***...

I recently had to make a smaller website project for a client, and I figured I'd try and make everything by hand. I mean, why not? A full blown CMS seemed far too bloated for the relatively small feature-set expected.  All I’d really need is a little php here, some javascript to server AJAX stuff there... What fun! Though, let me take a second to get metaphorical here:

![The implications of long term reliability in handmade data driven websites...](/images/superwheel/index.jpg)

  The real point here is that by making this website using small individual parts and pieces (that can do little without being tied together by hand) as opposed to using something pre-made, I'm making a wheel. Potentially a very cool, and fast wheel with a flux-capacitor and the ability to travel into multiple dimensions... (The connotations to *re-inventing* the wheel are intentional, which I’ll explain in a second.)

I figured I probably needed some sort of simple plan, so I decided to write down all the features I knew I’d need now, and all the features that would be needed soon after.

- Easy content posting

- Dated posts

- Anon Comments

- Menus

- Easy method for swapping out template images

- Room for growth, and…

- ? ? ?

As for a timeline:  once the structure for the of database tables is figured, make a few nest included recursive template files, some .htaccess rewrites, a single index file driving the whole thing and ... *tada!* a website!

 Totally doable with today’s useful client and server-side libraries (and without a ‘bloated’  full on content management system), and within a couple weeks it’d be ready for the client to beta test.

***but…*** 

 What if they want to reorganize content? What if they want a template specific to secondary pages? What if they want to dynamically link content across pages? What If I don't know enough about sql and apache log injection attacks? Yeesh!

Both CMSs and language frameworks really have one big overriding purpose, and that's to make certain broad (and occasionally specific) topic things easier to implement. The complicated things that are easy to *screw up*, the tricky things you want to do with less implementation code, etc. These all have their own aspect of in limiting what you can do to varying degrees, and they work great, right up until you want to do something it's designers *never meant for you to do*. Of course some designer’s leave things a little more open…

![Drupal: Free, Open Source, Seats 7 comfortably (With cupholders!)](/images/drupalvan/index.jpg)

 Enter, [the minivan](http://drupal.org/). An all purpose, wheels included vehicle. Big when compared to the wheel (but still capable and small enough park in those compact spaces). Get it now for the low low price of free! Fits in your standard low budget MySQL and PHP garage, and will provide you with the get up and go that you need.

![The chrome headers and flux capacitor come only as free upgrades, IF you need them](/images/superdrupalvan/index.jpg)

Once you’ve got it, you can start paring it up or down from there... in the same amount of time you get more features, less work, and because it's based in the same "language" as the flux-capacitor wheel, the same parts can go into it, not to mention over 2,400 bolt on modules for extra features like [jet packs](http://drupal.org/project/views) and the [transdimensional transmogrifier](http://drupal.org/project/cck). 

So, it’s true. Even with my small project, when weighing the costs of simplicity in the wheel vs relative complexity in a full on Content management system, the CMS won out by the mere fact that it’s open, developable and tested by thousands of incredibly smart people against attacks, and if you dig deep enough, Drupal is only the basis of a module driven, rewrite and page templating system, it’s only the core modules that take care of the real work of content management.
