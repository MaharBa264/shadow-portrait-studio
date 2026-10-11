# Architecture — v0.1

## Goal

Build an open-source local-first web application that takes an image, computes a 3D object whose cast shadow approximates the desired portrait, simulates the projection, and exports printable STL.

## Separation of concerns

1. Image loader and normalization
2. Target-shadow model
3. Optical scene (light source, projection surface, coordinate system)
4. Independent generators:
   - lines: connected spatial curves/swept tubes
   - volume: voxel topology and solid meshing
5. Common optical shadow renderer and image error metrics
6. Print validation (thickness, connectivity, watertightness)
7. Exporters (STL and versioned project JSON)

## First iteration

- Provide a dependency-free browser UI.
- Load an image without uploading it to a server.
- Set contrast and binary threshold.
- Export scene configuration as JSON.
- Keep generated geometry and simulator clearly labeled as future work.

## Optical constraints

Shadow geometry is not unique for a given image. Projection accuracy depends on light type, position, receiver plane and emitter size. The UI must not claim a result is printable or optically accurate until validated.

## Milestones

- v0.1: editor and image preprocessing
- v0.2: reference optical simulator
- v0.3: simple silhouette line generator and STL
- v0.4: portrait-oriented line refinement
- v0.5: volume generator
- v0.6: automated optimization
- v0.7: printable bases and diagnostics
