# Region Mapping & Decomposition

A region map decomposes a screen or visual comp into structured layers before asset production or component coding.

## 1. What Varies Independently

Split regions strictly by what varies independently:
1. **Dynamic Content**: Data that the system swaps (player balances, property cards, status tags, avatars).
2. **Moving Parts**: Anything an interaction or state moves (wheels, modals, expandable trays, drawer overlays, animated tokens).
3. **Persistent Structure**: Surrounds, borders, frame plates, background grids, persistent HUD chrome.

When composite elements overlap, keep their layers separated:
- Background plate or container.
- Independent dynamic content layer.
- Overlaid controls or interactive affordances.

## 2. Containment Rules

- Parent containers enclose their children but never replace them.
- Separate interactive elements must be mapped individually so touch targets and hit areas do not collapse into bounding boxes.
- Container describes layout extent, while child regions describe functional interaction surfaces.

## 3. Separation of Concerns

- **Code-Drawn Regions**: Standard UI primitives (buttons, text, tabs, badges) must be rendered with clean CSS/HTML code, never baked into raster images.
- **Plates & Assets**: Only true artistic illustrations, textured materials, or complex 3D meshes should be isolated as raster/model assets.
- Comp crops and reference mocks are development evidence only, never production asset shortcuts.
