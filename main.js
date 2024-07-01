// main.js
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const si = require('systeminformation')
const path = require('path')
const { exec } = require('child_process')
const os = require('os')
const sudo = require('sudo-prompt')
const { url } = require('inspector')
const fs = require('fs').promises

const excludeFiles = [
  'hiberfil.sys',
  'pagefile.sys',
  'Swapfile.sys',
  'DumpStack.log.tmp',
  'swapfile.sys', // Add swapfile.sys to exclusion list
  '.DS_Store',
  '.localized',
  '.Spotlight-V100',
  '.Trashes',
  '.cache',
  '.thumbnails',
  '.Trash',
  'lost+found',
  'Desktop.ini'
]
require('./ws-server')
let psList

async function loadModules() {
  psList = (await import('ps-list')).default
}
let mainWindow
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.send('window-ready')
  })
}

ipcMain.handle('getPartitions', async () => {
  return new Promise((resolve, reject) => {
    let command
    let parser
    let totalDiskSize = 0

    switch (os.platform()) {
      case 'win32':
        command = 'wmic logicaldisk get DeviceID,VolumeName,Size,FileSystem /format:list'
        parser = (output) => {
          const partitions = output
            .split(/\n\s*\n/)
            .map((item) => {
              const lines = item.split('\n').filter((line) => line.trim() !== '')
              const partitionInfo = {}
              lines.forEach((line) => {
                const [key, value] = line.split('=')
                if (key && value) {
                  partitionInfo[key.trim()] = value.trim()
                }
              })

              const name = partitionInfo.VolumeName || partitionInfo.DeviceID || 'Unknown'
              const size = partitionInfo.Size || 'Unknown'
              const driveLetter = partitionInfo.DeviceID ? partitionInfo.DeviceID.trim() : ''
              const fileSystem = partitionInfo.FileSystem || 'Unknown'

              return {
                Name: name,
                TotalSize: size !== 'Unknown' ? parseInt(size, 10) : 0,
                UsedSize: 0, // Initialize used size to 0
                DriveLetter: driveLetter,
                FileSystem: fileSystem,
                Percentage: 'N/A' // Default to N/A for now
              }
            })
            .filter((partition) => partition.TotalSize > 0) // Filter out partitions with unknown or zero total size

          // Calculate total disk size (sum of all partition sizes)
          totalDiskSize = partitions.reduce((total, partition) => {
            return total + partition.TotalSize
          }, 0)

          // Now calculate used sizes and percentages
          calculateUsedSizes(partitions, () => {
            resolve(partitions)
          })
        }
        break
      case 'darwin':
        command = 'diskutil list -plist'
        parser = (output) => {
          const plist = require('plist')
          const data = plist.parse(output)
          const partitions = []

          data.AllDisksAndPartitions.forEach((disk) => {
            if (disk.Size && disk.Size !== 'Unknown') {
              totalDiskSize += parseInt(disk.Size, 10)
            }
          })

          data.AllDisksAndPartitions.forEach((disk) => {
            if (disk.Partitions) {
              disk.Partitions.forEach((partition) => {
                const name = partition.VolumeName || partition.DeviceIdentifier || 'Unknown'
                const size = partition.Size || 'Unknown'
                const fileSystem = partition.Content || 'Unknown'

                partitions.push({
                  Name: name,
                  TotalSize: size !== 'Unknown' ? parseInt(size, 10) : 0,
                  UsedSize: 0, // Initialize used size to 0
                  FileSystem: fileSystem,
                  Percentage: 'N/A' // Default to N/A for now
                })
              })
            }
          })

          // Calculate total disk size (sum of all partition sizes)
          totalDiskSize = partitions.reduce((total, partition) => {
            return total + partition.TotalSize
          }, 0)

          // Now calculate used sizes and percentages
          calculateUsedSizes(partitions, () => {
            resolve(partitions)
          })
        }
        break
      case 'linux':
        command = 'lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,USED --json'
        parser = (output) => {
          const data = JSON.parse(output)
          const partitions = data.blockdevices
            .filter((device) => {
              return device.mountpoint && device.size && parseInt(device.size, 10) > 0
            })
            .map((device) => {
              const size = device.size || 'Unknown'
              const used = device.used || '0'

              return {
                Name: device.mountpoint || 'Unknown',
                TotalSize: size !== 'Unknown' ? parseInt(size, 10) : 0,
                UsedSize: parseInt(used, 10),
                FileSystem: device.fstype || 'Unknown',
                Percentage: 'N/A' // Default to N/A for now
              }
            })

          // Calculate total disk size (sum of all partition sizes)
          totalDiskSize = partitions.reduce((total, partition) => {
            return total + partition.TotalSize
          }, 0)

          // Now calculate used sizes and percentages
          calculateUsedSizes(partitions, () => {
            resolve(partitions)
          })
        }
        break
      default:
        return reject('Unsupported OS')
    }

    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(`Error: ${err.message}`)
      }
      if (stderr) {
        return reject(`Stderr: ${stderr}`)
      }

      parser(stdout)
    })
  })
})
function calculateUsedSizes(partitions, callback) {
  const promises = partitions.map((partition) => {
    return new Promise((resolve, reject) => {
      switch (os.platform()) {
        case 'win32':
          if (partition.DriveLetter) {
            getUsedSizeWindows(partition.DriveLetter, (usedSize, percentage) => {
              partition.UsedSize = usedSize
              partition.Percentage = percentage
              resolve()
            })
          } else {
            partition.UsedSize = 0
            partition.Percentage = 'N/A'
            resolve()
          }
          break
        case 'darwin':
          // Implement used size calculation for macOS if needed
          partition.UsedSize = 0
          partition.Percentage = 'N/A'
          resolve()
          break
        case 'linux':
          // Implement used size calculation for Linux if needed
          partition.UsedSize = partition.UsedSize || 0 // Use existing UsedSize if available
          partition.Percentage = 'N/A'
          resolve()
          break
        default:
          partition.UsedSize = 0
          partition.Percentage = 'N/A'
          resolve()
          break
      }
    })
  })

  Promise.all(promises)
    .then(() => {
      callback(partitions)
    })
    .catch((err) => {
      console.error(`Error calculating used sizes: ${err}`)
      callback(partitions) // Still invoke callback with partitions to avoid blocking UI
    })
}

let deviceDataCache = null
let cacheTimestamp = null
const CACHE_DURATION = 60000 // Cache duration in milliseconds (e.g., 60 seconds)

ipcMain.handle('getDeviceData', async () => {
  try {
    const currentTime = Date.now()

    // Check if cache is valid
    if (deviceDataCache && currentTime - cacheTimestamp < CACHE_DURATION) {
      console.log('Returning cached device data')
      return deviceDataCache
    }

    // Fetch system information if cache is invalid or expired
    const osInfo = await si.osInfo()
    const system = await si.system()
    const bios = await si.bios()
    const cpu = await si.cpu()
    const memory = await si.mem()
    const gpu = await si.graphics()

    deviceDataCache = {
      deviceName: osInfo.hostname,
      motherboard: `${system.manufacturer} ${system.model}`,
      processor: `${cpu.manufacturer} ${cpu.brand}`,
      ram: `${(memory.total / 1024 ** 3).toFixed(2)} GB`,
      bios: `${bios.vendor} ${bios.version}`,
      gpu: gpu.controllers
        .map((controller) => `${controller.vendor} ${controller.model}`)
        .join(', ') // Combine all GPUs if there are multiple
    }

    cacheTimestamp = currentTime // Update cache timestamp

    return deviceDataCache
  } catch (error) {
    console.error('Error retrieving system information:', error)
    return { error: 'Failed to retrieve system information' }
  }
})
ipcMain.handle('get-processes', async () => {
  return await psList()
})

ipcMain.handle('kill-process', async (event, pid) => {
  if (process.platform === 'win32') {
    const options = {
      name: 'Task Manager'
    }
    sudo.exec(`taskkill /PID ${pid} /F`, options, (error) => {
      if (error) {
        throw error
      }
    })
  } else {
    try {
      process.kill(pid, 'SIGKILL')
    } catch (error) {
      throw error
    }
  }
})

ipcMain.handle('fetch-files', async (event, currentPath) => {
  try {
    if (!currentPath || typeof currentPath !== 'string') {
      throw new Error('Invalid path')
    }

    // Resolve the absolute path
    const absolutePath = path.resolve(currentPath)

    // Check if the path exists
    await fs.access(absolutePath)

    // Read directory contents
    const files = await fs.readdir(absolutePath, { withFileTypes: true })

    // Collect file details, skipping excluded files and directories
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(absolutePath, file.name)
        // Skip excluded files and directories
        if (
          excludeFiles.includes(file.name) ||
          file.name === 'System Volume Information' ||
          (file.isDirectory() && file.name.startsWith('$')) // Skip special Windows directories like $Recycle.Bin
        ) {
          return null
        }
        try {
          const stats = await fs.stat(filePath)
          const fileInfo = {
            name: file.name,
            path: filePath,
            type: file.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          }
          if (!file.isDirectory()) {
            fileInfo.extension = path.extname(file.name).toLowerCase() // Add extension for files
          }

          return fileInfo
        } catch (error) {
          console.error(`Error getting file details for ${filePath}:`, error)
          return null // Handle error case, for example skipping the file
        }
      })
    )

    // Filter out null entries (if any)
    const validFiles = fileDetails.filter((file) => file !== null)

    return validFiles
  } catch (error) {
    console.error('Error fetching files:', error)
    throw error
  }
})
let cachedFiles = {}
let Depth = 0
// Function to fetch files recursively with options
async function fetchFilesRecursive(currentPath, excludeFiles = [], depth = 0, maxDepth = Depth) {
  try {
    if (!currentPath || typeof currentPath !== 'string') {
      throw new Error('Invalid path')
    }

    const absolutePath = path.resolve(currentPath)

    // Check if the path exists
    await fs.access(absolutePath)

    // Read directory contents
    const files = await fs.readdir(absolutePath, { withFileTypes: true })

    // Collect file details, handling recursion for directories
    let fileDetails = []

    for (const file of files) {
      const filePath = path.join(absolutePath, file.name)

      // Skip excluded files and directories
      if (
        excludeFiles.includes(file.name) ||
        file.name === 'System Volume Information' ||
        (file.isDirectory() && file.name.startsWith('$'))
      ) {
        continue
      }

      try {
        const stats = await fs.stat(filePath)
        const fileInfo = {
          name: file.name,
          path: filePath,
          type: file.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        }

        if (!file.isDirectory()) {
          fileInfo.extension = path.extname(file.name).toLowerCase()
        }

        fileDetails.push(fileInfo)

        // If directory and not at max depth, recursively fetch files
        if (file.isDirectory() && depth < maxDepth) {
          const nestedResult = await fetchFilesRecursive(
            filePath,
            excludeFiles,
            depth + 1,
            maxDepth
          )
          fileDetails = fileDetails.concat(nestedResult.fileDetails)
        }
      } catch (error) {
        console.error(`Error getting file details for ${filePath}:`, error)
      }
    }

    return { fileDetails, depth } // Return both fileDetails and depth
  } catch (error) {
    console.error('Error fetching files recursively:', error)
    throw error
  }
}

// Function to filter files by name containing searchTerm
function filterFilesByName(files, searchTerm) {
  return files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
}

// IPC handler for search functionality
ipcMain.handle('search', async (event, searchTerm, currentPath, depth) => {
  try {
    Depth = depth
    console.log(Depth)
    // Fetch files recursively in the current directory, using cached results if available
    let cachedEntry = cachedFiles[currentPath]

    if (!cachedEntry || cachedEntry.depth !== depth) {
      const { fileDetails, depth: fetchedDepth } = await fetchFilesRecursive(
        currentPath,
        [],
        0,
        Depth
      )
      cachedFiles[currentPath] = { fileDetails, depth: fetchedDepth } // Cache the fetched files with depth
    }

    // Retrieve files from cache
    let files = cachedFiles[currentPath].fileDetails

    // If searchTerm is provided, filter files by name containing searchTerm
    if (searchTerm && typeof searchTerm === 'string') {
      files = filterFilesByName(files, searchTerm)
    }

    return files
  } catch (error) {
    console.error('Error searching files:', error)
    throw error
  }
})

// Additional strategies (examples):

// Example: Implementing pagination or chunking
async function fetchFilesWithPagination(currentPath, pageNumber, pageSize) {
  try {
    const start = (pageNumber - 1) * pageSize
    const end = start + pageSize

    let files = cachedFiles[currentPath]
    if (!files) {
      files = await fetchFilesRecursive(currentPath, [], 0, Depth) // Example limit recursion to 2 levels
      cachedFiles[currentPath] = files // Cache the fetched files
    }

    return files.slice(start, end)
  } catch (error) {
    console.error('Error fetching files with pagination:', error)
    throw error
  }
}

// Example: Throttling file system operations
async function fetchFilesThrottled(currentPath) {
  try {
    let files = cachedFiles[currentPath]
    if (!files) {
      files = await fetchFilesRecursive(currentPath, [], 0, Depth) // Example limit recursion to 2 levels
      cachedFiles[currentPath] = files // Cache the fetched files
    }

    // Simulate throttling with a delay (adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, 100))

    return files
  } catch (error) {
    console.error('Error fetching files with throttling:', error)
    throw error
  }
}

// Example: Caching or memoization
async function fetchFilesCached(currentPath) {
  try {
    let files = cachedFiles[currentPath]
    if (!files) {
      files = await fetchFilesRecursive(currentPath, [], 0, Depth) // Example limit recursion to 2 levels
      cachedFiles[currentPath] = files // Cache the fetched files
    }

    return files
  } catch (error) {
    console.error('Error fetching files with caching:', error)
    throw error
  }
}

ipcMain.handle('open-file', async (event, path) => {
  try {
    shell.openPath(path)
  } catch {}
})
function getUsedSizeWindows(driveLetter, callback) {
  exec(
    `wmic logicaldisk where DeviceID="${driveLetter}" get Size,FreeSpace /format:list`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err.message}`)
        callback('Unknown', 'N/A')
        return
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`)
        callback('Unknown', 'N/A')
        return
      }

      const lines = stdout.trim().split('\n')
      if (lines.length < 2) {
        callback('Unknown', 'N/A')
        return
      }

      let size = 'Unknown'
      let freeSpace = 'Unknown'

      lines.forEach((line) => {
        const parts = line.split('=')
        if (parts.length === 2) {
          const key = parts[0].trim()
          const value = parts[1].trim()
          if (key === 'Size') {
            size = parseInt(value, 10)
          } else if (key === 'FreeSpace') {
            freeSpace = parseInt(value, 10)
          }
        }
      })

      if (size === 'Unknown' || freeSpace === 'Unknown') {
        callback('Unknown', 'N/A')
      } else {
        const usedSize = size - freeSpace
        const percentage = ((usedSize / size) * 100).toFixed(2) + '%'
        callback(usedSize, percentage)
      }
    }
  )
}

app.on('ready', async () => {
  try {
    await loadModules()
    await createWindow()
  } catch (error) {
    console.error('Error loading window:', error)
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
