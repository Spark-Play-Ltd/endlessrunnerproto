# Three.js Endless Runner Prototype (Greybox Skeleton)

Minimal TypeScript + Vite scaffold for a modular Three.js web game prototype.

## Tech Stack

- TypeScript
- Vite
- Three.js

## Project Structure

```text
src/
  core/
    EventBus.ts
    events.ts
    Game.ts
    SystemRegistry.ts
    types.ts
  systems/
    ExampleSystem.ts
  entities/
  ui/
  utils/
  main.ts
  style.css
```

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — type-check and production build
- `npm run preview` — preview production build

## Development

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Notes

- `Game` owns the only authoritative game loop (`requestAnimationFrame`).
- No global mutable state is used outside the `Game` instance.
- Future systems should implement the `System` interface and register through `Game.registerSystem(...)`.
- Event flow can be wired with the typed `EventBus` + `GameEvent` definitions.
