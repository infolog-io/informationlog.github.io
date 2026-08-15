# Site audit checklist

Use the sections affected by the request. Claim, metadata, and deployment checks are mandatory whenever public copy changes.

## Source and scope

- Identify the production directory, canonical host, publishing branch, and deploy mechanism.
- Inventory HTML routes and determine which are indexable, noindexed, redirected, or internal.
- Find duplicate titles, descriptions, headings, or alternate positioning.
- Read project truth documents before changing claims or category language.
- Preserve unrelated files and user changes.

## Copy and claims

- The first viewport names what the organization does.
- Service headings use terms a buyer could search for.
- The page answers what the service is, when to use it, what is delivered, and how the work happens.
- Organization voice is consistent across visible copy, metadata, JSON-LD, alt text, comments, previews, and internal guidance.
- Forbidden staffing, identity, or legacy positioning is absent across the scoped repository.
- Every number and named proof item has a reachable source.
- Research claims preserve population, method, outcome, date, and uncertainty from the source.
- No sentence uses a source to support a broader claim than the source makes.
- Headings use sentence case unless the brand system explicitly requires otherwise.
- Copy avoids AI filler: inflated significance, promotional adjectives, negative parallelisms, mechanical triads, fake casualness, self-summary, and generic transformation claims.

## SEO and answer engines

- Each indexable page has one descriptive title, one useful meta description, one H1, a canonical URL, and appropriate robots directives.
- Open Graph and social metadata agree with the visible page.
- Social images exist, use absolute public URLs, and have accurate alt text.
- Structured data parses and describes visible facts only.
- Organization names, legal names, URLs, and identity links are consistent.
- `robots.txt` is reachable and advertises the sitemap.
- The sitemap contains every intended canonical page and excludes internal variants.
- Direct answers are visible HTML, not canvas-only, image-only, or client-rendered text.
- Internal authority pages are linked from a real navigation or editorial surface.

## Interface quality

- Root font smoothing is present.
- Short headings balance; body copy avoids orphans.
- Dynamic numbers use tabular numerals.
- Touch targets are 44×44px where possible and never overlap.
- Focus indicators are visible against every background.
- Interactive state changes use specific, interruptible transitions.
- No `transition: all` or `will-change: all` exists.
- Press scaling never drops below 0.95; use 0.96 by default.
- Decorative motion stops or simplifies for reduced-motion users.
- Images have accurate alt text and, when needed for edge definition, a neutral inset outline.
- Structural hairlines remain structural; elevation uses transparent shadows only when elevation exists.

## Rendered verification

- Desktop and mobile layouts have no horizontal overflow.
- The first viewport communicates category, offer, and primary action without collision.
- Long headings wrap intentionally at both breakpoints.
- Sticky headers do not cover anchored content.
- The final call to action and its source notes remain readable on mobile.
- Console logs contain no errors or repeated warnings.
- Keyboard order follows visual order.
- The page remains understandable with JavaScript unavailable.
- Reduced motion preserves content, focus, and selection state.

## Release and public verification

- Only intended files are committed.
- Generated, temporary, and local-only files are excluded.
- The commit message describes the public change.
- The public URL returns `200` after deployment.
- Canonical redirects terminate at the intended host.
- Public HTML contains the new title, H1, and approved claim.
- Public HTML does not contain deprecated copy or internal version labels.
- Public assets and source citations return successful responses.
- Record the deployed revision and public verification result.
