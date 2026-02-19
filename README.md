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
    GameState.ts
    SystemRegistry.ts
    types.ts
  entities/
    Obstacle.ts
    Player.ts
  systems/
    ExampleSystem.ts
    CollisionSystem.ts
    InputSystem.ts
    ObstacleSpawnSystem.ts
    PatternManager.ts
    PlayerMovementSystem.ts
    RenderSystem.ts
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

## Current Greybox Bootstrap

- `Game` owns a single RAF loop and orchestrates systems + rendering.
- `InputSystem` handles pointer swipes (left/right lanes, up jump) and keyboard fallback (arrows + space), emitting intents.
- `PlayerMovementSystem` applies forward movement, lane switch easing (`~130ms` default), and jump physics (fast rise, faster fall).
- Mid-air lane changes are ignored (`isGrounded === false`) and double jump is blocked.
- Lanes are fixed at `[-laneWidth, 0, laneWidth]` with default `laneWidth = 1.2`.
- `CollisionSystem` uses forgiving AABB hitboxes + jump clearance margin and emits `RUN_END` on obstacle impact.
- `ObstacleSpawnSystem` uses `PatternManager` micro-patterns for structured-random lane obstacles.
- Fairness rules prevent impossible walls (never all 3 lanes blocked, respect minimum reaction distance, avoid jump+lane compound asks for now).
- Obstacles spawn ahead of player and are recycled behind for stable performance.
- `RenderSystem` owns renderer/scene/camera/lights/ground/fog, camera follow, lane debug lines, and obstacle mesh syncing.
- Landing emits a typed `PLAYER_LANDED` event hook (no VFX/SFX wired yet).
