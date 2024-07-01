<template>
  <div class="h-[98vh] p-4 bg-gray-100 shadow-lg rounded-lg w-[fill-available]">
    <h1 class="text-2xl font-bold mb-4">Task Manager</h1>

    <!-- Search Box -->
    <div class="mb-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search processes..."
        class="px-3 py-2 border border-gray-300 rounded-lg w-full"
      />
    </div>

    <ul class="space-y-2">
      <li
        v-for="process in filteredProcesses"
        :key="process.pid"
        class="flex justify-between items-center bg-white p-2 rounded shadow"
      >
        <span>{{ process.name }} (PID: {{ process.pid }})</span>
        <button
          @click="endTask(process.pid)"
          class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
        >
          End Task
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      processes: [],
      searchTerm: ''
    }
  },
  methods: {
    async fetchProcesses() {
      this.processes = await window.electron.getProcesses()
    },
    async endTask(pid) {
      await window.electron.killProcess(pid)
      this.fetchProcesses() // Refresh the list after killing the process
    },
    setupWebSocket() {
      const ws = new WebSocket('ws://localhost:8080')

      ws.onmessage = (event) => {
        this.processes = JSON.parse(event.data)
      }

      ws.onclose = () => {
        console.log('WebSocket connection closed, reconnecting...')
        setTimeout(this.setupWebSocket, 1000)
      }
    }
  },
  computed: {
    filteredProcesses() {
      // Filter processes based on searchTerm
      return this.processes.filter((process) =>
        process.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  mounted() {
    this.setupWebSocket()
  }
}
</script>
