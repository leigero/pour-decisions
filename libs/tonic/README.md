# Tonic Design System

Tonic is a lightweight SCSS design system that centralizes Pour Decisions’ visual language. It bundles design tokens, foundational styles, and reusable component patterns that any Angular app in this repo can consume.

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
└── _utilities.scss     # Helper classes (spacing, radius, text utilities)
```

## Usage

1. Install [`sass`](https://sass-lang.com/dart-sass) if you compile SCSS manually (`npm install -D sass`).
2. Import the entry point wherever you need shared styles:

   ```scss
   @use '../../../libs/tonic/tonic' as tonic;
   ```

3. Consume tokens or mixins that `tonic.scss` forwards:

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

- Colors live in `_tokens.scss`. Add new palettes or extend existing ones by updating the `$tonic-colors` map with numeric steps (`100`, `200`, etc.).
- Spacing tokens follow the `$space-###` scale. Stick to quarter-rem increments for consistency.
- Elevation, radii, timing, and easing tokens have helper functions (`shadow()`, `radius()`, `duration()`, etc.) so components stay declarative.

## Docs App

`apps/tonic-docs` is an Angular playground that imports this design system and showcases tokens, foundations, and reusable components. Use `npm run start:docs` for local development or `npm run docs:build` to generate a production bundle before sharing.
