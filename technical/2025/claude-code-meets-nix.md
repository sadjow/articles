---
title: "A Self-Updating Nix Flake for Claude Code"
published: true
description: Building a Nix flake that keeps Claude Code fresh with automated daily updates
tags: [nix, nodejs, devtools, claude]
date: 2025-07-06
cover_image: 
canonical_url: https://github.com/sadjow/articles/blob/main/technical/2025/claude-code-meets-nix.md
dev_to_id: 2660064
dev_to_url: https://dev.to/sadjow/claude-code-meets-nix-your-ai-assistant-properly-packaged-9k5
---

# A Self-Updating Nix Flake for Claude Code

Ever had that moment where you switch Node versions and suddenly half your global tools vanish? Yeah, me too. That's exactly why I packaged Claude Code with Nix.

Here's the thing: Claude Code is fantastic. But when you're juggling multiple projects with different Node versions through devenv, asdf, or nvm, that globally installed `npm install -g @anthropic-ai/claude-code` becomes a house of cards. Switch to Node 18 for one project? Claude disappears. Jump to Node 22 for another? Good luck finding where npm stashed it this time.

## The Hidden Cost of npm install -g

Most developers treat global npm packages like system utilities. We `npm install -g` something and expect it to just... work. Forever. But that's not how Node's ecosystem operates. With version managers like nvm or asdf, your global packages are tied to specific Node versions, living in version-specific directories that vanish when you switch versions. Even with the official Node installer, upgrades can break global packages due to compatibility issues—and npm's own docs recommend against using it for development.

This gets worse with tools like Claude Code that you want available everywhere, all the time. It's not project-specific—it's a development companion. Having it disappear because you switched Node versions is like your hammer vanishing because you moved from the garage to the kitchen.

## Enter Nix: Proper Packaging Done Right

Nix doesn't do things halfway. Where other package managers would give you a shrug and a "works on my machine", Nix brings determinism to the chaos. And that's exactly what we need here.

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

Let's be honest: this isn't for everyone. If you're happy with `npm install -g` and don't switch Node versions often, stick with that. But if you've ever lost a tool after switching versions, or if you just appreciate having your development tools properly isolated and always available, this approach might resonate with you.

It's also not a one-click install. You need Nix. You probably want Home Manager. You definitely need to understand what you're doing. But once it's set up? It just works. Every time. In every project. With every Node version.

## How It Stays Up to Date

The automated update system deserves a mention. A GitHub Action runs daily in the package repository, checking for new Claude Code versions. When found, it automatically builds the package for x86_64-linux, x86_64-darwin, and aarch64-darwin, runs tests, and pushes the binaries to Cachix. This means you're always one command away from the latest version—no waiting for manual package bumps or compiling from source.

This project showcases what Nix excels at: taking a messy, stateful problem and wrapping it in declarative, reproducible configuration. It's not always pretty, but it's reliable. And in the world of development tools, I'll take reliable over pretty any day.

## Getting Started

First time with Nix? Here's the quickest path:

```bash
# Install Nix (if you haven't already)
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install

# Install Home Manager (optional but recommended)
nix run home-manager/master -- init --switch
```

Want to try Claude Code? Start with:

```bash
# Enable the binary cache for instant installation (optional but recommended)
cachix use claude-code

# Run Claude Code (works without cachix, but will compile from source)
nix run github:sadjow/claude-code-nix
```

If that works for you, consider the full installation. Your future self will thank you the next time you switch Node versions and Claude is still there, ready to help, permissions intact.

For a complete development environment setup with Nix and Home Manager, check out my [home-manager configuration](https://github.com/sadjow/home-manager)—it includes this Claude Code package and many other development tools properly packaged.

---

*The claude-code-nix package is available at [github.com/sadjow/claude-code-nix](https://github.com/sadjow/claude-code-nix). It's MIT licensed (the packaging, not Claude Code itself), and contributions are welcome—especially if you've found new and creative ways to make development tools behave.*

## References

- [Nix](https://nixos.org/) - The purely functional package manager
- [Home Manager](https://github.com/nix-community/home-manager) - Manage user environments using Nix
- [Cachix](https://cachix.org/) - Binary cache hosting for Nix
- [Claude Code](https://claude.ai/code) - The AI coding assistant this package wraps
