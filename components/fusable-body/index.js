var createVertex = require("dynamic-forest")

AFRAME.registerComponent('fusable-body', {

  init() {

  }

  }

);


AFRAME.registerComponent('fused-joint', {

  schema() {
    target: {type: 'selector'}
  },

  init() {
    const thisGroup = this.el.object3D.parent.el
    const targetGroup = this.data.target.object3D.parent.el

    this.system.
  },

  remove() {
    this.system.splitGroups(thisGroup, targetGroup)

  }
});

AFRAME.registerSystemomponent('fusion-container', {

  init() {
    this.groups = []
  },


  trackBody(body) {

    if (body.graphVertex)
    body.graphVertex = createVertex(body.object3D.id)
  },

  untrackBody(body) {

    body.graphVertex.cut()
    body.graphVertex = null
  },

  linkBodies(bodyA, bodyB) {
    bodyA.graphVertex.link(bodyB.graphVertex)
  },

  jointAdded(bodyA, bodyB) {

    this.trackBody(bodyA)
    this.trackBody(bodyB)
    this.linkBodies(bodyA, bodyB)
    
    groupA = bodyA.object3D.parent
    groupB = bodyB.object3D.parent

    // no need to merge group with itself.
    if (groupA === groupB) return;

    mergeGroups(groupA, groupB)
  },

  jointRemoved(bodyA, bodyB) {

    group = bodyA.object3D.parent


    // only work to do if the bodies were in the same group before.
    if (group != bodyB.object3D.parent) return;




  }

  createGroup() {

    const group = document.createElement('a-entity')
    group.setAttribute('physx-body', '')
    this.el.appendChild(group)
    group.joints = []
    this.groups.push(group)
  },

  destroyGroup(group) {
    // TO DO

  },

  addJoint(groupA, groupB) {

    groupA.






  },

  removeJoint(groupA, groupB) {

  }

});