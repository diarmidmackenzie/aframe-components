// Build-time guard for connecting-line2's world-unit extrusion override.
//
// connecting-line2 overrides one line of LineMaterial's vertex shader (see the
// module header in connecting-line2.js). The override is a string replacement,
// so it silently becomes a no-op if the bundled three.js reflows or renames
// that line. connecting-line2 throws at module evaluation when that happens,
// but a load-time throw is late: it needs a page that loads the bundle. This
// runs as part of `npm run dist`, so a super-three bump that breaks the
// override fails the build instead.
//
// Run: node check-shader-target.mjs   (wired into `npm run dist`)
//
// Every outcome is explicit. A missing file, an unreadable one, a target that
// is absent, and a target that appears more than once are all failures -- this
// check must never pass by finding nothing.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// Kept in sync with STOCK_WORLD_UNITS_FORWARD in connecting-line2.js; the last
// check below asserts the two agree, so this file cannot drift from the source
// it is guarding.
const TARGET = 'vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );';

function read(label, path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    console.error(`FAIL: could not read ${label} at ${path}`);
    console.error(`  ${error.message}`);
    console.error('  Run `npm install` in this directory first.');
    process.exit(1);
  }
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return count;
    count++;
    from = at + needle.length;
  }
}

const materialPath = join(here, 'node_modules/super-three/examples/jsm/lines/LineMaterial.js');
const materialSource = read('super-three LineMaterial', materialPath);
const inMaterial = countOccurrences(materialSource, TARGET);

if (inMaterial !== 1) {
  console.error(
    `FAIL: expected exactly 1 occurrence of the world-unit extrusion line in ` +
    `LineMaterial, found ${inMaterial}.`
  );
  console.error(`  Looked for: ${TARGET}`);
  console.error(`  In: ${materialPath}`);
  console.error(
    '  The pinned super-three has changed. Re-read the WORLD_UNITS block in\n' +
    '  LineMaterial and update STOCK_WORLD_UNITS_FORWARD and\n' +
    '  ORTHO_AWARE_WORLD_UNITS_FORWARD in connecting-line2.js (and TARGET here)\n' +
    '  to match. Do NOT relax this check: the override would silently stop\n' +
    '  applying, and orthographic exports would quietly regress.'
  );
  process.exit(1);
}

const componentPath = join(here, 'connecting-line2.js');
const componentSource = read('connecting-line2.js', componentPath);

if (!componentSource.includes(`'${TARGET}'`)) {
  console.error('FAIL: connecting-line2.js does not contain the target string this check guards.');
  console.error(`  Looked for: '${TARGET}'`);
  console.error('  TARGET here and STOCK_WORLD_UNITS_FORWARD there have drifted apart.');
  process.exit(1);
}

console.log('OK: LineMaterial still carries the world-unit extrusion line that connecting-line2 overrides.');
