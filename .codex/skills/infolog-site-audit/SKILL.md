---
name: infolog-site-audit
description: Apply Information Logistics-specific copy, claims, visual, SEO/AEO, accessibility, and release checks to every infolog.io site change. Use whenever editing, reviewing, testing, or deploying Information Logistics website copy, metadata, HTML, CSS, JavaScript, assets, structured data, robots directives, sitemap entries, previews, or public pages.
---

# InfoLog site audit

Compose the reusable site audit with Information Logistics' verified facts and design constraints.

## Load the audit context

1. Read `../site-audit/SKILL.md` completely.
2. Read `references/infolog.md` completely.
3. Resolve the production source without substituting another preview because it looks newer:
   - In the Information Logistics design workspace, use `locomotive-preview-b-signal-chamber/`.
   - In the `infolog-io/informationlog.github.io` GitHub Pages checkout, use the repository root.
4. Run the generic preflight with the InfoLog profile before and after each change. Use the command matching the current checkout:

```bash
python3 .codex/skills/site-audit/scripts/audit_site.py \
  locomotive-preview-b-signal-chamber \
  --profile .codex/skills/infolog-site-audit/references/profile.json

# GitHub Pages checkout
python3 .codex/skills/site-audit/scripts/audit_site.py \
  . \
  --profile .codex/skills/infolog-site-audit/references/profile.json
```

## Make the change

- Write in the organization voice: use “we,” never first-person singular.
- Never describe staffing size or imply a larger staffed studio. Omit one-person, solo, principal-led, and equivalent claims because delivery quality is the relevant fact.
- Lead with agent-first software design and engineering. Explicitly name agent product design and building LLM agents.
- Preserve verified career and patent proof. Do not invent clients, outcomes, testimonials, or commercial metrics.
- Keep the 95% Generative-AI pilot claim at its approved scope and retain its visible MIT NANDA source note. Never shorten it to “95% of AI pilots fail.”
- For public copy, use the `unslop` skill when it is available. For interface changes, use `make-interfaces-feel-better` when it is available. These support the audit; they do not override the InfoLog facts or visual system.
- Preserve the visual invariants in `references/infolog.md` unless the user explicitly requests a redesign.

## Release gate

1. Complete the reusable skill's validation loop.
2. Re-run the profile audit and resolve every error. Review warnings in context; do not delete accurate sourced language just to reach zero warnings.
3. Deploy through the existing GitHub Pages repository and branch. Do not invent a second hosting path.
4. Verify `https://www.infolog.io/` after deployment. Confirm the title, H1, canonical, agent-first positioning, sourced 95% claim, patents, robots file, sitemap, assets, responsive layout, and absence of forbidden staffing or internal-version language.

Do not report the change as live until the public URL contains the deployed revision.
