# Region Mapping & Decomposition

A region map names what is actually visible in the approved comp and decomposes a screen or visual comp into structured layers before asset production or component coding. It is not a page build or an asset approval.

## 1. Tooling & Inspection Workflow

1. Run `{{scripts_path}}/impeccable comp-spec --comp <comp.png> --grid` and open the original and gridded images.
2. Run `{{scripts_path}}/impeccable comp-spec --schema` for the JSON fields. Write `regions.json` with a `regions` array. Each region needs a stable `id`, `kind`, `note`, and exactly one of `pixelBox`, normalized `box`, or `grid`. Use the original comp’s dimensions.
3. Run `{{scripts_path}}/impeccable comp-spec --comp <comp.png> --regions regions.json --inspect-map`. The output points to a report, overlay, exact crops and `COMPARE` sheets of masked references. The default prints findings; `--json` prints the entire report, with sheet paths in `comparisonSheets`.
4. Open the comparison sheets first to inspect affected crops together, then open individual crops where more detail is needed. Compare their bounds with the original. Inspect excluded foreground pixels as well as geometry errors. Every overlapping non-container code box is masked in full, including empty space inside it. Bound separate text elements separately so artwork in the gaps stays visible; a container describes their layout extent and never replaces its children. Correct the map and inspect again; use a new output directory each time. Zero errors does not certify crop accuracy. Coverage warnings are hints, not proof of completeness.

If the request ends at mapping, stop with the map, inspection report and unresolved findings. To continue a build, measure the inspected map with `comp-spec --comp <comp.png> --regions regions.json` and follow [new-work.md](new-work.md).

`--auto` produces horizontal band scaffolding, not element identification. It is optional and does not replace authoring a map.

## 2. What Varies Independently (vtcoon Domain Grounding)

Split regions strictly by what varies independently:
1. **Dynamic Content**: Data that the system swaps (player balances, property cards, status tags, avatars, debt/treasury indicators).
2. **Moving Parts**: Anything an interaction or state moves (transit wheels, modals, expandable trays, drawer overlays, animated tokens, dice indicators).
3. **Persistent Structure**: Surrounds, borders, frame plates, background grids, persistent HUD chrome.

When composite elements overlap, keep their layers separated:
- Background plate or container.
- Independent dynamic content layer.
- Overlaid controls or interactive affordances.

A window or card with moving sub-parts is split into separate regions: the surround as a plate with a transparent opening, the content beneath it as an image region, and moving parts (shutter, token, needle) as their own plates. Overlapping regions are composited in the page. `comp-spec` flags a raster region whose note names a frame and the view it opens onto (`baked-composite`), and the plan and asset review shows it to the user first.

## 3. Containment Rules

- Parent containers enclose their children but never replace them (`parentId` identifies an enclosing `container: true` region).
- Parent and children keep separate IDs and crops. Containment never transfers approval.
- Separate interactive elements must be mapped individually so touch targets and hit areas do not collapse into bounding boxes.
- Container describes layout extent, while child regions describe functional interaction surfaces.

## 4. Painted Material & Separation of Concerns

When measuring, `comp-spec` flags a `text`, `control` or `chrome` region, containers included, whose crop looks painted (`painted-pixels`: many colours, soft gradients) and lists it in its summary. The plan and asset review shows flagged regions, and those marked `codeDrawn` (painted material you chose to draw in code), to the user first. Do not leave the catch to them: if a region is painted material (a figure, an illustration, a metal or paper texture), classify it `plate`, `image` or `texture` now.

- **Code-Drawn Regions**: Standard UI primitives (buttons, text, tabs, badges, metrics) must be rendered with clean CSS/HTML code, never baked into raster images.
- **Plates & Assets**: Only true artistic illustrations, textured materials, or complex 3D meshes should be isolated as raster/model assets.
- Comp crops and reference mocks are development evidence only, never production asset shortcuts.
