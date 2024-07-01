const WebSocket = require('ws')
let psList

async function loadModules() {
  psList = (await import('ps-list')).default
}
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', async (ws) => {
  await loadModules()
  console.log('Client connected')

  const sendProcessList = async () => {
    try {
      const processes = await psList()
      ws.send(JSON.stringify(processes))
    } catch (error) {
      console.error('Error fetching processes:', error)
    }
  }

  // Send the initial list of processes
  sendProcessList()

  // Set an interval to send the process list periodically
  const intervalId = setInterval(sendProcessList, 5000)

  ws.on('close', () => {
    console.log('Client disconnected')
    clearInterval(intervalId)
  })
})
