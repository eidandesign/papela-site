# /checkpoint

Build, commit, and push the current changes to production.

## Steps

1. Run `npx next build` to verify there are no build errors. If the build fails, stop and report the errors — do NOT commit.
2. Run `git status` and `git diff` to review what's changed.
3. Draft a concise commit message (1–2 sentences) that describes what changed and why.
4. Stage all modified tracked files (be explicit — avoid `git add -A` if there are untracked files that shouldn't go in).
5. Commit with the message.
6. Push to `origin main`.
7. Confirm the push succeeded and remind the user that Vercel will auto-deploy.

## Rules

- Never skip the build step.
- Never force-push.
- Never use `--no-verify`.
- If there are untracked files that look sensitive (`.env`, credentials), warn the user and exclude them.
- Always append `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` to the commit message.
