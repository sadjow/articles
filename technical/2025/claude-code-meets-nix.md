---
title: "Claude Code meets Nix: Your AI Assistant, Properly Packaged"
published: false
description: How I solved the global npm package problem with proper packaging in Nix
tags: [nix, nodejs, devtools, claude]
date: 2025-07-03
cover_image: 
canonical_url: 
---

# Claude Code meets Nix: Your AI Assistant, Properly Packaged

Ever had that moment where you switch Node versions and suddenly half your global tools vanish? Yeah, me too. That's exactly why I packaged Claude Code with Nix.

Here's the thing: Claude Code is fantastic. But when you're juggling multiple projects with different Node versions through devenv, asdf, or nvm, that globally installed `npm install -g @anthropic-ai/claude-code` becomes a house of cards. Switch to Node 18 for one project? Claude disappears. Jump to Node 22 for another? Good luck finding where npm stashed it this time.

## The Problem Nobody Talks About

Most developers treat global npm packages like system utilities. We `npm install -g` something and expect it to just... work. Forever. But that's not how Node's ecosystem operates. With version managers like nvm or asdf, your global packages are tied to specific Node versions, living in version-specific directories that vanish when you switch versions. Even with the official Node installer, upgrades can break global packages due to compatibility issues—and npm's own docs recommend against using it for development.

This gets worse with tools like Claude Code that you want available everywhere, all the time. It's not project-specific—it's a development companion. Having it disappear because you switched Node versions is like your hammer vanishing because you moved from the garage to the kitchen.

And don't get me started on macOS. Every time Claude Code updates, macOS treats it like a brand new app. "Claude would like to access your documents folder." Again. And again. It's death by a thousand permission dialogs.

## Enter Nix: Proper Packaging Done Right

Nix doesn't do things halfway. Where other package managers would give you a shrug and a "works on my machine," Nix brings determinism to the chaos. And that's exactly what we need here.

The claude-code-nix package bundles Claude Code with its own Node.js LTS runtime. Not your system Node. Not your project's Node. Its own, isolated, "I-don't-care-what-version-you're-running" Node. This isn't elegant—it's bulletproof.

But here's where it gets interesting. The package doesn't just wrap Claude Code; it actively prevents the kind of issues that drive developers crazy. Your project's npm remains untouched, updates are managed through Nix, and Claude's configuration persists across system changes.

## Why This Matters

This isn't about making things complicated for complexity's sake. It's about recognizing that development tools should be reliable infrastructure, not fragile dependencies.

With traditional package managers, you get convenience at the cost of stability. With Nix, you get both—but you pay for it in initial setup complexity. The claude-code-nix package tries to hide most of that complexity while keeping the benefits.

You get:
- Claude Code that works regardless of your project's Node version
- Daily automated updates—no waiting for nixpkgs to catch up
- Permissions that survive updates (especially important on macOS)
- Configuration that persists across system changes
- Pre-built binaries via Cachix—no compilation needed

## The Trade-offs

Let's be honest: this isn't for everyone. If you're happy with `npm install -g` and don't mind the occasional reinstall, stick with that. This package is for people who've been burned one too many times by version conflicts and permission resets.

It's also not a one-click install. You need Nix. You probably want Home Manager. You definitely need to understand what you're doing. But once it's set up? It just works. Every time. In every project. With every Node version.

## Looking Forward

The automated update system deserves a mention. A GitHub Action checks daily for new Claude Code versions, creates a PR with the update, and runs tests on Ubuntu and macOS. It's the kind of automation that makes maintenance painless—very much in the spirit of Nix's declarative approach.

This project showcases what Nix excels at: taking a messy, stateful problem and wrapping it in declarative, reproducible configuration. It's not always pretty, but it's reliable. And in the world of development tools, I'll take reliable over pretty any day.

Want to try it? Start with:

```bash
# First, enable the binary cache for instant installation
cachix use claude-code

# Then run Claude Code
nix run github:sadjow/claude-code-nix
```

If that works for you, consider the full installation. Your future self will thank you the next time you switch Node versions and Claude is still there, ready to help, permissions intact.

---

*The claude-code-nix package is available at [github.com/sadjow/claude-code-nix](https://github.com/sadjow/claude-code-nix). It's MIT licensed (the packaging, not Claude Code itself), and contributions are welcome—especially if you've found new and creative ways to make development tools behave.*
