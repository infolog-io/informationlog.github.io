---
name: site-audit
description: Audit and verify a marketing site or product website before and after changes. Use for website copy, claims, metadata, SEO/AEO, HTML/CSS/JavaScript, responsive layout, accessibility, interaction polish, source-of-truth cleanup, or deployment readiness. Also use before publishing a site change and after deployment to confirm the public result.
---

# Site audit

Treat a site change as a claim, interface, and release change at the same time. Preserve the site's established visual system while checking every surface affected by the edit.

## Required inputs

1. Find the production source directory and public canonical URL. Do not assume the repository root is the deployed site.
2. Read the nearest `AGENTS.md` and any project-specific audit profile it names.
3. Inventory all indexable HTML pages, metadata files, robots directives, sitemap entries, and retained preview routes.
4. Separate verified facts from judgments, assumptions, and missing evidence before rewriting copy.

If the production source or deployment target cannot be established with read-only checks, stop before publishing.

## Audit loop

### 1. Establish a baseline

Run the bundled static audit before editing:

```bash
python3 scripts/audit_site.py <site-directory> [--profile <profile.json>]
```

Record failures that the requested change should fix. Do not repair unrelated findings without authorization.

### 2. Inspect copy and claims

- Use the organization voice required by the project profile. Scan metadata, visible copy, structured data, comments, alternate routes, and internal source-of-truth documents; stale language returns through those paths.
- Name the real category, product, and work. Prefer exact nouns and plain verbs over broad benefit language.
- Trace every number, client, employer, patent, result, or research claim to a source. If the source narrows the population, method, date, or outcome, keep that scope in the public wording.
- Treat preliminary or directional research as preliminary or directional. Keep a visible source note for a prominent statistic.
- Remove generic AI rhetoric, negative parallelisms, padded significance, mechanical triads, self-summary, and unearned certainty. Deleting a weak sentence is better than replacing it with another slogan.
- Keep metadata and visible copy aligned. Search engines may generate snippets from either.

### 3. Inspect interface details

- Preserve deliberate structural dividers. Replace borders only when they are pretending to create elevation.
- Apply font smoothing once at the root.
- Use balanced wrapping on short headings and pretty wrapping on short-to-medium body text.
- Use tabular numerals for changing values.
- Never use `transition: all` or `will-change: all`.
- Use interruptible transitions for hover, focus, press, and other reversible states.
- Make press feedback subtle: `scale(0.96)` when scaling is appropriate.
- Give touch controls a 44×44px target. Extend small inline controls with a non-overlapping pseudo-element when visual size must remain unchanged.
- Keep reduced-motion behavior complete. Motion must not be required to understand content or state.

### 4. Verify the implementation

Read [references/checklist.md](references/checklist.md) and complete the applicable checks.

At minimum:

1. Run `scripts/audit_site.py` again. Use `--strict` only when the project profile declares every warning release-blocking.
2. Validate HTML with an HTML5-aware validator.
3. Parse or syntax-check edited JavaScript and structured data.
4. Render the production route at one desktop and one mobile viewport.
5. Check the first viewport, the edited section, and the final call to action visually.
6. Check horizontal overflow, console errors, focus visibility, touch targets, and reduced motion.
7. Re-run project-specific forbidden-language scans across the whole scoped repository.

Loop until the change passes or a real blocker remains.

## Deployment gate

Before publishing:

- Confirm the exact files to deploy and preserve unrelated work.
- Confirm canonical, title, description, social metadata, robots directives, sitemap, and structured data agree with the deployed route.
- Never publish previews, templates, or internal variants as canonical pages unless the user explicitly chooses them.
- Use the repository's publishing workflow. Do not invent a new host or deployment path.
- Do not merge or enable auto-merge without the repository's required merge assessment and human review.

After publishing, fetch the public URL and verify the public title, primary heading, canonical, key claim, robots response, important assets, and absence of stale copy. A local pass is not proof of deployment.

## Report

Lead with the result. List material changes in a compact Before/After table, name the verification performed, link the edited files, and state whether the site was published. Report claim limitations plainly; do not bury them in a footnote.

## Resources

- `scripts/audit_site.py`: deterministic static preflight with optional project profile.
- `references/checklist.md`: detailed audit and release checklist.
