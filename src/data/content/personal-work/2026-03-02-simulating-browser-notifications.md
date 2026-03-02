---
title: Simulating Browser Notifications
date: 2026-03-02
links:
  live: https://nagbharat92.github.io/notifications-browser/
  github: https://github.com/nagbharat92/notifications-browser
---

## What the browser actually gives you

I was in a product discussion about improving how we notify people. Before we could decide what to build, I realised I didn't actually know what the browser gives us at the OS layer, specifically on macOS and Chromium. Rather than guess, I built a small playground to find out.

The app lets you request notification permissions and fire off four progressively richer notification types: title only, title with a body, title with a body and icon, and finally title with interactive action buttons which require a service worker and are the most capable type Chromium exposes. Each type is its own card. You click, the notification fires, you see exactly what the platform renders.

The scope was deliberately narrow. macOS, Chromium, four types. No ambitions beyond answering the question.

---

## Craft that came along for the ride

I ended up putting more craft into it than a pure research tool strictly needed. 3D cursor-tracking cards, a stagger animation system I'm particularly happy with, [OKLCH](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)-based theming that works in light and dark. That's just how I build things. The polish didn't conflict with the purpose.

---

## Documenting animation for AI reuse

The more interesting thing that came out of it: I wanted to reuse the stagger animation in future projects, but every time I tried to rebuild it with Copilot it came out wrong. Not broken, just missing the details that made it feel right. So I opened up Claude Cowork, walked through the animation with it, and had it produce a short PRD that documented the full system: the easing curve, the non-uniform delay intervals, the fill mode, and the reasoning behind each decision. That document is what I now hand to any AI tool when I want the animation rebuilt correctly. Code without rationale gets rebuilt incorrectly. Code with rationale doesn't.

Sometimes the best research is just making the thing.
