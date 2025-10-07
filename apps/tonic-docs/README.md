# Tonic Docs (Angular)

This Angular application showcases the Tonic design system in isolation. Use it to verify foundational tokens, reusable UI primitives, and upcoming standalone components before integrating them into the Pour Decisions product apps.

## Commands

```bash
# start the docs app on http://localhost:4200
npm run start:docs

# build a production bundle
npm run docs:build
```

The docs app lives in `apps/tonic-docs`. It boots from a standalone root component with routes for:

- `/foundations` - tokens, typography, spacing
- `/components` - buttons, panels, dialogs, and future Angular wrapper components
- `/forms` - inputs, selects, check/radio controls

Global styles import `libs/tonic/tonic.scss`, so updates to the design system appear immediately while you are developing.

## Adding Demos

1. Generate a new standalone component under `apps/tonic-docs/src/app`.
2. Register the component in `app.routes.ts` to expose a new route.
3. Use Tonic classes and tokens (or import Angular components from the design system) to build the example markup.
