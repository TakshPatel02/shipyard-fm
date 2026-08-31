# Contributing to Shipyard

Shipyard is a personal project I built and open-sourced so other people could use it, fork it, or improve it. It's not heavily managed, but contributions are genuinely welcome — especially bug fixes and small, focused improvements.

## Before you start

- For small fixes (bugs, typos, small UX issues) — just open a PR directly, no need to ask first.
- For bigger changes (new features, architecture changes, anything that touches a lot of files) — open an issue first so we can talk it through before you put in the work. Saves both of us time if the direction needs adjusting.
- If an issue already exists and you want to work on it, just comment on it so we don't duplicate effort.

## Getting started

1. Fork the repo and clone your fork.
2. Install dependencies:
```bash
   npm install
```
3. Run the dev server:
```bash
   npm run dev
```
4. Create a branch for your change:
```bash
   git checkout -b fix/short-description
```

## Making a PR

- Keep PRs focused — one fix or one feature per PR, not a bundle of unrelated changes.
- Write a clear PR description: what the problem was, what you changed, and why. If it fixes an issue, link it (`Fixes #1`).
- Test your change locally before opening the PR — make sure it actually works, not just that it compiles.
- Match the existing code style. No strict linting rules enforced yet, just try to stay consistent with what's already there.

## Commit messages

Not strictly enforced, but appreciated:
- `fix:` for bug fixes
- `feat:` for new features
- `refactor:` for code changes that don't change behavior
- `docs:` for documentation-only changes

## Reporting bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Any relevant file/code context if you've already dug into it

(Honestly, if every bug report looked like the ones I've gotten so far — clear repro steps, root cause, proposed fix — that'd be great. Not a requirement, just appreciated.)

## Questions

If something's unclear, open an issue or start a discussion. No question is too small.

---

Thanks for taking the time to contribute — this started as a personal project and it means a lot that people want to make it better.