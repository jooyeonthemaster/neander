# Program typefaces

These Korean typefaces are self-hosted for the service demos. Sources are the
official Google Fonts repository. Each font's SIL Open Font License is included
alongside the WOFF2 files; original URLs, weights, and sizes are in `manifest.json`.

The original fonts were losslessly compressed to WOFF2 with fontTools/Brotli.
Glyphs were not subset or redrawn. Hahmlet retains its variable weight axis.
`src/components/demo/program-fonts.css` registers the families with `font-display:
swap`; the browser fetches only faces used by the active program and caches them.

Existing Pretendard is registered separately by the application.
