#!/usr/bin/env python3
"""Static website preflight with optional project-specific assertions."""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
from dataclasses import dataclass, asdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


TEXT_SUFFIXES = {".html", ".css", ".js", ".json", ".md", ".txt", ".xml"}
SKIP_PARTS = {".git", "node_modules", "vendor"}
SLOP_PATTERNS = {
    "em dash": r"—",
    "negative parallelism": r"\b(?:not just|not only)\b",
    "didactic disclaimer": r"\b(?:important to note|worth noting)\b",
    "inflated vocabulary": r"\b(?:delve|tapestry|testament|game[- ]changer)\b",
    "mechanical summary": r"\b(?:in summary|overall,)\b",
    "model-house hook": r"\b(?:the real question is|here(?:'|’)s the thing)\b",
}


@dataclass(order=True)
class Finding:
    severity: str
    file: str
    line: int
    check: str
    message: str


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.in_title = False
        self.h1_count = 0
        self.meta: dict[str, str] = {}
        self.canonical: list[str] = []
        self.json_ld: list[tuple[int, str]] = []
        self._json_line = 0
        self._json_parts: list[str] | None = None
        self.local_refs: list[tuple[int, str]] = []
        self.visible_parts: list[str] = []
        self.images_without_alt: list[int] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta":
            key = values.get("name") or values.get("property")
            if key:
                self.meta[key.lower()] = values.get("content", "")
        elif tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical.append(values.get("href", ""))
        elif tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self._json_line = self.getpos()[0]
            self._json_parts = []
        elif tag == "img" and "alt" not in values:
            self.images_without_alt.append(self.getpos()[0])

        ref = values.get("src") if tag in {"script", "img", "source"} else values.get("href")
        if ref and not ref.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
            parsed = urlparse(ref)
            if not parsed.scheme and not parsed.netloc and not ref.startswith("//"):
                self.local_refs.append((self.getpos()[0], parsed.path))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self._json_parts is not None:
            self.json_ld.append((self._json_line, "".join(self._json_parts)))
            self._json_parts = None

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self._json_parts is not None:
            self._json_parts.append(data)
        else:
            stripped = data.strip()
            if stripped:
                self.visible_parts.append(stripped)


def read_profile(path: Path | None) -> dict:
    if not path:
        return {}
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def source_files(root: Path, profile: dict) -> list[Path]:
    include_patterns = profile.get("include_paths", [])
    exclude_patterns = profile.get("exclude_paths", [])

    def included(path: Path) -> bool:
        rel = path.relative_to(root).as_posix()
        if include_patterns and not any(fnmatch.fnmatch(rel, pattern) for pattern in include_patterns):
            return False
        return not any(fnmatch.fnmatch(rel, pattern) for pattern in exclude_patterns)

    return sorted(
        path for path in root.rglob("*")
        if path.is_file()
        and path.suffix.lower() in TEXT_SUFFIXES
        and not any(part in SKIP_PARTS for part in path.parts)
        and included(path)
    )


def line_for(text: str, start: int) -> int:
    return text.count("\n", 0, start) + 1


def add_pattern_findings(findings: list[Finding], rel: str, text: str, profile: dict) -> None:
    for label, pattern in SLOP_PATTERNS.items():
        for match in re.finditer(pattern, text, re.IGNORECASE):
            findings.append(Finding("warning", rel, line_for(text, match.start()), "copy", f"Possible {label}: {match.group(0)!r}"))

    for item in profile.get("forbidden_patterns", []):
        pattern = item["pattern"] if isinstance(item, dict) else item
        message = item.get("message", f"Forbidden pattern: {pattern}") if isinstance(item, dict) else f"Forbidden pattern: {pattern}"
        for match in re.finditer(pattern, text, re.IGNORECASE):
            findings.append(Finding("error", rel, line_for(text, match.start()), "profile", message))


def audit_html(path: Path, root: Path, profile: dict, findings: list[Finding]) -> None:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    try:
        parser.feed(text)
    except Exception as exc:
        findings.append(Finding("error", rel, 1, "html", f"HTML parser failed: {exc}"))
        return

    title = " ".join("".join(parser.title_parts).split())
    if not title:
        findings.append(Finding("error", rel, 1, "metadata", "Missing or empty title"))
    if parser.h1_count != 1:
        findings.append(Finding("error", rel, 1, "semantics", f"Expected one H1, found {parser.h1_count}"))
    if not parser.meta.get("description"):
        findings.append(Finding("warning", rel, 1, "metadata", "Missing meta description"))
    if not parser.meta.get("viewport"):
        findings.append(Finding("warning", rel, 1, "metadata", "Missing viewport meta tag"))
    if profile.get("require_canonical") and len(parser.canonical) != 1:
        findings.append(Finding("error", rel, 1, "metadata", f"Expected one canonical link, found {len(parser.canonical)}"))

    expected_canonical = profile.get("canonical_url")
    primary_page = profile.get("primary_page", "index.html")
    if expected_canonical and rel == primary_page and parser.canonical != [expected_canonical]:
        findings.append(Finding("error", rel, 1, "metadata", f"Canonical must be {expected_canonical}"))

    for line, payload in parser.json_ld:
        try:
            json.loads(payload)
        except json.JSONDecodeError as exc:
            findings.append(Finding("error", rel, line, "structured-data", f"Invalid JSON-LD: {exc.msg}"))

    for line in parser.images_without_alt:
        findings.append(Finding("error", rel, line, "accessibility", "Image is missing alt text"))

    for line, ref in parser.local_refs:
        if not ref or "{" in ref or "<" in ref:
            continue
        target = (path.parent / ref).resolve()
        if not target.exists():
            findings.append(Finding("error", rel, line, "asset", f"Missing local asset: {ref}"))

    visible = " ".join(parser.visible_parts)
    if profile.get("forbid_first_person_singular") and re.search(r"\b(?:I|I'm|I am|my|me)\b", visible, re.IGNORECASE):
        findings.append(Finding("error", rel, 1, "voice", "First-person singular language is forbidden by the project profile"))

    if rel == primary_page:
        for phrase in profile.get("required_phrases", []):
            if phrase.casefold() not in visible.casefold():
                findings.append(Finding("error", rel, 1, "profile", f"Missing required phrase: {phrase}"))
        for url in profile.get("required_urls", []):
            if url not in text:
                findings.append(Finding("error", rel, 1, "profile", f"Missing required URL: {url}"))


def audit_css(path: Path, root: Path, findings: list[Finding]) -> None:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8")
    checks = {
        "transition-all": r"transition\s*:\s*all\b",
        "will-change-all": r"will-change\s*:\s*all\b",
    }
    for label, pattern in checks.items():
        for match in re.finditer(pattern, text, re.IGNORECASE):
            findings.append(Finding("error", rel, line_for(text, match.start()), "motion", f"Forbidden CSS: {label}"))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site_directory", type=Path)
    parser.add_argument("--profile", type=Path)
    parser.add_argument("--strict", action="store_true", help="Treat warnings as failures")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable findings")
    args = parser.parse_args()

    root = args.site_directory.resolve()
    if not root.is_dir():
        parser.error(f"site directory does not exist: {root}")
    profile = read_profile(args.profile.resolve() if args.profile else None)
    findings: list[Finding] = []

    for path in source_files(root, profile):
        text = path.read_text(encoding="utf-8", errors="replace")
        rel = path.relative_to(root).as_posix()
        add_pattern_findings(findings, rel, text, profile)
        if path.suffix.lower() == ".html":
            audit_html(path, root, profile, findings)
        elif path.suffix.lower() == ".css":
            audit_css(path, root, findings)

    findings.sort(key=lambda item: (item.file, item.line, item.severity, item.check))
    if args.json:
        print(json.dumps({"root": str(root), "findings": [asdict(item) for item in findings]}, indent=2))
    else:
        for item in findings:
            print(f"{item.severity.upper():7} {item.file}:{item.line} [{item.check}] {item.message}")
        errors = sum(item.severity == "error" for item in findings)
        warnings = sum(item.severity == "warning" for item in findings)
        print(f"\n{errors} error(s), {warnings} warning(s)")

    has_errors = any(item.severity == "error" for item in findings)
    has_warnings = any(item.severity == "warning" for item in findings)
    return 1 if has_errors or (args.strict and has_warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
