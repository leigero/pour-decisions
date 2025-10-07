# Tonic Design System

Tonic is a lightweight SCSS design system that centralizes Pour Decisions’ visual language. It bundles design tokens, foundational styles, and reusable component patterns that any app in this repo can consume.

## Structure

```
libs/tonic
├── README.md
├── tonic.scss          # Primary entry point – @use this file from consuming stylesheets
├── _tokens.scss        # Design tokens (color, spacing, typography, elevation, motion)
├── _mixins.scss        # Helper mixins for focus states, surfaces, transitions, etc.
├── _reset.scss         # Modern reset tailored for Pour Decisions
├── _fonts.scss         # Font stacks, type scale, selection styling
├── _animations.scss    # Shared keyframes and animation utilities
├── _layout.scss        # Layout primitives (stack, cluster, container)
├── _buttons.scss       # Button variants and states
├── _inputs.scss        # Inputs, textareas, selects, validation states
├── _checkboxes.scss    # Checkbox and radio styling
├── _dialogs.scss       # Native <dialog> styling
├── _panels.scss        # Card/panel surfaces
└── _utilities.scss     # Small helper classes (spacing, radius, text helpers)
```

## Usage

1. Install [`sass`](https://sass-lang.com/dart-sass) if you build SCSS locally (`npm install -D sass`).
2. Import the entry point in your stylesheet:

   ```scss
   @use '../../../libs/tonic/tonic' as tonic;
   ```

3. Consume tokens or mixins forwarded through `tonic`:

   ```scss
   @use '../../../libs/tonic/tonic' as tonic;

   .cta {
     padding-inline: tonic.space('200');
     color: tonic.color('neutral', '050');
     background: tonic.color('brand', '300');
     @include tonic.focus-ring();
   }
   ```

## Extending Tokens

- Colors live in `_tokens.scss`. Add new palettes or extend existing ones (`$tonic-colors`) as maps keyed by numeric steps (`100`, `200`, etc.).
- Spacing tokens follow the `$space-###` scale. Stick to quarter-rem increments for consistency.
- Elevation, radii, timing, and easing tokens include helper functions (`shadow()`, `radius()`, `duration()`, etc.) so component code can stay declarative.

## Docs App

`apps/tonic-docs` is a static reference site that imports the design system and showcases tokens and components in isolation. Use `npm run docs:build` (or `npm run docs:watch`) to regenerate its compiled CSS before opening the HTML pages in a browser.
