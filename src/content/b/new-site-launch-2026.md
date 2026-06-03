---
title: "New Site, Who Dis?"
date: 2026-06-03T12:00:00
author: techninja
slug: new-site-launch-2026
type: blog
image: /images/blog/new-site-launch-2026/james_with_frankie_the_pug_puppy.jpg
tags:
  - "clearstack"
  - "meta"
  - "web-development"
  - "open-source"
---

![James with Frankie the pug puppy](/images/blog/new-site-launch-2026/james_with_frankie_the_pug_puppy.jpg)

Welcome to the new tn42! I whipped this up upon realizing I'd spent at least 15 years ignoring this when I could be using it to own my own content space instead of using someone else's computers to sell ads next to my content that benefit them. I originally built this site as [a Drupal 6 site](/b/implications-long-term-reliability-handmade-data-driven-websites) with high hopes that running something larger than we need, we make up for that with open source support. In truth, keeping up to date with security releases for a personal project just so I could have programmable field shapes and an in-browser editor? An absurd suggestion. In 2 years it was vulnerable, and in 8 years I gave up thinking I could transition out cleanly and flattened it to an HTML archive hosted in github pages to avoid paying to host what was essentially static content.

It wasn't long before I couldn't recommend anyone build on Drupal for the long term unless they could get someone to patch their modules and manage inevitable breaking schema updates for a feature you may not even be using (or users aren't using it correctly). And at Four Kitchens I found myself in the depths looking to migrate and manage big rushing security updates when PHP flaws are found in contributed modules. The security surface area was *huge* for a payoff that we essentially chased constantly to boil down to the most flat/static caching for anon-users as possible so that it could be fast (even if you had 50+ joins for your homepage content views on every fresh pull!).

I moved then to Gatsby, an idea about the frontend owning the query structure a bit that BUILT to essentially frontend dynamic, but static assets using React and GraphQL. I was pretty well sold in 2019 thanks to a few talks I saw in person, but it seemed the community and the drive was sucked out by 2020 as Gatsby was sold and ignored.

Around this time I personally needed to get away from React because the webpack and building ecosystem seemed to complicate and obfuscate already complicated web applications, but all the jobs asked for it so I learned up. I kept seeing the complicated patterns for building that were easy to mess up, being rethought constantly, and usually left concerns about state management as a problem for "something else". Around this time I started looking into WebComponents, supposedly the future of structured web applications, yet no one was talking about it or using it?

Eventually I found [Hybrids](https://hybrids.js.org) on a random Hacker News post, having come off a "functional first" kick I thought the idea was novel and the implementation left component definition clean, concerns mostly separated, and the missing piece ended up being included state and route management that came soon with newer versions. I ended up writing a version of my CV with it, and then by 2025, started playing with the atomic folder structure for a full UI built out in it for the non-jquery re-write of [NinjaNode](https://github.com/techninja/ninjanode), which you can watch me and my son walk through creating UI from scratch from a hand drawn sketch:

![youtube](3Ju3IuZWuLU)

![Stress testing the Pixi renderer on NinjaNode](/images/blog/new-site-launch-2026/stress_testing_the_pixi_renderer_on_ninjanode.png)

Not long after I was introduced to LLM assisted development and after initially building out a big messy frontend application in [raw web components with no overall architecture planned for Asili Lab](https://github.com/techninja/asili-lab), I was left with a mess that couldn't be the application I wanted it to be or very easily be re-worked without some serious rethought, so I figured why not make the thing I really need, so was born [Clearstack](https://clearstacks.org).

![Asili Lab in all its awfulness](/images/blog/new-site-launch-2026/asili_lab_in_all_its_awfulness.jpg)

It's far from perfect, is already having growing pains, and really is a collection of ideas I'm still struggling to define well enough that they play well no matter how you build. In now having built out 10+ applications with it, I've worked hard to backport and extend where it makes sense, but it's the hope that this idea actually has proven itself enough to be worthy to build on confidently. Right now it's just me proving that, but I've got high hopes that this magic mix of spec and spec checking can make for a modular, complexity-constrained development that lets you choose when to tidy up the tech debt.

I'll be making a bunch more fill-in posts to document the random projects and events I've done and failed to log over the years as I find the time. Here's hoping I can figure that out before another decade or so!
