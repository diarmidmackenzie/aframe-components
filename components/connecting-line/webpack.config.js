// Webpack dev config for aframe-connecting-line.
//
// Builds the package (both `connecting-line2` and the legacy `connecting-line`
// wrapper, registered from index.js) into a single UMD bundle, with three
// externalized to the page's global THREE.
const path = require('path');

module.exports = {
  // index.js registers BOTH components (connecting-line2 + legacy wrapper).
  entry: './index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: 'connecting-line.js',
    libraryTarget: 'umd'
  },

  // Externalize ONLY the exact request `three` to the page's RUNTIME GLOBAL
  // THREE (the single super-three that owns sceneEl.renderer). The function
  // form matches the bare `three` request exactly and externalizes it, while
  // the deep `three/examples/jsm/lines/...` request does NOT match and
  // therefore BUNDLES (resolved via the resolve.alias below out of
  // super-three). This is load-bearing: bundling a second copy of core three
  // would break instanceof / raycast / rendering against the scene renderer.
  //
  // externalsType: 'global' (MED-2) makes the external resolve to the bundle's
  // runtime global (the UMD wrapper's root — `self["THREE"]` in the emitted
  // bundle), NOT `require("THREE")`. This works for the two supported targets:
  // the CDN <script> path (global THREE on window/self) and bundlers like Vite
  // (simple-draw / TASK-140) running in the browser, where `self` is defined and
  // the consumer exposes THREE as a global. NOTE: because the lookup is the
  // wrapper root (`self`), a Node/SSR/worker consumer that lacks `self` must
  // shim it — out of scope here (this is a browser/A-Frame component). The deep
  // examples/jsm imports remain bundled and are unaffected by externalsType.
  externalsType: 'global',
  externals: [
    ({ request }, cb) => (request === 'three' ? cb(null, 'THREE') : cb()),
  ],

  resolve: {
    // The deep `three/examples/jsm/lines/...` imports resolve out of the
    // super-three package (the same version A-Frame's renderer runs). NOTE:
    // this relies on super-three's `exports["./examples/jsm/*"]` wildcard in
    // its package.json; a future re-pin that drops that wildcard would break
    // the deep import. The Step-0 grep assertion (LineMaterial shader source
    // present in the bundle) guards against a silent regression.
    alias: {
      three: 'super-three'
    }
  },

  devtool: 'source-map',
  mode: 'development'
};
