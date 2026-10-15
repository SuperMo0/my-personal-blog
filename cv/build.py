"""Build the one-page CV from cv/content.json.

    python3 cv/build.py
    chromium --headless --no-pdf-header-footer \
        --print-to-pdf=frontend/public/Mwafak-Almahaini-CV.pdf cv/cv.html

Uses Carlito, which has Calibri's metrics, so lines wrap the same everywhere.
"""

import html
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent

CSS = """
@page { size: 8.5in 11in; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 612pt; }
body {
  font-family: Carlito, Calibri, sans-serif; font-size: 10pt; line-height: 1.16;
  color: #222; padding: 20pt 25.3pt 0; -webkit-print-color-adjust: exact;
}
a { color: inherit; }
header { text-align: center; }
.name { font-size: 17pt; font-weight: 700; color: #1f3864; }
.title { font-weight: 700; margin-top: 1.9pt; }
.contact { color: #555; margin-top: 3pt; }
.contact a { text-decoration: underline; }
h2 {
  font-size: 11pt; font-weight: 700; color: #1f3864; margin-top: 5.5pt;
  border-bottom: 0.75pt solid #bfbfbf; padding-bottom: 1pt; margin-bottom: 3.7pt;
}
.row { display: flex; justify-content: space-between; align-items: baseline; padding-right: 22.4pt; }
.row + .row { margin-top: 1.5pt; }
.date { font-style: italic; font-size: 9.5pt; color: #555; white-space: nowrap; padding-left: 12pt; }
.entry { margin-top: 1pt; }
.entry:first-of-type { margin-top: 0; }
.head { font-weight: 700; }
.head .stack { font-weight: 400; }
ul { list-style: none; }
li { position: relative; padding-left: 36pt; margin-top: 1pt; }
li::before { content: "\\25CF"; position: absolute; left: 18pt; top: 0.2pt; font-size: 7pt; line-height: 1.74; }
.plain-list li { padding-left: 36pt; }
.skills p + p { margin-top: 1pt; }
.skills b { font-weight: 700; }
"""


def esc(text):
    return html.escape(text, quote=True)


def bullets(items, cls=""):
    lis = "".join(f"<li>{esc(i)}</li>" for i in items)
    return f'<ul class="{cls}">{lis}</ul>'


def build(content):
    c = content
    links = " &bull; ".join(f'<a href="{esc(l["href"])}">{esc(l["label"])}</a>' for l in c["links"])
    parts = [
        "<header>",
        f'<div class="name">{esc(c["name"])}</div>',
        f'<div class="title">{esc(c["title"])}</div>',
        f'<div class="contact">{esc(c["contact"])}</div>',
        f'<div class="contact" style="margin-top:0">{links}</div>',
        "</header>",
        "<h2>EDUCATION</h2>",
    ]
    for e in c["education"]:
        parts.append(f'<div class="row"><span>{esc(e["what"])}</span><span class="date">{esc(e["when"])}</span></div>')

    parts.append("<h2>EXPERIENCE</h2>")
    for job in c["experience"]:
        parts.append('<div class="entry">')
        parts.append(f'<div class="row"><span class="head">{esc(job["role"])}</span><span class="date">{esc(job["when"])}</span></div>')
        parts.append(bullets(job["bullets"]))
        parts.append("</div>")

    parts.append("<h2>PROJECTS</h2>")
    for p in c["projects"]:
        stack = f'<span class="stack"> &mdash; {esc(p["stack"])}</span>' if p.get("stack") else ""
        parts.append(f'<div class="entry"><div class="head">{esc(p["name"])}{stack}</div>{bullets(p["bullets"])}</div>')

    for section in ("achievements", "certifications"):
        parts.append(f"<h2>{section.upper()}</h2>")
        parts.append(bullets(c[section], "plain-list"))

    parts.append('<h2>SKILLS</h2><div class="skills">')
    for label, value in c["skills"]:
        parts.append(f"<p><b>{esc(label)}:</b> {esc(value)}</p>")
    parts.append("</div>")

    parts.append("<h2>LANGUAGES</h2>")
    parts.append(f'<p>{c["languages"]}</p>')

    body = "\n".join(parts)
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{esc(c["name"].title())} CV</title>
<style>{CSS}</style></head><body>
{body}
</body></html>
"""


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "content.json"
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / "cv.html"
    out.write_text(build(json.loads(src.read_text())))
    print(f"wrote {out}")
