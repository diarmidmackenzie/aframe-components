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

    //console.log(`Reparenting ${object.el.id} from ${objectEl(oldParent).id} to ${objectEl(newParent).id}`);
    
    newParent.attach(object);
  },
});
