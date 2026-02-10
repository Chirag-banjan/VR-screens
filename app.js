// Initialize Dashboard Charts
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    createGridTexture();
    initializeClock();
});

// Live Clock Functions
function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();

    // Format time with seconds
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);

    // Calculate day of year
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Calculate week number
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / oneDay);
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Update DOM elements
    const timeEl = document.getElementById('live-time');
    const dateEl = document.getElementById('live-date');
    const timezoneEl = document.getElementById('timezone');
    const dayOfYearEl = document.getElementById('day-of-year');
    const weekNumberEl = document.getElementById('week-number');

    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
    if (timezoneEl) timezoneEl.textContent = timezone.split('/').pop().replace('_', ' ');
    if (dayOfYearEl) dayOfYearEl.textContent = dayOfYear;
    if (weekNumberEl) weekNumberEl.textContent = `Week ${weekNumber}`;
}

// Chart.js Configuration
function initializeCharts() {
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#a0aec0',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#a0aec0' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#a0aec0' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };

    // Sales Chart - Line Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales 2024',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Sales 2023',
                data: [10000, 15000, 13000, 20000, 18000, 24000],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: commonOptions
    });

    // Traffic Chart - Bar Chart
    const trafficCtx = document.getElementById('trafficChart').getContext('2d');
    new Chart(trafficCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Visitors',
                data: [1200, 1900, 1500, 2500, 2200, 1800, 1400],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(0, 212, 255, 0.8)'
                ],
                borderRadius: 8
            }]
        },
        options: commonOptions
    });

    // Category Chart - Doughnut Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#00d4ff',
                    '#7c3aed',
                    '#4CAF50',
                    '#FF9800',
                    '#f44336'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            family: "'Segoe UI', sans-serif"
                        }
                    }
                }
            }
        }
    });
}

// Create Grid Texture for VR Floor
function createGridTexture() {
    const canvas = document.getElementById('gridTexture');
    if (!canvas) return;

    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 64, 64);

    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    ctx.lineWidth = 1;

    // Draw grid lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(64, 0);
    ctx.lineTo(64, 64);
    ctx.lineTo(0, 64);
    ctx.lineTo(0, 0);
    ctx.stroke();
}

// VR State
let currentVRSection = null;
let vrControlsInitialized = false;
let vrClockInterval = null; // For dynamic VR clock updates

// VR Camera Controls (Zoom & Pan)
const vrCameraControls = {
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0,
    zoomSpeed: 0.5,
    panSpeed: 0.005,

    init() {
        if (vrControlsInitialized) return;

        const vrView = document.getElementById('vr-view');
        const scene = document.getElementById('vr-scene');

        // Zoom with scroll wheel
        vrView.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e);
        }, { passive: false });

        // Pan with middle mouse button or Shift+Left click
        vrView.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                this.isPanning = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                vrView.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.handlePan(e);
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 1 || e.button === 0) {
                this.isPanning = false;
                document.getElementById('vr-view').style.cursor = 'default';
            }
        });

        // Prevent context menu on middle click
        vrView.addEventListener('contextmenu', (e) => {
            if (this.isPanning) e.preventDefault();
        });

        vrControlsInitialized = true;
    },

    handleZoom(event) {
        const rig = document.getElementById('rig');
        if (!rig) return;

        const camera = rig.querySelector('a-camera');
        if (!camera) return;

        // Get current position
        const position = rig.getAttribute('position');

        // Get camera's forward direction
        const rotation = camera.getAttribute('rotation');
        const pitch = THREE.MathUtils.degToRad(rotation.x);
        const yaw = THREE.MathUtils.degToRad(rotation.y);

        // Calculate forward vector
        const forward = {
            x: -Math.sin(yaw) * Math.cos(pitch),
            y: Math.sin(pitch),
            z: -Math.cos(yaw) * Math.cos(pitch)
        };

        // Zoom direction based on scroll
        const zoomDelta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;

        // Update position
        position.x += forward.x * zoomDelta;
        position.y += forward.y * zoomDelta;
        position.z += forward.z * zoomDelta;

        // Clamp Y to prevent going below floor
        position.y = Math.max(0.5, position.y);

        rig.setAttribute('position', position);
    },

    handlePan(event) {
        const rig = document.getElementById('rig');
        if (!rig) return;

        const camera = rig.querySelector('a-camera');
        if (!camera) return;

        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        // Get current position and rotation
        const position = rig.getAttribute('position');
        const rotation = camera.getAttribute('rotation');
        const yaw = THREE.MathUtils.degToRad(rotation.y);

        // Calculate right and up vectors based on camera orientation
        const right = {
            x: Math.cos(yaw),
            z: -Math.sin(yaw)
        };

        // Pan horizontally (left/right)
        position.x -= right.x * deltaX * this.panSpeed;
        position.z -= right.z * deltaX * this.panSpeed;

        // Pan vertically (up/down)
        position.y += deltaY * this.panSpeed;

        // Clamp Y to prevent going below floor
        position.y = Math.max(0.5, position.y);

        rig.setAttribute('position', position);
    },

    reset() {
        const rig = document.getElementById('rig');
        if (rig) {
            // Different position based on whether viewing single panel or command center
            const isCommandCenter = document.getElementById('starfield') !== null;
            if (isCommandCenter) {
                rig.setAttribute('position', '0 1.6 0');
            } else {
                rig.setAttribute('position', '0 1.6 2.5');
            }
        }
        const camera = document.querySelector('#rig a-camera');
        if (camera) {
            camera.setAttribute('rotation', '0 0 0');
        }
    }
};

// Open Section in VR
async function openInVR(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }

    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('hidden');

    try {
        console.log('Opening section in VR:', sectionId);

        // Check if this is the clock section - use dynamic clock instead
        if (sectionId === 'section-clock') {
            const container = document.getElementById('vr-panel-container');
            container.innerHTML = '';
            createDynamicVRClock(container, false);
        } else {
            // Capture the section as an image
            const canvas = await html2canvas(section, {
                backgroundColor: '#1a1a2e',
                scale: 2, // Higher quality
                logging: true, // Enable logging for debugging
                useCORS: true,
                allowTaint: true,
                // Clone the document to properly capture canvas elements
                onclone: (clonedDoc) => {
                    // Find all canvas elements in original and copy their content
                    const originalCanvases = section.querySelectorAll('canvas');
                    const clonedSection = clonedDoc.getElementById(sectionId);
                    const clonedCanvases = clonedSection ? clonedSection.querySelectorAll('canvas') : [];

                    originalCanvases.forEach((originalCanvas, index) => {
                        if (clonedCanvases[index]) {
                            const clonedCanvas = clonedCanvases[index];
                            const ctx = clonedCanvas.getContext('2d');
                            clonedCanvas.width = originalCanvas.width;
                            clonedCanvas.height = originalCanvas.height;
                            ctx.drawImage(originalCanvas, 0, 0);
                        }
                    });
                }
            });

            console.log('Canvas captured:', canvas.width, 'x', canvas.height);

            // Convert to data URL
            const imageDataUrl = canvas.toDataURL('image/png');
            console.log('Image data URL length:', imageDataUrl.length);

            // Create VR panel with the captured image
            createVRPanel(imageDataUrl, canvas.width, canvas.height);
        }

        // Hide dashboard, show VR
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('vr-view').classList.remove('hidden');

        // Store current section for reference
        currentVRSection = sectionId;

        // Initialize VR controls and reset camera
        vrCameraControls.init();
        vrCameraControls.reset();

        // Trigger A-Frame scene resize to ensure proper rendering
        const scene = document.getElementById('vr-scene');
        if (scene && scene.resize) {
            scene.resize();
        }
        // Also trigger window resize event for A-Frame
        window.dispatchEvent(new Event('resize'));

        // Small delay to ensure A-Frame scene is ready
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            // Resize again after panel is created
            window.dispatchEvent(new Event('resize'));
        }, 500);

    } catch (error) {
        console.error('Error capturing section:', error);
        loadingOverlay.classList.add('hidden');
        alert('Failed to capture section for VR view. Please try again.');
    }
}

// Create VR Panel with Captured Image
function createVRPanel(imageDataUrl, width, height) {
    const container = document.getElementById('vr-panel-container');

    // Clear existing panels
    container.innerHTML = '';

    // Calculate panel dimensions (maintain aspect ratio, fit in view)
    const aspectRatio = height / width;
    const maxWidth = 2.5; // meters - sized to fit comfortably in view
    const maxHeight = 2; // max height to prevent panel going out of view

    let panelWidth = maxWidth;
    let panelHeight = maxWidth * aspectRatio;

    // If too tall, scale down to fit
    if (panelHeight > maxHeight) {
        panelHeight = maxHeight;
        panelWidth = maxHeight / aspectRatio;
    }

    // Create the panel entity
    const panel = document.createElement('a-entity');
    panel.setAttribute('id', 'vr-dashboard-panel');

    // Main panel background with glow effect
    const bgPanel = document.createElement('a-plane');
    bgPanel.setAttribute('width', panelWidth + 0.1);
    bgPanel.setAttribute('height', panelHeight + 0.1);
    bgPanel.setAttribute('position', '0 0 -0.02');
    bgPanel.setAttribute('material', 'color: #00d4ff; opacity: 0.3; shader: flat');
    panel.appendChild(bgPanel);

    // Main panel with image - create using A-Frame image entity
    const mainPanel = document.createElement('a-image');
    mainPanel.setAttribute('width', panelWidth);
    mainPanel.setAttribute('height', panelHeight);
    mainPanel.setAttribute('position', '0 0 0');
    mainPanel.setAttribute('src', imageDataUrl);
    panel.appendChild(mainPanel);

    // Log for debugging
    console.log('VR Panel created with dimensions:', panelWidth, 'x', panelHeight);

    // Use a slight delay to ensure everything is rendered
    setTimeout(() => {

        // Frame corners for futuristic look
        const cornerSize = 0.15;
        const corners = [
            { x: -panelWidth/2, y: panelHeight/2, rot: '0 0 0' },
            { x: panelWidth/2, y: panelHeight/2, rot: '0 0 90' },
            { x: panelWidth/2, y: -panelHeight/2, rot: '0 0 180' },
            { x: -panelWidth/2, y: -panelHeight/2, rot: '0 0 270' }
        ];

        corners.forEach((corner, i) => {
            const cornerEl = document.createElement('a-entity');
            cornerEl.setAttribute('position', `${corner.x} ${corner.y} 0.01`);
            cornerEl.setAttribute('rotation', corner.rot);

            const line1 = document.createElement('a-plane');
            line1.setAttribute('width', cornerSize);
            line1.setAttribute('height', '0.02');
            line1.setAttribute('position', `${cornerSize/2} 0 0`);
            line1.setAttribute('material', 'color: #00d4ff; shader: flat');
            cornerEl.appendChild(line1);

            const line2 = document.createElement('a-plane');
            line2.setAttribute('width', '0.02');
            line2.setAttribute('height', cornerSize);
            line2.setAttribute('position', `0 ${-cornerSize/2} 0`);
            line2.setAttribute('material', 'color: #00d4ff; shader: flat');
            cornerEl.appendChild(line2);

            panel.appendChild(cornerEl);
        });

        // Add title text above panel
        const title = document.createElement('a-text');
        title.setAttribute('value', 'ANALYTICS DASHBOARD - VR VIEW');
        title.setAttribute('position', `0 ${panelHeight/2 + 0.15} 0`);
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#00d4ff');
        title.setAttribute('width', '3');
        panel.appendChild(title);

        // Add subtle floating particles for ambiance (positioned around but not blocking view)
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('a-sphere');
            const angle = (i / 10) * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            const x = Math.cos(angle) * radius;
            const y = 0.5 + Math.random() * 2;
            const z = Math.sin(angle) * radius - 1;
            particle.setAttribute('position', `${x} ${y} ${z}`);
            particle.setAttribute('radius', '0.03');
            particle.setAttribute('material', 'color: #00d4ff; opacity: 0.4; shader: flat');
            particle.setAttribute('animation', `property: position; to: ${x} ${y + 0.3} ${z}; dur: ${3000 + Math.random() * 2000}; dir: alternate; loop: true; easing: easeInOutSine`);
            container.appendChild(particle);
        }
    }, 200);

    container.appendChild(panel);
}

// Create Dynamic VR Clock Panel (updates in real-time)
function createDynamicVRClock(container, isCommandCenter = false) {
    const clockEntity = document.createElement('a-entity');
    clockEntity.setAttribute('id', 'vr-dynamic-clock');

    // Panel dimensions
    const panelWidth = isCommandCenter ? 1.6 : 2.5;
    const panelHeight = isCommandCenter ? 1.2 : 1.8;

    // Background panel
    const bgPanel = document.createElement('a-plane');
    bgPanel.setAttribute('width', panelWidth + 0.1);
    bgPanel.setAttribute('height', panelHeight + 0.1);
    bgPanel.setAttribute('position', '0 0 -0.02');
    bgPanel.setAttribute('material', 'color: #7c3aed; opacity: 0.3; shader: flat');
    bgPanel.setAttribute('animation', 'property: material.opacity; from: 0.2; to: 0.4; dur: 1000; dir: alternate; loop: true');
    clockEntity.appendChild(bgPanel);

    // Main panel
    const mainPanel = document.createElement('a-plane');
    mainPanel.setAttribute('width', panelWidth);
    mainPanel.setAttribute('height', panelHeight);
    mainPanel.setAttribute('position', '0 0 0');
    mainPanel.setAttribute('material', 'color: #1a1a2e; opacity: 0.95; shader: flat');
    clockEntity.appendChild(mainPanel);

    // Time display (large)
    const timeText = document.createElement('a-text');
    timeText.setAttribute('id', 'vr-clock-time');
    timeText.setAttribute('value', '00:00:00');
    timeText.setAttribute('position', `0 ${panelHeight * 0.15} 0.01`);
    timeText.setAttribute('align', 'center');
    timeText.setAttribute('color', '#00d4ff');
    timeText.setAttribute('width', isCommandCenter ? '3' : '5');
    timeText.setAttribute('font', 'monoid');
    clockEntity.appendChild(timeText);

    // Seconds indicator ring
    const secondsRing = document.createElement('a-ring');
    secondsRing.setAttribute('id', 'vr-clock-ring');
    secondsRing.setAttribute('radius-inner', isCommandCenter ? '0.35' : '0.55');
    secondsRing.setAttribute('radius-outer', isCommandCenter ? '0.4' : '0.6');
    secondsRing.setAttribute('position', `0 ${panelHeight * 0.15} 0.01`);
    secondsRing.setAttribute('material', 'color: #00d4ff; opacity: 0.5; shader: flat; side: double');
    secondsRing.setAttribute('theta-length', '0');
    clockEntity.appendChild(secondsRing);

    // Date display
    const dateText = document.createElement('a-text');
    dateText.setAttribute('id', 'vr-clock-date');
    dateText.setAttribute('value', 'Loading...');
    dateText.setAttribute('position', `0 ${-panelHeight * 0.1} 0.01`);
    dateText.setAttribute('align', 'center');
    dateText.setAttribute('color', '#a0aec0');
    dateText.setAttribute('width', isCommandCenter ? '2' : '3');
    clockEntity.appendChild(dateText);

    // Additional info
    const infoText = document.createElement('a-text');
    infoText.setAttribute('id', 'vr-clock-info');
    infoText.setAttribute('value', '');
    infoText.setAttribute('position', `0 ${-panelHeight * 0.3} 0.01`);
    infoText.setAttribute('align', 'center');
    infoText.setAttribute('color', '#7c3aed');
    infoText.setAttribute('width', isCommandCenter ? '1.5' : '2.5');
    clockEntity.appendChild(infoText);

    // Label
    const label = document.createElement('a-text');
    label.setAttribute('value', 'LIVE TIME');
    label.setAttribute('position', `0 ${panelHeight/2 + 0.1} 0.01`);
    label.setAttribute('align', 'center');
    label.setAttribute('color', '#00d4ff');
    label.setAttribute('width', isCommandCenter ? '1.5' : '2.5');
    clockEntity.appendChild(label);

    // Corner accents
    createPanelCorners(clockEntity, panelWidth, panelHeight);

    // Pulsing glow effect
    const glowRing = document.createElement('a-ring');
    glowRing.setAttribute('radius-inner', isCommandCenter ? '0.5' : '0.75');
    glowRing.setAttribute('radius-outer', isCommandCenter ? '0.55' : '0.8');
    glowRing.setAttribute('position', `0 ${panelHeight * 0.15} 0.005`);
    glowRing.setAttribute('material', 'color: #00d4ff; opacity: 0.2; shader: flat; side: double');
    glowRing.setAttribute('animation', 'property: scale; from: 1 1 1; to: 1.1 1.1 1; dur: 1000; dir: alternate; loop: true; easing: easeInOutSine');
    clockEntity.appendChild(glowRing);

    container.appendChild(clockEntity);

    // Start the VR clock update interval
    startVRClockUpdates();

    return clockEntity;
}

// Start VR Clock Updates
function startVRClockUpdates() {
    // Clear any existing interval
    if (vrClockInterval) {
        clearInterval(vrClockInterval);
    }

    // Update immediately
    updateVRClock();

    // Update every second
    vrClockInterval = setInterval(updateVRClock, 1000);
}

// Update VR Clock Display
function updateVRClock() {
    const now = new Date();

    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);

    // Calculate additional info
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace('_', ' ');

    // Calculate seconds progress for ring (0-360 degrees)
    const secondsProgress = (now.getSeconds() / 60) * 360;

    // Update A-Frame elements
    const timeEl = document.getElementById('vr-clock-time');
    const dateEl = document.getElementById('vr-clock-date');
    const infoEl = document.getElementById('vr-clock-info');
    const ringEl = document.getElementById('vr-clock-ring');

    if (timeEl) timeEl.setAttribute('value', timeString);
    if (dateEl) dateEl.setAttribute('value', dateString);
    if (infoEl) infoEl.setAttribute('value', `Day ${dayOfYear} | ${timezone}`);
    if (ringEl) ringEl.setAttribute('theta-length', secondsProgress);
}

// Stop VR Clock Updates
function stopVRClockUpdates() {
    if (vrClockInterval) {
        clearInterval(vrClockInterval);
        vrClockInterval = null;
    }
}

// Exit VR View
function exitVR() {
    // Stop dynamic clock updates
    stopVRClockUpdates();
    // Hide VR, show dashboard
    document.getElementById('vr-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');

    // Clear VR panel
    const container = document.getElementById('vr-panel-container');
    container.innerHTML = '';

    currentVRSection = null;
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    const vrView = document.getElementById('vr-view');
    const isVRActive = !vrView.classList.contains('hidden');

    if (event.key === 'Escape' && isVRActive) {
        exitVR();
    }

    // Keyboard zoom controls when in VR mode
    if (isVRActive) {
        const rig = document.getElementById('rig');
        if (!rig) return;

        const position = rig.getAttribute('position');
        const camera = rig.querySelector('a-camera');
        const rotation = camera ? camera.getAttribute('rotation') : { x: 0, y: 0 };
        const yaw = THREE.MathUtils.degToRad(rotation.y);
        const pitch = THREE.MathUtils.degToRad(rotation.x);

        const zoomAmount = 0.3;

        // Zoom in with + or =
        if (event.key === '+' || event.key === '=') {
            position.x += -Math.sin(yaw) * Math.cos(pitch) * zoomAmount;
            position.y += Math.sin(pitch) * zoomAmount;
            position.z += -Math.cos(yaw) * Math.cos(pitch) * zoomAmount;
            position.y = Math.max(0.5, position.y);
            rig.setAttribute('position', position);
        }

        // Zoom out with - or _
        if (event.key === '-' || event.key === '_') {
            position.x -= -Math.sin(yaw) * Math.cos(pitch) * zoomAmount;
            position.y -= Math.sin(pitch) * zoomAmount;
            position.z -= -Math.cos(yaw) * Math.cos(pitch) * zoomAmount;
            position.y = Math.max(0.5, position.y);
            rig.setAttribute('position', position);
        }

        // Reset camera with R
        if (event.key === 'r' || event.key === 'R') {
            vrCameraControls.reset();
        }
    }
});

// Animate KPI values on load
function animateValue(elementId, start, end, duration, prefix = '', suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTimestamp = performance.now();

    const step = (timestamp) => {
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = prefix + value.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };

    requestAnimationFrame(step);
}

// Animate KPIs when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        animateValue('kpi-revenue', 0, 124500, 1500, '$');
        animateValue('kpi-users', 0, 8420, 1500);
        animateValue('kpi-orders', 0, 1250, 1500);
    }, 300);
});

// Section configurations for VR layout
const sectionConfigs = [
    { id: 'section-kpis', label: 'KPI Dashboard' },
    { id: 'section-sales', label: 'Sales Overview' },
    { id: 'section-traffic', label: 'Website Traffic' },
    { id: 'section-categories', label: 'Sales Categories' },
    { id: 'section-progress', label: 'Goals Progress' },
    { id: 'section-activity', label: 'Recent Activity' },
    { id: 'section-clock', label: 'Live Time' }
];

// Open All Sections in VR - Immersive Command Center
async function openAllInVR() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('hidden');

    try {
        console.log('Capturing all sections for VR Command Center...');

        // Capture all sections
        const capturedPanels = [];

        for (const config of sectionConfigs) {
            const section = document.getElementById(config.id);
            if (!section) continue;

            const canvas = await html2canvas(section, {
                backgroundColor: '#1a1a2e',
                scale: 1.5,
                logging: false,
                useCORS: true,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    const originalCanvases = section.querySelectorAll('canvas');
                    const clonedSection = clonedDoc.getElementById(config.id);
                    const clonedCanvases = clonedSection ? clonedSection.querySelectorAll('canvas') : [];

                    originalCanvases.forEach((originalCanvas, index) => {
                        if (clonedCanvases[index]) {
                            const clonedCanvas = clonedCanvases[index];
                            const ctx = clonedCanvas.getContext('2d');
                            clonedCanvas.width = originalCanvas.width;
                            clonedCanvas.height = originalCanvas.height;
                            ctx.drawImage(originalCanvas, 0, 0);
                        }
                    });
                }
            });

            capturedPanels.push({
                ...config,
                imageDataUrl: canvas.toDataURL('image/png'),
                width: canvas.width,
                height: canvas.height
            });
        }

        console.log(`Captured ${capturedPanels.length} panels`);

        // Create immersive VR command center
        createVRCommandCenter(capturedPanels);

        // Hide dashboard, show VR
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('vr-view').classList.remove('hidden');

        // Initialize VR controls
        vrCameraControls.init();

        // Position camera for command center view
        const rig = document.getElementById('rig');
        if (rig) {
            rig.setAttribute('position', '0 1.6 0');
        }

        // Trigger resize
        window.dispatchEvent(new Event('resize'));

        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            window.dispatchEvent(new Event('resize'));
        }, 800);

    } catch (error) {
        console.error('Error creating VR Command Center:', error);
        loadingOverlay.classList.add('hidden');
        alert('Failed to create VR Command Center. Please try again.');
    }
}

// Create Immersive VR Command Center with curved panel layout
function createVRCommandCenter(panels) {
    const container = document.getElementById('vr-panel-container');
    container.innerHTML = '';

    // Reset container position for command center
    container.setAttribute('position', '0 0 0');

    // Create environment enhancements
    createEnhancedEnvironment(container);

    // Calculate curved layout parameters
    const curveRadius = 4; // Distance from center
    // Adjust spacing based on number of panels (narrower spacing for more panels)
    const panelSpacing = Math.min(Math.PI / 4, Math.PI / (panels.length * 0.6));
    const startAngle = -Math.PI / 2 - (panelSpacing * (panels.length - 1) / 2); // Center the panels
    const panelYPosition = 2.2; // Eye level position (camera at 1.6, panels slightly above)

    // Create panels in curved arrangement
    panels.forEach((panelData, index) => {
        const angle = startAngle + (index * panelSpacing);

        // Calculate position on curve
        const x = Math.sin(angle) * curveRadius;
        const z = -Math.cos(angle) * curveRadius;
        const rotationY = (angle * 180 / Math.PI); // Face toward center

        // Create panel group
        const panelGroup = document.createElement('a-entity');
        panelGroup.setAttribute('position', `${x} ${panelYPosition} ${z}`);
        panelGroup.setAttribute('rotation', `0 ${rotationY} 0`);

        // Check if this is the clock panel - use dynamic clock
        if (panelData.id === 'section-clock') {
            createDynamicVRClock(panelGroup, true);
            container.appendChild(panelGroup);
            return; // Skip the rest for clock panel
        }

        // Calculate panel size
        const aspectRatio = panelData.height / panelData.width;
        const panelWidth = 1.6;
        const panelHeight = Math.min(panelWidth * aspectRatio, 1.4);

        // Glowing frame
        const frame = document.createElement('a-plane');
        frame.setAttribute('width', panelWidth + 0.08);
        frame.setAttribute('height', panelHeight + 0.08);
        frame.setAttribute('position', '0 0 -0.02');
        frame.setAttribute('material', 'color: #00d4ff; opacity: 0.4; shader: flat');
        frame.setAttribute('animation', 'property: material.opacity; from: 0.3; to: 0.6; dur: 2000; dir: alternate; loop: true');
        panelGroup.appendChild(frame);

        // Main panel with image
        const mainPanel = document.createElement('a-image');
        mainPanel.setAttribute('width', panelWidth);
        mainPanel.setAttribute('height', panelHeight);
        mainPanel.setAttribute('position', '0 0 0');
        mainPanel.setAttribute('src', panelData.imageDataUrl);
        panelGroup.appendChild(mainPanel);

        // Panel label
        const label = document.createElement('a-text');
        label.setAttribute('value', panelData.label.toUpperCase());
        label.setAttribute('position', `0 ${-panelHeight/2 - 0.15} 0`);
        label.setAttribute('align', 'center');
        label.setAttribute('color', '#00d4ff');
        label.setAttribute('width', '2');
        panelGroup.appendChild(label);

        // Corner accents
        createPanelCorners(panelGroup, panelWidth, panelHeight);

        container.appendChild(panelGroup);
    });

    // Create center title hologram
    createCenterHologram(container);

    // Create ambient particles
    createAmbientParticles(container);
}

// Create enhanced VR environment
function createEnhancedEnvironment(container) {
    // Update sky with gradient (using a darker shade)
    const sky = document.querySelector('a-sky');
    if (sky) {
        sky.setAttribute('color', '#0a0a1a');
    }

    // Create starfield
    const starfield = document.createElement('a-entity');
    starfield.setAttribute('id', 'starfield');

    for (let i = 0; i < 200; i++) {
        const star = document.createElement('a-sphere');
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 15 + Math.random() * 10;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        star.setAttribute('position', `${x} ${y} ${z}`);
        star.setAttribute('radius', 0.02 + Math.random() * 0.03);
        star.setAttribute('material', `color: white; opacity: ${0.3 + Math.random() * 0.7}; shader: flat`);
        star.setAttribute('animation', `property: material.opacity; from: ${0.3 + Math.random() * 0.3}; to: ${0.7 + Math.random() * 0.3}; dur: ${1000 + Math.random() * 2000}; dir: alternate; loop: true`);
        starfield.appendChild(star);
    }
    container.appendChild(starfield);

    // Create glowing floor grid
    const floorGrid = document.createElement('a-entity');
    floorGrid.setAttribute('id', 'floor-grid');

    // Circular floor platform
    const platform = document.createElement('a-circle');
    platform.setAttribute('radius', '8');
    platform.setAttribute('rotation', '-90 0 0');
    platform.setAttribute('position', '0 0.01 0');
    platform.setAttribute('material', 'color: #16213e; opacity: 0.8; shader: flat');
    floorGrid.appendChild(platform);

    // Concentric rings
    for (let r = 1; r <= 6; r++) {
        const ring = document.createElement('a-ring');
        ring.setAttribute('radius-inner', r - 0.02);
        ring.setAttribute('radius-outer', r);
        ring.setAttribute('rotation', '-90 0 0');
        ring.setAttribute('position', '0 0.02 0');
        ring.setAttribute('material', `color: #00d4ff; opacity: ${0.3 - r * 0.04}; shader: flat`);
        floorGrid.appendChild(ring);
    }

    // Radial lines
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const line = document.createElement('a-plane');
        line.setAttribute('width', '6');
        line.setAttribute('height', '0.02');
        line.setAttribute('position', `${Math.sin(angle) * 3} 0.02 ${Math.cos(angle) * 3}`);
        line.setAttribute('rotation', `-90 ${(angle * 180 / Math.PI) + 90} 0`);
        line.setAttribute('material', 'color: #00d4ff; opacity: 0.2; shader: flat');
        floorGrid.appendChild(line);
    }

    container.appendChild(floorGrid);
}

// Create center hologram title
function createCenterHologram(container) {
    const hologram = document.createElement('a-entity');
    hologram.setAttribute('position', '0 3.5 0');

    // Main title
    const title = document.createElement('a-text');
    title.setAttribute('value', 'ANALYTICS COMMAND CENTER');
    title.setAttribute('align', 'center');
    title.setAttribute('color', '#00d4ff');
    title.setAttribute('width', '6');
    title.setAttribute('position', '0 0 0');
    hologram.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('a-text');
    subtitle.setAttribute('value', 'Real-time Dashboard Visualization');
    subtitle.setAttribute('align', 'center');
    subtitle.setAttribute('color', '#7c3aed');
    subtitle.setAttribute('width', '4');
    subtitle.setAttribute('position', '0 -0.3 0');
    hologram.appendChild(subtitle);

    // Decorative ring around text
    const ring = document.createElement('a-ring');
    ring.setAttribute('radius-inner', '1.8');
    ring.setAttribute('radius-outer', '1.85');
    ring.setAttribute('position', '0 0 0');
    ring.setAttribute('material', 'color: #00d4ff; opacity: 0.5; shader: flat; side: double');
    ring.setAttribute('animation', 'property: rotation; from: 0 0 0; to: 0 0 360; dur: 20000; loop: true; easing: linear');
    hologram.appendChild(ring);

    // Outer ring
    const outerRing = document.createElement('a-ring');
    outerRing.setAttribute('radius-inner', '2.1');
    outerRing.setAttribute('radius-outer', '2.15');
    outerRing.setAttribute('position', '0 0 0');
    outerRing.setAttribute('material', 'color: #7c3aed; opacity: 0.3; shader: flat; side: double');
    outerRing.setAttribute('animation', 'property: rotation; from: 0 0 0; to: 0 0 -360; dur: 30000; loop: true; easing: linear');
    hologram.appendChild(outerRing);

    container.appendChild(hologram);
}

// Create corner accents for panels
function createPanelCorners(parent, width, height) {
    const cornerSize = 0.1;
    const corners = [
        { x: -width/2, y: height/2, rot: '0 0 0' },
        { x: width/2, y: height/2, rot: '0 0 90' },
        { x: width/2, y: -height/2, rot: '0 0 180' },
        { x: -width/2, y: -height/2, rot: '0 0 270' }
    ];

    corners.forEach(corner => {
        const cornerEl = document.createElement('a-entity');
        cornerEl.setAttribute('position', `${corner.x} ${corner.y} 0.01`);
        cornerEl.setAttribute('rotation', corner.rot);

        const line1 = document.createElement('a-plane');
        line1.setAttribute('width', cornerSize);
        line1.setAttribute('height', '0.015');
        line1.setAttribute('position', `${cornerSize/2} 0 0`);
        line1.setAttribute('material', 'color: #00d4ff; shader: flat');
        cornerEl.appendChild(line1);

        const line2 = document.createElement('a-plane');
        line2.setAttribute('width', '0.015');
        line2.setAttribute('height', cornerSize);
        line2.setAttribute('position', `0 ${-cornerSize/2} 0`);
        line2.setAttribute('material', 'color: #00d4ff; shader: flat');
        cornerEl.appendChild(line2);

        parent.appendChild(cornerEl);
    });
}

// Create ambient floating particles
function createAmbientParticles(container) {
    const particleContainer = document.createElement('a-entity');
    particleContainer.setAttribute('id', 'ambient-particles');

    // Floating particles around the room
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('a-sphere');
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 5;
        const x = Math.cos(angle) * radius;
        const y = 0.5 + Math.random() * 3;
        const z = Math.sin(angle) * radius;

        particle.setAttribute('position', `${x} ${y} ${z}`);
        particle.setAttribute('radius', 0.015 + Math.random() * 0.02);

        const colors = ['#00d4ff', '#7c3aed', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.setAttribute('material', `color: ${color}; opacity: ${0.3 + Math.random() * 0.4}; shader: flat`);
        particle.setAttribute('animation', `property: position; to: ${x} ${y + 0.5 + Math.random() * 0.5} ${z}; dur: ${3000 + Math.random() * 4000}; dir: alternate; loop: true; easing: easeInOutSine`);
        particle.setAttribute('animation__opacity', `property: material.opacity; from: 0.2; to: 0.6; dur: ${2000 + Math.random() * 2000}; dir: alternate; loop: true`);

        particleContainer.appendChild(particle);
    }

    // Add some larger glowing orbs
    for (let i = 0; i < 5; i++) {
        const orb = document.createElement('a-sphere');
        const angle = (i / 5) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        orb.setAttribute('position', `${x} 2.5 ${z}`);
        orb.setAttribute('radius', '0.08');
        orb.setAttribute('material', 'color: #00d4ff; opacity: 0.3; shader: flat');
        orb.setAttribute('animation', `property: position; to: ${x} 3 ${z}; dur: 4000; dir: alternate; loop: true; easing: easeInOutSine`);

        particleContainer.appendChild(orb);
    }

    container.appendChild(particleContainer);
}

// Export functions for global access
window.openInVR = openInVR;
window.openAllInVR = openAllInVR;
window.exitVR = exitVR;
