# Tonic Docs Playground

This lightweight docs site showcases the Tonic design system in isolation. It renders core HTML primitives (typography, buttons, forms, layout, dialogs, utilities) using the shared SCSS that lives in `libs/tonic`.

## Getting Started

```bash
npm install
npm run docs:build
# or watch changes
npm run docs:watch
```

The build step compiles `styles/docs.scss`, which pulls in the design system and adds a thin docs layout layer. After building, open any of the HTML files in this directory (`index.html`, `components.html`, `forms.html`) directly in the browser or serve the folder with your preferred static server.

## Structure

```
apps/tonic-docs
├── README.md
├── index.html         # Foundations (colors, typography, layout)
├── components.html    # Buttons, panels, dialogs
├── forms.html         # Inputs, selects, checkboxes, form layout
└── styles
    ├── docs.scss      # Doc-specific styles (imports the design system)
    └── docs.css       # Compiled output (created by docs:build/docs:watch)
```

## Editing Tips

- Update design tokens and component styles in `libs/tonic`. The docs site automatically picks up changes after recompiling.
- Keep additional doc-only tweaks in `styles/docs.scss` to avoid leaking showcase-specific overrides back into the design system.
- When adding new examples, stay within semantic HTML so the page can double as accessibility reference material.
