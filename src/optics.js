/**
 * Point-light shadow projection onto the plane z=0.
 * Coordinates in millimetres; the object is on z=objectZ,
 * with 0 < objectZ < lightZ.
 */
export function projectPoint(point, light) {
  if (![...point, ...light].every(Number.isFinite)) throw new Error('Coordinates must be finite');
  const dz = point[2] - light[2];
  if (Math.abs(dz) < 1e-9) throw new Error('Ray is parallel to the receiver plane');
  const t = -light[2] / dz;
  if (t <= 0) throw new Error('Projection falls behind the light');
  return [light[0] + t * (point[0] - light[0]), light[1] + t * (point[1] - light[1])];
}
export function shadowScale(lightZ, objectZ) {
  if (!(lightZ > objectZ && objectZ > 0)) throw new Error('Require lightZ > objectZ > 0');
  return lightZ / (lightZ - objectZ);
}
/** Inverse mapping: receiver plane pixel position -> location on flat object mask. */
export function receiverToObject(x, y, scene) {
  const { lightX, lightY, lightZ, objectZ } = scene;
  const t = (lightZ - objectZ) / lightZ;
  return [lightX + (x - lightX) * t, lightY + (y - lightY) * t];
}
export function renderFlatMaskShadow(targetPixels, width, height, scene, receiverPixels = 420) {
  const { lightX, lightY, lightZ, objectZ, objectSizeMm, receiverSizeMm } = scene;
  if (![lightX, lightY, lightZ, objectZ, objectSizeMm, receiverSizeMm].every(Number.isFinite)) throw new Error('Invalid scene');
  shadowScale(lightZ, objectZ);
  if (!(objectSizeMm > 0 && receiverSizeMm > 0)) throw new Error('Invalid physical dimensions');
  if (targetPixels.length !== width * height * 4) throw new Error('Unexpected mask dimensions');
  const out = new Uint8ClampedArray(receiverPixels * receiverPixels * 4);
  for (let py = 0; py < receiverPixels; py++) {
    const y = (0.5 - (py + 0.5) / receiverPixels) * receiverSizeMm;
    for (let px = 0; px < receiverPixels; px++) {
      const x = ((px + 0.5) / receiverPixels - 0.5) * receiverSizeMm;
      const [ox, oy] = receiverToObject(x, y, scene);
      const ix = Math.floor(((ox - (scene.objectX ?? 0)) / objectSizeMm + 0.5) * width);
      const iy = Math.floor((0.5 - oy / objectSizeMm) * height);
      const o = (py * receiverPixels + px) * 4;
      const inside = ix >= 0 && ix < width && iy >= 0 && iy < height;
      const v = inside ? targetPixels[(iy * width + ix) * 4] : 255;
      out[o] = out[o + 1] = out[o + 2] = v;
      out[o + 3] = 255;
    }
  }
  return out;
}
