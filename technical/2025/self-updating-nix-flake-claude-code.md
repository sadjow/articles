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

> **TL;DR**
> - Global `npm install -g` tools vanish when you switch Node versions. Nix fixes that.
> - This flake bundles Claude Code with its **own** Node 22 LTS runtime and ships **hourly** updates.
> - Use it with `nix run` for zero setup, or add it to Home Manager/devshell for a permanent, reproducible install.

Ever switched Node versions and watched half your CLI tools evaporate? Same. That's why I packaged **Claude Code** with **Nix**.

Global npm installs are fragile—especially with `nvm`, `asdf`, or per-project Node. When you hop between versions, your "globals" live in versioned directories that come and go. The result: tools like Claude Code disappear exactly when you need them most.

## Nix to the Rescue

Nix packages Claude Code with an **isolated** Node runtime. Not your system Node. Not your project Node. Its **own** Node. That means:

- No more hunting for where npm stashed it this time
- No breakage when switching Node versions or machines
- Reproducible installs across macOS and Linux

Both **nixpkgs** and **this flake** solve the "global npm" problem. The differences are about **speed**, **Node version**, and **control**.

### Why Use This Flake (vs. Upstream nixpkgs)?

- **Faster updates.** A scheduled workflow checks npm **hourly** and publishes immediately (build → test → merge → push binaries to Cachix). You get new Claude Code releases within ~1 hour.
- **Modern runtime.** Upstream is pinned to **Node 20**; this flake uses **Node 22 LTS** for performance and security.
- **Focused maintenance.** If Claude Code changes its packaging needs, this repo adapts instantly—without waiting on nixpkgs PR review and channel propagation.

**In short:** if you want **latest Claude Code quickly** and you prefer **Node 22 LTS**, use this flake.

## Quickstart

Install Nix (and optionally Home Manager) the easy way:

```bash
# Install Nix
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install

# (Optional) Initialize Home Manager
nix run home-manager/master -- init --switch
```

Run Claude Code instantly (no system-wide changes):

```bash
# Optional: use the binary cache for fast, no-build installs
cachix use claude-code

# Run once (or whenever you need it)
nix run github:sadjow/claude-code-nix
```

Pin it to your user profile (survives shells and reboots):

```bash
nix profile install github:sadjow/claude-code-nix
claude --version
```

## Add to Home Manager

Make Claude Code part of your reproducible dotfiles:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    home-manager.url = "github:nix-community/home-manager";
    claude-code-nix.url = "github:sadjow/claude-code-nix";
  };

  outputs = { self, nixpkgs, home-manager, claude-code-nix, ... }:
    let
      system = "x86_64-darwin"; # or x86_64-linux/aarch64-darwin/aarch64-linux
      pkgs = import nixpkgs { inherit system; };
    in {
      homeConfigurations."your-user" = home-manager.lib.homeManagerConfiguration {
        inherit pkgs;
        modules = [{
          home.packages = [
            claude-code-nix.packages.${system}.claude-code
          ];
          # Optional, convenience alias
          programs.bash.shellAliases.ccode = "claude";
        }];
      };
    };
}
```

## Add to a Dev Shell

Keep Claude Code available in project shells without touching global state:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    claude-code-nix.url = "github:sadjow/claude-code-nix";
  };

  outputs = { self, nixpkgs, claude-code-nix, ... }:
    let
      system = "x86_64-linux"; # pick your system
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        packages = [ claude-code-nix.packages.${system}.claude-code ];
      };
    };
}
```

## How It Stays Fresh

The auto-update flow runs **hourly**:

1. Check npm for a new `@anthropic-ai/claude-code` version
2. Update the version + Nix hash
3. Open a PR with changes
4. Build + test on macOS and Linux CI
5. Auto-merge if green and push binaries to **Cachix**

Result: new releases are typically available via `nix run` within an hour of hitting npm.

## Trust, Security, and Control

- **Reproducible by design.** Versions and hashes are pinned; you can rebuild from source if you don't want to use the binary cache.
- **Binary cache is optional.** If you skip Cachix, Nix will compile locally.
- **Pin or track latest.** Pin this repo at a commit or tag to freeze; update your lock file when you want to move.
- **Open and auditable.** The packaging is tiny and readable—easy to review or fork.

## Comparison

| Option | Pros | Cons |
|--------|------|------|
| **npm -g** | Simple on one machine | Breaks with Node switches; path/permission drift; hard to reproduce |
| **nixpkgs (upstream)** | Stable, reviewed, reproducible | Slower release cadence; pinned to Node 20 |
| **This flake** | Hourly updates; Node 22 LTS; easy to integrate | Third‑party source (auditable); depends on your Cachix/CI trust model |

## When to Choose What

- Use **npm -g** if you truly never change Node versions and don't care about reproducibility.
- Use **nixpkgs** if you prefer upstream curation and can wait for updates.
- Use **this flake** if you want **fast updates**, **Node 22 LTS**, and the easiest path to keep Claude Code working everywhere.

## Troubleshooting

- **Build takes a while:** use `cachix use claude-code` for prebuilt binaries.
- **Hash mismatch after a brand-new upstream release:** pull the latest flake revision or retry shortly—the hourly updater may still be in flight.
- **Command not found after `nix profile install`:** ensure your shell sources the Nix profile (restart the shell or source your profile scripts).
- **"Claude symlink points to invalid binary" warning:** This is a false positive. Claude Code expects a large binary file, but Nix packages it as a wrapper script—everything works correctly despite the warning.

For a complete development environment setup with Nix and Home Manager, check out my [home-manager configuration](https://github.com/sadjow/home-manager)—it includes this Claude Code package and many other development tools properly packaged.

## A Note on AI Collaboration

This article—and the flake—were created with AI assistance to draft, review, and polish text. The problems are real, the solution works, and the implementation reflects years of Nix + dev tooling experience.

## References

- [Nix](https://nixos.org/) – Purely functional package manager
- [Home Manager](https://github.com/nix-community/home-manager) – Manage user environments with Nix
- [Cachix](https://cachix.org/) – Binary cache hosting for Nix
- [Claude Code](https://claude.ai/code) – The AI coding assistant this package wraps

---

*The claude-code-nix package lives at [github.com/sadjow/claude-code-nix](https://github.com/sadjow/claude-code-nix). Packaging is MIT-licensed (the tool itself follows its own license). Contributions welcome—especially improvements to the updater, tests, and platform support.*