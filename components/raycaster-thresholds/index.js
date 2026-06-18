/* global AFRAME, console */
//
// raycaster-thresholds — configure the proximity thresholds for raycasting
// against THREE.Line, THREE.Line2/LineSegments2, and THREE.Points.
//
// The default A-Frame raycaster thresholds for lines/points are 1m, which is
// far too large for most applications. This component lets you set sensible
// values declaratively.
//
// Line2 (the LineSegments2 family) reads its raycast threshold from a SEPARATE
// raycaster param namespace — `raycaster.params.Line2.threshold` — distinct from
// THREE.Line's `raycaster.params.Line.threshold`. Critically, the THREE
// Raycaster constructor (r158–r183) defines only Mesh/Line/LOD/Points/Sprite —
// it does NOT define `Line2`. So `params.Line2` is `undefined` by default and
// Line2 picks fall back to an exact (linewidth-only) band. This component
// creates the key so Line2 targets become pickable.
//
// SINGLE-WRITER MODEL: raycaster-thresholds is THE abstraction for these
// params. Consumers drive it (including dynamic values via setAttribute) rather
// than writing `raycaster.params.*` directly, and run ONE instance per
// raycaster. A consumer that needs more removes this component and manages the
// params itself — it does not write alongside it. `remove()` uses
// compare-before-restore as defensive hygiene against a concurrent writer.

AFRAME.registerComponent('raycaster-thresholds', {

    dependencies: ['raycaster'],

    schema: {
        // Threshold (m) for THREE.Line. Also sets params.Line2.threshold when
        // line2Mode === 'matchLine' (the default) — see line2Mode.
        line: { type: 'number', default: 0.01 },
        // How params.Line2.threshold is driven:
        //  - matchLine: Line2 threshold follows `line` (m). Zero-touch migration
        //    for a THREE.Line -> Line2 swap (m -> m). NOTE: `line` is metres, so
        //    a px-detecting Line2 target (ortho / raycastUnits auto->px) reads
        //    it as PIXELS — for those, use `set` with a px `line2`.
        //  - none: leave params.Line2 untouched; `line` does NOT propagate to it
        //    (composition opt-out — another owner or THREE's default preserved).
        //  - set: params.Line2.threshold = `line2`, in the Line2 detection unit.
        line2Mode: { type: 'string', default: 'matchLine', oneOf: ['matchLine', 'none', 'set'] },
        // Line2 threshold, in the Line2 detection unit. Consulted only when
        // line2Mode === 'set'. Must be finite and > 0.
        line2: { type: 'number', default: 0.01 },
        // Threshold (m) for THREE.Points.
        points: { type: 'number', default: 0.01 },
    },

    init() {
        const raycaster = this.el.components.raycaster.raycaster;

        // Capture baselines ONCE, for clean teardown (NOT in update — see LOW-12).
        this.oldLine = raycaster.params.Line.threshold;
        this.oldPoints = raycaster.params.Points.threshold;
        // Did params.Line2 exist on entry, and what was its threshold?
        this.hadLine2 = raycaster.params.Line2 !== undefined;
        this.oldLine2 = this.hadLine2 ? raycaster.params.Line2.threshold : undefined;

        // Per-apply bookkeeping: whether THIS component has written
        // params.Line2.threshold, and the last value it wrote (for
        // compare-before-restore + the matchLine/set -> none unwind).
        this.wroteLine2 = false;
        this.lastWrote = undefined;

        // init's apply and the first update()'s apply are redundant but
        // idempotent (baseline capture stays strictly here in init — LOW-12).
        this.apply();
    },

    update() {
        // Re-run apply on any schema change. Baselines were captured in init.
        this.apply();
    },

    // Shared by init + update. Writes Line/Points always; drives Line2 by mode.
    apply() {
        const raycaster = this.el.components.raycaster.raycaster;
        const data = this.data;

        raycaster.params.Line.threshold = data.line;
        raycaster.params.Points.threshold = data.points;

        if (data.line2Mode === 'matchLine') {
            this.writeLine2(raycaster, data.line);
        } else if (data.line2Mode === 'set') {
            if (Number.isFinite(data.line2) && data.line2 > 0) {
                this.writeLine2(raycaster, data.line2);
            } else {
                // Never write a 0 / negative / non-finite threshold. `none` is
                // the way to disable; fall back to matchLine here.
                console.warn(
                    `raycaster-thresholds: line2Mode 'set' requires a finite line2 > 0 ` +
                    `(got ${data.line2}); falling back to matchLine.`);
                this.writeLine2(raycaster, data.line);
            }
        } else { // 'none'
            // Do not write. If a prior apply wrote it, unwind to the captured
            // baseline so a matchLine/set -> none transition leaves no stale
            // value. Does NOT touch a value set by anyone else.
            if (this.wroteLine2) {
                this.restoreLine2Baseline(raycaster);
                this.wroteLine2 = false;
            }
        }
    },

    // Write a Line2 threshold, creating params.Line2 if absent.
    writeLine2(raycaster, value) {
        // NOT `??=` — that's ES2021, and older Quest browsers may predate it
        // (plan LOW-11). Guard explicitly.
        if (!raycaster.params.Line2) raycaster.params.Line2 = {};
        raycaster.params.Line2.threshold = value;
        this.wroteLine2 = true;
        this.lastWrote = value;
    },

    // Restore the captured baseline: prior threshold if params.Line2 existed on
    // entry, else delete the key this component created.
    restoreLine2Baseline(raycaster) {
        if (this.hadLine2) {
            if (raycaster.params.Line2) raycaster.params.Line2.threshold = this.oldLine2;
        } else if (raycaster.params.Line2 !== undefined) {
            delete raycaster.params.Line2;
        }
    },

    remove() {
        const raycaster = this.el.components.raycaster.raycaster;

        raycaster.params.Line.threshold = this.oldLine;
        raycaster.params.Points.threshold = this.oldPoints;

        // Line2: compare before restore (HIGH-2). params.Line2.threshold is a
        // shared global — only restore the baseline if WE wrote it AND nobody
        // has overwritten our value since. Otherwise leave it alone.
        if (this.wroteLine2 &&
            raycaster.params.Line2 !== undefined &&
            raycaster.params.Line2.threshold === this.lastWrote) {
            this.restoreLine2Baseline(raycaster);
        }
    }
})
