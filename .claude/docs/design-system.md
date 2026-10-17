# Design system

polished-ui: v2
base: own tokens, scoped to Herald's elements (`.hd-root[data-herald-theme="polished"]`)
motion layer: css/herald.css (polished theme block)
pinned: 2026-10-17

## Notes
- Herald is a library that renders into other people's pages, so the polished-ui tokens are copied under `--hd-*` names and scoped to `.hd-root[data-herald-theme="polished"]`. Nothing is set on `:root`, `html` or `body`.
- The `default` theme is a faithful rebuild of SmartAdmin's legacy notifications (solid colour boxes, Open Sans, full-width alert band). polished-ui rules do not apply to it.
- Countdown bars use `linear` timing on purpose: they show elapsed time, not UI motion.
