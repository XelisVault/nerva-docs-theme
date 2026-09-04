# NERVA MkDocs Theme

A Bootstrap 4 theme for [MkDocs](https://www.mkdocs.org/), maintained for
[docs.nerva.one](https://docs.nerva.one). Some customisations and fixes on
top of [byrnereese/mkdocs-bootstrap4](https://github.com/byrnereese/mkdocs-bootstrap4)
(unmaintained upstream).

## What the theme is made of

- **Bootstrap 4.6.2 CSS** for the layout, navbar, modals and typography.
- **No jQuery, no Popper, no Bootstrap JavaScript.** `js/base.js` is plain
  DOM code that drives the same class contract the Bootstrap bundle used
  (`.show`, `.modal-backdrop`, `body.modal-open`, `[data-toggle=...]`), so
  the CSS and any downstream overrides keep working unchanged.
- **No icon font.** The handful of icons (moon/sun, search, arrows, brand
  marks) are inline SVG from [Bootstrap Icons](https://icons.getbootstrap.com/)
  (MIT) and [Simple Icons](https://simpleicons.org/) (CC0).
- **highlight.js 11, self-hosted** (`js/highlight.min.js` plus the
  grammars in `js/languages/`), loaded with `defer`. A scoped dark palette
  in `css/hljs-dark.css` keeps highlighted code readable in dark mode.
- **Dark mode** with no flash of the wrong theme: a small inline script
  decides before first paint from the stored choice (`localStorage`,
  key `nerva-docs-theme`) or the system preference, and the navbar toggle
  writes the stored choice. While no choice is stored the page follows the
  system, and once one is the choice wins for the session.
- **Works with mkdocs 1.4 and up.** The templates only read theme options
  through attribute access with defaults, which resolves on the plain
  `Theme` of mkdocs 1.4 as well as on the Mapping-based one of 1.5+.

## Installation

Copy the `mkdocs_bootstrap4` folder next to your documentation and point
`mkdocs.yml` at it:

    theme:
        name: null
        custom_dir: 'nerva-docs-theme/mkdocs_bootstrap4/'
        suppress_nextprev: true

For a docs checkout that expects the theme as a sibling directory, clone
this repository next to it under `nerva-docs-theme/`.

The package is also pip-installable (entry point `bootstrap4`), but it is
**not published to PyPI**: the distribution is named `mkdocs-nerva`, not
the upstream `mkdocs-bootstrap4` it forks, and it is marked
`Private :: Do Not Upload`. Install it from a checkout when needed.

## Config parameters

* `suppress_nextprev` — toggles the "Next"/"Prev" page links in the header
  (default `true`: hidden, matching the theme's `mkdocs_theme.yml`).
* `highlightjs` — enable code highlighting (self-hosted build).
* `hljs_style` — highlight.js style to load from `css/hljs-<style>.min.css`
  (`github` ships with the theme; drop other styles next to it as needed).
* `hljs_languages` — extra grammars to load from `js/languages/`.
* `shortcuts` — key codes for the keyboard shortcuts (`?`, `n`, `p`, `s`).

## Keyboard shortcuts

The theme binds `?` (shortcuts help), `/` (search — the key `s` works as
well), `n` (next page) and `p` (previous page). They are ignored while
typing in a field.

## Special features

This theme makes use of the
[git-committers plugin](https://github.com/byrnereese/mkdocs-git-committers-plugin)
for MkDocs. Consult that plugin's documentation for proper configuration.
Favicon path: `docs/img/favicon.ico`, navbar logo path: `docs/img/logo.ico`.

## Browser support

Any browser with `defer`, `querySelector`, `closest`, class lists and
`matchMedia` — in practice everything from 2017 onward. The search
worker path uses standard Web Workers; on browsers without Worker
support (vanishingly rare), search falls back to a jQuery call the theme
no longer ships, so search is unavailable there while reading is not.
