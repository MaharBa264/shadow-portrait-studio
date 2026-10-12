# Shadow Portrait Studio

Open-source, browser-based experimental tool to turn images into shadow sculptures for 3D printing.

## Status

**v0.3 experimental prototype:** image upload, grayscale/threshold preview, mode selector (line/volume), configuration export. The v0.2 reference projection uses an **ideal opaque flat mask** and a calibrated point source; it is not a sculpture preview. An experimental inverse-projected 3D scanline filament generator and ASCII STL export are now available. **Its bars are disconnected: STLs are NOT print-ready.** Connected geometry, physically realistic finite-emitter shadows, and physical print validation are still pending.

## Run locally

Open `index.html` in a modern browser, or serve the folder using any static HTTP server.

## Tests

Run `npm test` with Node.js 20+ to check the projection mathematics. (No build or dependencies required.)

## Modes (planned)

- **Lines:** continuous-filament shadow sculpture.
- **Volume:** voxel/mesh-based abstract shadow sculpture.

Both will share a target shadow definition, a calibrated lighting scene, geometry validation and STL export.

See `docs/architecture.md` for the roadmap.

## License

MIT.
