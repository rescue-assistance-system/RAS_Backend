let socket
let map
let marker
let watchId
let isSharing = false

// Initialize map
function initMap() {
    map = L.map('map').setView([0, 0], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map)
}

// Connect to socket
function connect() {
    const userId = document.getElementById('userId').value
    console.log(userId)
    if (!userId) {
        log('Please enter a user ID')
        return
    }

    socket = io('http://localhost:8081', {
        transports: ['websocket']
    })

    socket.on('connect', () => {
        updateConnectionStatus(true)
        socket.emit('register', { userId: userId })
        console.log('Connected successfully with UserID:', userId)
        log('Connected to server')
    })

    socket.on('register_response', (data) => {
        console.log('Registration successful for UserID:', userId)
        log('Registration response:', data)
    })

    socket.on('ask_location', (data) => {
        log('Location requested by:', data.fromId)
        if (isSharing) {
            shareLocation(data.fromId)
        }
    })

    socket.on('location_response', (data) => {
        log('Received location:', data)
        updateMap(data.latitude, data.longitude)
    })

    socket.on('disconnect', () => {
        updateConnectionStatus(false)
        log('Disconnected from server')
    })
}

// Disconnect from socket
function disconnect() {
    if (socket) {
        socket.disconnect()
        stopSharing()
    }
}

// Request location from a user
function requestLocation() {
    const fromId = document.getElementById('userId').value
    const toId = document.getElementById('targetId').value

    if (!socket || !toId) {
        log('Please connect and enter target ID')
        return
    }

    socket.emit('ask_location', {
        fromId: fromId,
        toId: toId
    })
    log('Location request sent to:', toId)
}

// Share location
function shareLocation(toId) {
    if (!socket) {
        log('Please connect first')
        return
    }

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const locationData = {
                    fromId: document.getElementById('userId').value,
                    toId: toId || document.getElementById('targetId').value,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
                socket.emit('location_response', locationData)
                updateMap(position.coords.latitude, position.coords.longitude)
                log('Location shared:', locationData)
            },
            (error) => {
                log('Geolocation error:', error)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
        isSharing = true
    }
}

// Stop sharing location
function stopSharing() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
    }
    isSharing = false
    log('Location sharing stopped')
}

// Update map marker
function updateMap(lat, lng) {
    const position = [lat, lng]
    if (!marker) {
        marker = L.marker(position).addTo(map)
    } else {
        marker.setLatLng(position)
    }
    map.setView(position, 15)
}

// Update connection status UI
function updateConnectionStatus(connected) {
    const dot = document.getElementById('statusDot')
    const status = document.getElementById('connectionStatus')

    dot.className = `status-dot status-${connected ? 'connected' : 'disconnected'}`
    status.textContent = connected ? 'Connected' : 'Disconnected'
}

// Log events
function log(...args) {
    const logElement = document.getElementById('eventLog')
    const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ')
    logElement.innerHTML += `${new Date().toLocaleTimeString()} - ${message}\n`
    logElement.scrollTop = logElement.scrollHeight
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connectBtn').addEventListener('click', connect)
    document.getElementById('disconnectBtn').addEventListener('click', disconnect)
    document.getElementById('requestLocationBtn').addEventListener('click', requestLocation)
    document.getElementById('shareLocationBtn').addEventListener('click', () => shareLocation())
    document.getElementById('stopSharingBtn').addEventListener('click', stopSharing)

    // Initialize map
    initMap()
})
