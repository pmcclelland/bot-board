# Bot Board

A local-first kanban for the work your bots are doing. Cards live in To Do, Doing, and Done, grouped by project, and stay on this device.

![Bot Board](screenshots/bot-board-desktop.png)

## Features

- **Three lanes** — To Do, Doing, and Done. Drag cards between columns, or use the lane switcher on smaller screens.
- **Projects** — Group work into projects, filter the board to one, and create, rename, or delete them as you go.
- **Cards** — Title, description, optional link, and tags. Search across titles, links, and tags.
- **Stays put** — Board state is saved in the browser. Refresh, close the tab, come back later.
- **Sample board** — Restore the starter cards any time from the board menu.

## Stack

- React 19 and TanStack Start
- Zustand with local persistence
- dnd-kit for drag and drop
- Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev
```

The app runs at [http://localhost:8080](http://localhost:8080).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run tests |
| `npm run lint` | Lint |

## Data

Nothing is sent to a server. Cards, columns, and projects live in `localStorage` under this origin. Clearing site data for the app clears the board.

## License

Private. All rights reserved.
