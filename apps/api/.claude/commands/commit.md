---
description: Analyzes the diff and commits using Conventional Commits format
allowed-tools: Bash
---

Follow these steps in order:

1. Run `git diff --cached` to see what is staged
2. If nothing is staged, run `git status` to check all modified files
3. **Split commits if necessary** — this is critical:
   - Analyze all unstaged/staged changes and group them by logical concern
   - If files belong to different features, fixes, or areas, stage and commit them **separately**
   - Never bundle unrelated changes into a single commit
   - For each group, repeat steps 4–6 below

4. Analyze each group of changes and determine:
   - Type: `feat` | `fix` | `refactor` | `chore` | `docs` | `test` | `style` | `perf`
   - Scope: the affected module/area (e.g. `auth`, `api`, `ui`)
   - Description: what changed, in English, using the imperative mood ("add", "fix", "update")

5. Write a commit body only if the change is complex and needs extra context

6. Execute the commit directly with `git commit`

7. After all commits are done, confirm each with its hash and message

Format:
<type>(<scope>): <description>

Valid examples:
feat(auth): add JWT refresh token rotation
fix(api): handle null response from payment gateway
refactor(ui): extract Button into shared component
