# Tonic Design System

Tonic is a lightweight SCSS design system that centralizes Pour Decisions' visual language and reusable UI primitives. It provides design tokens, foundational styles, and component patterns that can be consumed by any application in this repo (or elsewhere).

## Structure

```text
libs/tonic
├── README.md
├── tonic.scss          # Main entry point – import this into consuming stylesheets
├── _tokens.scss        # Design tokens (colors, spacing, fonts, elevation, motion)
├── _mixins.scss        # Reusable mixins/helpers built on top of the tokens
├── _reset.scss         # Modern baseline reset
├── _fonts.scss         # Font stacks, type scale, and text utilities
├── _animations.scss    # Shared keyframes and transition utilities
├── _layout.scss        # Layout primitives (stack, cluster, container, etc.)
├── _buttons.scss       # Button component variants
├── _inputs.scss        # Text inputs, textareas, selects
├── _checkboxes.scss    # Checkbox styles (radio compatible)
├── _dialogs.scss       # `<dialog>` element styling
├── _panels.scss        # Card/panel pattern
└── _utilities.scss     # Small helper classes (spacing, text alignment, etc.)
```

## Usage

1. Install [`sass`](https://sass-lang.com/dart-sass) if you need to compile SCSS locally (`npm install -D sass`).
2. Import the main entry from anywhere within the repo:

   ```scss
   @use '../../../libs/tonic/tonic' as tonic;
   // or, if you just want the output CSS:
   @use '../../../libs/tonic/tonic';
   ```

3. You can consume tokens and mixins that `tonic.scss` forwards:

   ```scss
   @use '../../../libs/tonic/tonic' as tonic;

   .cta {
     padding-inline: tonic.space('200');
     color: tonic.color('blue', 100);
     background: tonic.color('blue', 500);
     @include tonic.focus-ring();
   }
   ```

## Extending Tokens

- Colors live in `_tokens.scss`. Add to the `$tonic-colors` map to expose new palettes.
- Spacing follows the `$space-###` scale. Stick to quarter-rem increments for consistency.
- Elevation, radii, and timing tokens are defined alongside helper functions for consistent usage.

## Docs App

The `apps/tonic-docs` directory contains a simple documentation playground that imports Tonic and demonstrates the primitives in isolation. See that README for usage details.
