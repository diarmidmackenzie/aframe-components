const GLOBAL_DATA = {
  tempMatrix: new THREE.Matrix4(),
  tempQuaternion: new THREE.Quaternion(),
}

// Change the parent of an object without changing its transform.
AFRAME.registerComponent('object-parent', {

  schema: {
      parent:     {type: 'selector'},    
  },

  update() {

      const matches = document.querySelectorAll(`#${parent.id}`)
      if (matches.length > 1) {
          console.warn(`object-parent matches duplicate entities for new parent ${parent.id}`)
      }

      const newParent = this.data.parent.object3D
      this.reparent(newParent)
      
  },

  remove() {

    const originalParentEl = this.el.parentEl
    this.reparent(originalParentEl.object3D)

  },

  reparent(newParent) {

    const object = this.el.object3D
    const oldParent = object.parent

    if (object.parent === newParent) {
        return;
    }

    objectEl = (o) => {
        if (o.type === 'Scene') {
            return (this.el.sceneEl)
        }
        else {
            return o.el
        }
    }

    console.log(`Reparenting ${object.el.id} from ${objectEl(oldParent).id} to ${objectEl(newParent).id}`);
    
    // make sure all matrices are up to date before we do anything.
    // this may be overkill, but ooptimizing for reliability over performance.
    oldParent.updateMatrixWorld();
    oldParent.updateMatrix();
    object.updateMatrix();
    newParent.updateMatrixWorld();
    newParent.updateMatrix();
    
    // Now update the object's matrix to the new frame of reference.
    GLOBAL_DATA.tempMatrix.copy(newParent.matrixWorld).invert();
    object.matrix.premultiply(oldParent.matrixWorld);
    object.matrix.premultiply(GLOBAL_DATA.tempMatrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
    object.matrixWorldNeedsUpdate = true;

    // finally, change the object's parent.
    newParent.add(object);
  },
});
