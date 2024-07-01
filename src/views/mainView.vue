<template>
  <div :class="{ 'loader-container': !data }">
    <div v-if="!data" class="loader"></div>
    <div v-else>
      <h1 class="text-xl">{{ data.deviceName }}</h1>
      <br />
      <h2 class="text-lg">MOTHERBOARD :</h2>
      <span class="font-mono text-sm">{{ data.motherboard }}</span>
      <br />
      <h2 class="text-lg">PROCESSOR :</h2>
      <span class="font-mono text-sm">{{ data.processor }}</span>
      <br />
      <h2 class="text-lg">RAM :</h2>
      <span class="font-mono text-sm">{{ data.ram }}</span>
      <br />
      <h2 class="text-lg">GPU :</h2>
      <span class="font-mono text-sm">{{ data.gpu }}</span>
      <br />
      <h2 class="text-lg">BIOS :</h2>
      <span class="font-mono text-sm">{{ data.bios }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null
    }
  },
  created() {
    this.fetchData().catch((error) => {
      console.error('Error:', error)
    })
  },
  methods: {
    async fetchData() {
      try {
        let Data = await window.electron.getDeviceData()
        this.data = Data
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }
}
</script>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8); /* Slightly opaque background */
  z-index: 9999; /* Ensures loader is on top of other elements */
}

.loader {
  border: 12px solid #f3f3f3; /* Light grey */
  border-top: 12px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s ease-in-out infinite; /* Faster and smoother animation */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Media query for responsiveness */
@media (max-width: 600px) {
  .loader {
    width: 60px;
    height: 60px;
    border-width: 8px; /* Smaller loader on smaller screens */
  }
}
</style>
