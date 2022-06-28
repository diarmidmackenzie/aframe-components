AFRAME.registerComponent("scale-on-hover", {

    init() {
        this.el.setAttribute("raycastable")
    },

    events: {
        'mouseenter': function (evt) {
            this.el.removeAttribute("animation__scale")
            this.el.setAttribute("animation__scale", "property:scale; to: 1.2 1.2 1.2; dur: 300")
        },
        'mouseleave': function (evt) {
            this.el.removeAttribute("animation__scale")
            this.el.setAttribute("animation__scale", "property:scale; to: 1 1 1; dur: 300")
        }
    }
})