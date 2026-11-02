# DSH Branding maintenance

- This is the independent `@yogurtss/dsh-branding` plugin, not TeamFlow.
- Work on `dev` or a task branch based on it. Do not change another repository.
- Verify exact Harness contracts before extending compatibility beyond 0.2.1-rc.2.
- Preserve native slot ownership, original branding fallbacks, atomic settings writes, and unload cleanup.
- Run `pnpm verify` after changes. Commit matching `lib/` artifacts with source.
- Stage only source, tests, documentation and required artifacts. Never commit profiles, credentials, node_modules or test output.
- Remote: `origin`, `https://github.com/yogurtss/dsh-branding.git`. Do not force-push.
