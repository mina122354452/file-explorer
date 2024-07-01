<template>
  <div class="h-[97vh] w-[fill]">
    <div class="flex items-center justify-between mb-4">
      <!-- <h2 class="text-lg font-bold ml-4">{{ currentPath }}</h2> -->
      <input
        @change="changePath($event.target.value)"
        type="text"
        class="bg-transparent font-semibold border-none outline-none"
        :value="currentPath"
      />
      <div class="flex items-center">
        <h3
          class="text-2xl mr-3 mb-1 cursor-pointer"
          @click="searching ? search(value) : fetchFiles()"
        >
          ⟳
        </h3>
        <button @click="undo" :disabled="undoStack.length === 0" class="btn-undo">🡨</button>
        <button @click="redo" :disabled="redoStack.length === 0" class="btn-redo">🡪</button>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <searchBar @type="search" class="w-full" :disabled="loading || errorFetching" />
      <div class="flex w-2/5 justify-end mb-3 mr-1 flex-nowrap">
        <span class="capitalize pt-4">depth : {{ depth }}</span>
        <div>
          <button
            @click="increasePath"
            :disabled="!searching || depth >= 6 || depth == 6"
            class="btn-plus text-2xl"
          >
            +
          </button>
          <button
            @click="decreasePath"
            :disabled="!searching || depth <= 1 || depth == 1"
            class="btn-mince text-2xl"
          >
            -
          </button>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
    </div>
    <div
      v-else-if="!loading && files.length == 0 && errorFetching && currentPath.trim() != ''"
      class="no-files-container"
    >
      <p class="no-files-message font-extrabold">Not A Directory</p>
      <span class="no-files-hint font-mono"> not a directory or not an accessible directory</span>
    </div>
    <div
      v-else-if="!loading && files.length == 0 && currentPath.trim() == '' && errorFetching"
      class="no-files-container"
    >
      <p class="no-files-message font-extrabold">Invalid Path</p>
      <span class="no-files-hint font-mono"> Not A Valid Path Value. EMPTY PATH.</span>
    </div>
    <div v-else-if="!loading && files.length == 0" class="no-files-container">
      <p class="no-files-message font-extrabold">No files found</p>
      <span class="no-files-hint font-mono">
        Maybe the files are hidden or the files are system files
      </span>
    </div>

    <ul class="overflow-hidden" v-else>
      <item
        v-for="file in files"
        :key="file.path"
        @click="
          file.type == 'directory'
            ? changePath(file.path)
            : file.type == 'file'
              ? openFile(file.path)
              : null
        "
        class="flex items-center mb-2 hover:scale-110 hover:translate-x-20 transition-all ease-in-out p-0.5"
        :file="file"
      />
    </ul>
  </div>
</template>

<script>
import item from '../components/itemsExp.vue'
import searchBar from '../components/searchBar.vue'

export default {
  components: {
    item,
    searchBar
  },
  data() {
    return {
      currentPath: this.$route.params.id + ':\\',
      files: [],
      loading: false,
      undoStack: [],
      redoStack: [],
      depth: 2,
      searching: false,
      value: '',
      errorFetching: null
    }
  },
  watch: {
    '$route.params.id': function (newId) {
      this.changePath(newId + ':\\')
      this.fetchFiles()
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.changePath(to.params.id + ':\\')
    this.fetchFiles()
    next()
  },
  created() {
    this.changePath(this.$route.params.id + ':\\')
    this.fetchFiles()
  },

  methods: {
    async fetchFiles() {
      this.errorFetching = null
      //auto refresh
      if ((!this.value.trim() == '') & (!this.value == ' ') & (!this.value?.length == 0)) {
        this.search(this.value)
        console.log('ss')
      } else {
        try {
          this.loading = true
          console.log('Requesting files for path:', this.currentPath)
          const response = await window.electron.fetchFiles(this.currentPath)
          this.files = response.map((file) => ({
            ...file,
            extension: file.type === 'file' ? file.extension || 'unknown' : ''
          }))

          this.loading = false
          // console.log(this.files)
        } catch (error) {
          console.error('Error fetching files:', error)
          this.errorFetching = error
          this.files = []
          this.loading = false
        }
      }
    },
    changePath(path) {
      if (this.currentPath !== path) {
        this.undoStack.push(this.currentPath)
        this.currentPath = path
        this.fetchFiles()
        this.redoStack = [] // Clear redo stack on new navigation
      }
    },
    undo() {
      if (this.undoStack.length > 0) {
        this.redoStack.push(this.currentPath)
        this.currentPath = this.undoStack.pop()
        this.fetchFiles()
      }
    },
    redo() {
      if (this.redoStack.length > 0) {
        this.undoStack.push(this.currentPath)
        this.currentPath = this.redoStack.pop()
        this.fetchFiles()
      }
    },
    async openFile(path) {
      await window.electron.openFile(path)
    },
    async search(value) {
      this.value = value
      if (value == ' ') {
        this.searching = false
        return
      } else if (value.trim() == '') {
        this.searching = false
        this.fetchFiles()
      } else {
        this.searching = true
        this.loading = true
        this.files = await window.electron.search(value, this.currentPath, this.depth)
        this.loading = false
      }
    },
    increasePath() {
      this.depth++

      this.search(this.value)
    },
    decreasePath() {
      this.depth--

      this.search(this.value)
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

.no-files-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 77vh; /* Ensures the container takes full height of the viewport */
  text-align: center; /* Centers the text within the container */
}

.no-files-message {
  font-size: 1.5em;
  font-weight: bold;
  color: #333; /* Dark grey color for better readability */
  margin-bottom: 10px;
}

.no-files-hint {
  font-size: 1em;
  color: #666; /* Lighter grey color for secondary text */
}

.btn-undo,
.btn-redo {
  background-color: transparent;
  border: none;
  padding: 10px;
  margin-right: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-undo:disabled,
.btn-redo:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.btn-plus,
.btn-mince {
  background-color: transparent;
  border: none;
  padding: 10px;
  margin-right: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-plus:disabled,
.btn-mince:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
