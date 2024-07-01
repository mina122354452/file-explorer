const { contextBridge, ipcRenderer } = require('electron')

// preload.js
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
  contextBridge.exposeInMainWorld('electron', {
    getPartitions: async () => {
      let response = await ipcRenderer.invoke('getPartitions')
      return response
    },
    getDeviceData: async () => {
      let response = await ipcRenderer.invoke('getDeviceData')
      return response
    },
    getProcesses: () => ipcRenderer.invoke('get-processes'),
    killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
    fetchFiles: async (currentPath) => {
      return await ipcRenderer.invoke('fetch-files', currentPath)
    },
    openFile: async (path) => {
      return await ipcRenderer.invoke('open-file', path)
    },
    search: async (value, currentPath, depth) => {
      return await ipcRenderer.invoke('search', value, currentPath, depth)
    }
  })
})
