//
// line-math — pure camera/viewport math helpers for connecting-line2.
//
// Kept free of component state and THREE object construction so they can be
// unit-tested standalone. Callers pass in everything the function needs.
//

// World units per device pixel of vertical viewport, at the given world-space
// point. Used to convert a px-specified dash period into world units so the
// dash renders at a constant on-screen size.
//
//  - orthographic (exact): the world height spanned by the viewport is
//    (top - bottom) / zoom, independent of depth.
//  - perspective (approximation): the world height spanned by the viewport
//    grows with distance from the camera as 2 * tan(fov/2) * dist. We evaluate
//    it at `midpointWorld` (the line's midpoint in world space) — a single
//    representative depth. This is exact only for a line lying in a plane
//    parallel to the image plane; for a line angled in depth the dash spacing
//    drifts slightly along its length. See DESIGN-NOTES.md.
//
// Returns 0 for an unrecognised camera type. `camera` for a perspective camera
// must have an up-to-date matrixWorld (the caller is responsible for calling
// updateMatrixWorld()).
export function worldPerPixel(camera, viewportHeightPx, midpointWorld) {
  if (camera.isOrthographicCamera) {
    const worldHeight = (camera.top - camera.bottom) / (camera.zoom || 1);
    return worldHeight / viewportHeightPx;
  }
  if (camera.isPerspectiveCamera) {
    const camWorldX = camera.matrixWorld.elements[12];
    const camWorldY = camera.matrixWorld.elements[13];
    const camWorldZ = camera.matrixWorld.elements[14];
    const dx = midpointWorld.x - camWorldX;
    const dy = midpointWorld.y - camWorldY;
    const dz = midpointWorld.z - camWorldZ;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const fovRad = (camera.fov * Math.PI) / 180;
    const worldHeight = 2 * Math.tan(fovRad / 2) * dist;
    return worldHeight / viewportHeightPx;
  }
  return 0;
}
