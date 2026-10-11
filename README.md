# Shadow Portrait Studio

Open-source, browser-based experimental tool to turn images into shadow sculptures for 3D printing.

## Status

**v0.1 prototype:** image upload, grayscale/threshold preview, mode selector (line/volume), configuration export. STL generation and physically accurate shadow simulation are **not implemented yet**.

## Run locally

Open `index.html` in a modern browser, or serve the folder using any static HTTP server.

## Modes (planned)

- **Lines:** continuous-filament shadow sculpture.
- **Volume:** voxel/mesh-based abstract shadow sculpture.

Both will share a target shadow definition, a calibrated lighting scene, geometry validation and STL export.

See `docs/architecture.md` for the roadmap.

## License

MIT.
