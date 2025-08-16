---
title: "Claude Code: Properly Packaged and Always Fresh with Nix Flakes"
published: true
description: A Nix flake that makes Claude Code properly packaged and up to date
tags: [nix, automation, devtools, claude]
date: 2025-07-06
cover_image: 
canonical_url: https://github.com/sadjow/articles/blob/main/technical/2025/self-updating-nix-flake-claude-code.md
dev_to_id: 2661432
dev_to_url: https://dev.to/sadjow/claude-code-properly-packaged-and-always-fresh-with-nix-flakes-1ma8
---

Ever had that moment where you switch Node versions and suddenly half your global tools vanish? Yeah, me too. That's exactly why I packaged Claude Code with Nix.

Here's the thing: Claude Code is fantastic. But when you're juggling multiple projects with different Node versions through devenv, asdf, or nvm, that globally installed `npm install -g @anthropic-ai/claude-code` becomes a house of cards. Switch to Node 18 for one project? Claude disappears. Jump to Node 22 for another? Good luck finding where npm stashed it this time.

## The Hidden Cost of npm install -g

Most developers treat global npm packages like system utilities. We `npm install -g` something and expect it to just... work. Forever. But that's not how Node's ecosystem operates. With version managers like nvm or asdf, your global packages are tied to specific Node versions, living in version-specific directories that vanish when you switch versions. Even with the official Node installer, upgrades can break global packages due to compatibility issues—and npm's own docs recommend against using it for development.

This gets worse with tools like Claude Code that you want available everywhere, all the time. It's not project-specific—it's a development companion. Having it disappear because you switched Node versions is like your hammer vanishing because you moved from the garage to the kitchen.

## Enter Nix: Proper Packaging Done Right

Both nixpkgs upstream and this flake solve the fundamental npm global problem—they bundle Claude Code with its own Node.js runtime. Not your system Node. Not your project's Node. Its own, isolated, "I-don't-care-what-version-you're-running" Node. This isn't elegant—it's bulletproof.

But here's where this flake differentiates itself: while upstream nixpkgs is locked to Node.js 20 with no override option, this package uses Node.js 22 LTS. And more importantly, it's updated within an hour of new releases, not weeks later.

## Why This Package Over Upstream nixpkgs?

While Claude Code exists in nixpkgs and solves the npm global problem, this dedicated flake offers specific advantages:

**Speed of Updates**: The biggest differentiator. This flake checks for updates every hour and publishes immediately. Upstream nixpkgs can take days to weeks for PR reviews and channel propagation. When Claude Code pushes a critical fix, you get it in under an hour, not next week.

**Node.js Version Control**: Upstream is hardcoded to Node.js 20 as a function parameter—you can't override it. This flake uses Node.js 22 LTS, giving you better performance and the latest security updates.

**Dedicated Maintenance**: When Claude Code changes its requirements or adds new validations, this repository can adapt immediately without waiting for the nixpkgs contribution process.

You get:
- Updates within 1 hour of npm release (vs days/weeks for nixpkgs)
- Node.js 22 LTS for better performance (vs locked Node.js 20)
- Direct flake usage with binary cache via Cachix
- Immediate fixes when Claude Code changes
- Full control over the packaging implementation

## The Trade-offs

Let's be honest about the comparison:

**npm global** is simplest if you never switch Node versions. But one `nvm use` or `asdf install` and Claude disappears.

**nixpkgs upstream** solves the isolation problem and is well-maintained. But you're at the mercy of PR review times and locked to Node.js 20.

**This flake** gives you the fastest updates and latest Node.js, but requires trusting a third-party repository (though the code is open and simple to audit).

Choose based on your priorities: simplicity (npm), stability (nixpkgs), or bleeding-edge updates (this flake).

## How It Stays Fresh: Hourly Updates

The automated update system is what makes this flake special. A GitHub Action runs every hour, checking npm for new Claude Code versions. When found, it automatically:
1. Updates the version and calculates the new hash
2. Creates a pull request with the changes
3. Builds and tests on Linux and macOS
4. Auto-merges if all checks pass
5. Pushes pre-built binaries to Cachix

This means new Claude Code versions are available within 30-60 minutes of npm release. Compare that to nixpkgs where you might wait weeks for the PR to be reviewed and merged, then more time for it to reach your channel.

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

## A Note on AI Collaboration

This article and the claude-code-nix flake itself—were created with AI assistance. I used Claude to help review drafts, refine ideas, and improve clarity. But here's what matters: the problems described are real, the solution works, and the implementation reflects years of experience with Nix and development workflows.

## References

- [Nix](https://nixos.org/) - The purely functional package manager
- [Home Manager](https://github.com/nix-community/home-manager) - Manage user environments using Nix
- [Cachix](https://cachix.org/) - Binary cache hosting for Nix
- [Claude Code](https://claude.ai/code) - The AI coding assistant this package wraps
