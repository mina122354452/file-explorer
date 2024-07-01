export default {
  install(Vue) {
    Vue.mixin({
      mounted() {
        document.addEventListener('dragstart', this.preventGlobalDrag)
      },
      beforeUnmount() {
        document.removeEventListener('dragstart', this.preventGlobalDrag)
      },
      methods: {
        preventGlobalDrag(event) {
          if (event.target.tagName === 'A') {
            event.preventDefault()
          }
        }
      }
    })
  }
}
