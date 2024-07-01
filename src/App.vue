<template>
  <div class="flex">
    <KeepAlive>
      <sideBar :partitions="partitions" @open="showOverlay" />
    </KeepAlive>

    <div class="bg-sky-100 w-full h-[100vh]">
      <div :class="{ 'fixed bg-black opacity-50 w-full h-[100vh] z-50 ': Show }"></div>
      <RouterView class="fixed left-20 top-3 overflow-auto" />
    </div>
  </div>
</template>
<script>
import sideBar from './components/sideBar.vue'
export default {
  components: {
    sideBar
  },
  data() {
    return {
      partitions: [],
      Show: null
    }
  },
  mounted() {
    window.addEventListener('load', this.fetchPartitions)
    document.addEventListener('dragstart', this.preventGlobalDrag)
  },
  beforeUnmount() {
    window.removeEventListener('load', this.fetchPartitions)
    document.removeEventListener('dragstart', this.preventGlobalDrag)
  },
  methods: {
    async fetchPartitions() {
      try {
        let partitions = await window.electron.getPartitions()

        this.partitions = partitions
      } catch (error) {
        console.error('Error:', error)
      }
    },
    showOverlay(show) {
      this.Show = show
    },
    preventGlobalDrag(event) {
      if (event.target.tagName === 'A') {
        event.preventDefault()
      }
    }
  }
}
</script>
