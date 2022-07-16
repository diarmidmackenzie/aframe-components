AFRAME.registerComponent("hide-on-hover", {

    init() {
        this.el.setAttribute("raycastable")
    },

    events: {
        'mouseenter': function (evt) {
            this.el.setAttribute("visible", false)
        },
        'mouseleave': function (evt) {
            this.el.setAttribute("visible", true)
        }
    }
})