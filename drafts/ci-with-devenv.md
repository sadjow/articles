# Testing Devenv in CI: When Perfect Reproducibility Meets Reality

I recently experimented with using devenv for CI in a Phoenix project, and the experience raised some interesting questions about when to use devenv versus traditional CI services.

## The Experiment

I started with the ideal: running everything inside devenv to achieve perfect environment parity between development and CI. The initial results were promising—all dependencies were managed by devenv, which was interesting to see in action.

```yaml
- name: Install devenv
  run: nix profile install nixpkgs#devenv
  
- name: Run tests
  run: devenv test
```

## Where Things Got Tricky

Everything worked fine until I needed to start services like PostgreSQL in the background. That's when the GitHub Actions started failing. The issue wasn't with devenv itself, but with managing background services in a CI environment.

In devenv, PostgreSQL is configured as a service that needs to be initiated:

```nix
services.postgres = {
  enable = true;
  package = pkgs.postgresql_17;
};
```

This works great locally where you run `devenv up` and services stay running. But in CI, managing these background processes becomes complex.

## The Question: Should We Really Use Devenv in CI?

This experience made me think: should we actually be using devenv for everything in CI?

Consider this: in production, we typically use:
- The same language versions (Elixir, Erlang) ✓
- The same application dependencies ✓
- But NOT the same PostgreSQL setup ✗

Production databases are usually:
- Managed services (AWS RDS, Google Cloud SQL, Azure Database)
- Different versions or configurations
- Accessed over network connections, not local sockets

## A Different Perspective

Maybe the goal shouldn't be making CI identical to local development. Instead, CI should test how our application behaves in conditions closer to production.

Using GitHub Actions' PostgreSQL service actually makes more sense:

```yaml
services:
  db:
    image: postgres:17
    env:
      POSTGRES_DB: app_test
```

This tests our application against an external database service, just like it will encounter in production.

## My Current Thinking

I'm now questioning whether we should:

1. **Use devenv for application dependencies** - Yes, this ensures version consistency
2. **Use devenv for services** - Maybe not, especially for databases
3. **Keep trying different approaches** - There might be other ways to handle this

## Open Questions

- Is perfect environment reproducibility worth the complexity?
- Should CI mirror local development or production?
- Are there better ways to handle background services in devenv CI?

## What I Learned

The experiment taught me that sometimes the "perfect" solution (complete environment reproducibility) might not be the most practical one. It's okay to use different tools for different purposes:

- Devenv for consistent development environments
- Traditional CI services for testing production-like scenarios

Maybe the answer isn't choosing one approach over the other, but understanding when each makes sense.

What do you think? Have you tried running devenv in CI? I'd love to hear about your experiences and whether you think it's worth pursuing further.