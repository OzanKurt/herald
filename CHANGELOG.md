# Changelog

## 1.2.0

- TypeScript declarations (`dist/herald.d.ts`).
- The polished theme falls back to hex colours and flat icon backgrounds in browsers without `oklch()` or `color-mix()`.

## 1.1.0

- `Herald.alert()` accepts `type`, `color` and `icon`, like toasts and panels: a typed alert shows the type's icon beside the title and uses its colour. Alerts without them look as before.

## 1.0.0

- Initial release: toasts, parked panels and modal alerts, a `default` theme in the classic SmartAdmin look and a `polished` theme with light and dark schemes, plus a jQuery build that provides `$.smallBox`, `$.bigBox` and `$.SmartMessageBox`.
