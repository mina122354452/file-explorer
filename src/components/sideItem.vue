<template>
  <ul class="p-3 hover:scale-105 transition-all">
    <li>
      <router-link :to="partition.DriveLetter.charAt(0)" class="">
        <div class="">
          <h3 class="text-lg font-extrabold text-gray-800 font-mono inline">
            {{ partition.Name + ' ' }}
          </h3>
          <span class="font-mono text-xs">{{ partition.DriveLetter }}</span>
          <br />
          <span class="font-mono text-xs">sysFileType: {{ partition.FileSystem }}</span>
          <br />
          <span class="font-mono text-xs"> free Space: {{ freeSpaceInGB }} GB </span>
          <br />
          <span class="font-mono text-xs"> used Space: {{ usedPercentage }}% </span>
          <div class="progress-bar">
            <div class="progress" :style="{ width: usedPercentage + '%' }"></div>
          </div>
        </div>
      </router-link>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'sideItem',
  props: ['partition'],
  computed: {
    freeSpaceInGB() {
      return parseInt((this.partition.TotalSize - this.partition.UsedSize) / (1024 * 1024 * 1024))
    },
    usedPercentage() {
      return ((this.partition.UsedSize / this.partition.TotalSize) * 100).toFixed(2)
    }
  }
}
</script>
<style scoped>
.progress-bar {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  height: 10px;
  margin-top: 5px;
}

.progress {
  height: 100%;
  background-color: #76c7c0;
  transition: width 0.3s ease;
}
</style>
