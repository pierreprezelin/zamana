# Zamana

Your personal reminder about how and when to take care of your precious plants 🪴

## About

Like many, I love my plants, am concerned when they are down, and sad when they die. But as their number grew, I had a harder time remembering what each one of them needs to thrive.

Light or shade? Temperature range? Keep their roots in water or not?

I created _Zamana_ to be my assistant whenever I'm in doubt about what to do.

## _Zamana?_

I lived on the island of Martinique for quite some time, and there is a gigantic, 300-year-old "Zamana" (_Samanea saman_) tree at L'Habitation Céron, a former sugar plantation from the 1700s. I thought it would be a nice tribute to this magnificent "rain tree", whose branches cover more than 5,000 square meters and which was named France's Tree of the Year in 2016.

If you ever stop by, make sure to pay it a visit!

## Features

Zamana started as an app for my own plants, but it's meant to be useful to everyone:

- 🗒️ Fully customizable info about your plant (name, temp, watering, lifespan...)
- ⚠️ A daily reminder, at the time of your choice, of the care your plants need
- 💧 Watering reminders that follow the growing and rest seasons, wherever you live
- 🌡️ Notifications about incoming storms, strong winds, abnormally hot or cold temperatures
- 🖼️ A timeline with the photos you've taken of your plant to watch its evolution
- 📚 Look up 300,000+ species to find your plant's exact name and a photo
- 📷 Identify a plant from a photo with your own free Pl@ntNet key (opt-in)
- ❓ Help articles about how to take care of your plants
- 🎓 A pro-tip or fun fact about flora every day
- 📍 No account: your plants and photos stay on your phone
- 💎 No subscription, no paid tier, no ads
- 🌍 Translated into English and French
- 🍎 Available on Android and iOS

## Stack

- [React Native](https://reactnative.dev) with [Expo](https://expo.dev) for cross-platform development
- [Node.js](https://nodejs.org) with [Express](https://expressjs.com) for the API
- [Astro](https://astro.build/) for the public website
- [Expo EAS](https://expo.dev/services) for Over-the-Air updates
- [Zustand](https://zustand-demo.pmnd.rs/) for local stores
- [TypeScript](https://www.typescriptlang.org/) with [tRPC](https://trpc.io/) for end-to-end type-safety
- [SQLite](https://sqlite.org/) for the local database
- [Open-Meteo](https://open-meteo.com) for weather forecasts and city search
- [iNaturalist](https://www.inaturalist.org) for species search
- [Pl@ntNet](https://my.plantnet.org) for plant identification from photos
- [Bun](https://bun.com/) as package manager
- [Vercel](https://vercel.com/) and [Cloudflare](https://www.cloudflare.com/products/pages/) for hosting and deployments

**Suggestions, fixes and new features are welcome!** See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

Zamana is free software: you can redistribute it and/or modify it under the terms of the [GNU General Public License v3.0](LICENSE). Two additional terms, detailed at the top of the [LICENSE](LICENSE), apply under section 7 of the GPLv3:

- a distributed fork must credit "Based on Zamana by Pierre Prézelin" with a link to this repository in its "About" or "Settings" screen;
- the name "Zamana", its logo and the identifier `com.pierreprezelin.zamana` are not licensed: a published fork uses its own.
