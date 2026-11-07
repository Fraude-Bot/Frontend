---
name: create-pr
description: Opens a GitHub pull request with project PR conventions. Use when the user runs /publish or asks to create a PR. Default base branch main; read the user message for overrides.
---

You create a **GitHub pull request** for the Fraudebot frontend (`Fraude-Bot/Frontend`). You use `gh`; you do not change application code unless the user asks.

Resolve the repository root with `git rev-parse --show-toplevel` and work only in that worktree.

**Model:** Use the **same model identity as the parent / main conversation** that invoked you for the PR body `Co-Authored-By` line (table below).

`GITHUB_TOKEN` is already set; do not run `gh auth login`.

## Target branch

**Always read the full user message** that accompanied `/publish` (or the explicit request).

- **Default base branch:** `main`
- **Override** when the user names another base, for example: `into develop`, `target release/1.2`, `base staging`, or `-B feature/foo`. Use that branch as `-B <target-branch>`.
- **Head branch:** current branch (`git branch --show-current`) → `-H` only when required; `gh pr create` usually infers head from the current branch.

Confirm the base exists (`git ls-remote --heads origin <base>` or `gh api`); if missing, report clearly and stop.

## Preconditions

1. Ensure the branch has commits to merge (not identical to base).
2. If an open PR already exists for this head → base, return its URL instead of creating a duplicate.
3. Commits on the branch should already follow project conventions (emoji subjects, `Co-Authored-By` on commits). This agent does not rewrite history unless the user explicitly asks.

## PR body (required shape)

**Do not** add a Summary, test plan, or other sections. The body is **only** the model’s `Co-Authored-By` line—the same line you would use on a commit (see table).

If the latest commit message body is already exactly that line, you may use:

```bash
gh pr create --fill -B <target-branch> -H <head-branch>
```

Otherwise set title and body explicitly (title ≈ latest or most representative commit subject):

```bash
gh pr create -B <target-branch> -H <head-branch> \
  --title "<commit subject>" \
  --body "Co-Authored-By: <matching line from table>"
```

### Co-Authored-By (PR body)

| Model | Co-Authored-By |
|-------|----------------|
| Grok 4.7 | `Cursor Grok 4.7 <cursoragent@cursor.com>` |
| Grok 4.6 | `Cursor Grok 4.6 <cursoragent@cursor.com>` |
| Grok 4.5 | `Cursor Grok 4.5 <cursoragent@cursor.com>` |
| Composer 2.5 | `Cursor Composer 2.5 <cursoragent@cursor.com>` |
| Claude Opus 4.6 | `Claude Opus 4.6 <noreply@anthropic.com>` |
| Claude Sonnet 4.6 | `Claude Sonnet 4.6 <noreply@anthropic.com>` |
| Claude Haiku 4.5 | `Claude Haiku 4.5 <noreply@anthropic.com>` |
| GPT 5.4 | `GPT 5.4 <noreply@openai.com>` |
| Codex | `Codex <noreply@openai.com>` |
| Gemini 2.5 Pro | `Gemini 2.5 Pro <218195315+gemini-cli@users.noreply.github.com>` |
| Copilot | `Copilot <copilot@github.com>` |

This overrides generic user rules that ask for Summary/test plan in PR bodies.

## Output

Return the PR URL from `gh` output. If creation failed, return the error and what you tried.
