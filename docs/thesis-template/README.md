# Thesis LaTeX Template

Overleaf template for the dissertation, formatted to the APU Thesis/Dissertation
Handbook v2.0.

**Do not copy these files out of a chat window.** LaTeX is full of commands that
begin with `\n`, `\t`, `\r`, `\b`, `\f`, `\v` and `\a`, and any transfer that
interprets backslash escapes silently corrupts them — `\normalfont` becomes a
newline followed by `ormalfont`. Clone or sync the repository instead.

## Files

```
main.tex          preamble, front matter, appendices
references.bib    bibliography (export from Zotero/Mendeley into this)
chapters/
  ch1-introduction.tex
  ch2-literature-review.tex
  ch3-methodology.tex
  ch4-results-discussion.tex
  ch5-conclusion.tex
```

## Setting it up in Overleaf

### Option A — upload a ZIP (free, recommended)

Overleaf's GitHub sync requires a paid plan, but uploading a ZIP does not — and
a ZIP transfers the bytes exactly, so nothing can be corrupted on the way.

From the repository root, after pulling:

```powershell
Compress-Archive -Path docs/thesis-template/* -DestinationPath thesis-template.zip
```

Then in Overleaf: **New Project → Upload Project** and select the ZIP.

Using `/*` zips the *contents* rather than the folder, so `main.tex` sits at the
archive root where Overleaf expects it, with `chapters/` preserved beneath it.

### Option B — copy from a local editor

Clipboard copying is only a hazard when the text passes through something that
interprets backslash escapes. Copying from a plain-text editor into Overleaf is
safe. Open the files locally and paste them in, recreating the `chapters/`
folder.

### Keeping the repository copy current

Without paid sync there is no automatic path back. Periodically use Overleaf's
**Menu → Download → Source** to get a ZIP, and commit its contents over
`docs/thesis-template/`. That keeps the dissertation under version control
alongside the code without a subscription.

### Required settings

| Setting | Value | Why |
|---------|-------|-----|
| Compiler | pdfLaTeX (or XeLaTeX) | XeLaTeX only if you switch to `fontspec` |
| **Bibliography** | **Biber** | `biblatex-apa` does not work with BibTeX |

Set both under **Menu** in the Overleaf editor. Compile **twice** — the table of
contents and the citations need a second pass to resolve.

## What the template already enforces

- Margins: left 3 cm, right 2 cm, top and bottom 2.5 cm
- Times-metric font at 12 pt, 1.5 line spacing
- Page numbers centred at the foot, on chapter pages too
- Roman numerals for the preliminaries, Arabic restarting at 1 for the body
- Chapters begin on a new page
- `CHAPTER N` centred, with the chapter title centred in capitals beneath it
- Section heading text begins 1.27 cm from the left margin
- Headings bold and not underlined, numbering capped at four levels
- Tables and figures numbered by chapter
- APA author–date citations, with a hanging-indented, double-spaced reference list

## What you must still check

LaTeX cannot enforce these.

- [ ] **Table captions go above** the table; **figure captions below** the figure.
      Place `\caption{}` before `\begin{tabular}` and after `\includegraphics`.
- [ ] Tables and figures appear **after** the point where they are first cited.
- [ ] Compile a test page and measure the margins against the Word template.
- [ ] Check a `2.10`-style heading — a two-digit second number may not fit the
      1.27 cm box. Widen it to `1.5cm` if the number collides with the text.
- [ ] Confirm the exact required wording of the three declarations.
- [ ] Confirm the confidentiality period. The handbook says "no more than two
      years" in one place and three in another — ask the supervisor which applies.
- [ ] Abstract: 300–500 words, a single paragraph, no citations. Written last.
- [ ] Total length 15,000–20,000 words.

## Compulsory sections

Both are required and are already stubbed as appendices:

- **Research Ethics Approval** — the approved form plus the research summary.
- **A research paper** — required if nothing has been published.

Also append the **supervisory logsheets**, consecutively dated and numbered.

## References

Use a reference manager and export into `references.bib`. Entering 15,000–20,000
words' worth of APA references by hand is a dependable way to lose marks under
criterion C10.

Two entries are already present. Note the date on the second: the System
Usability Scale was **developed** in 1986 but the citable publication is
**Brooke (1996)**. Citing 1986 is a common error.
