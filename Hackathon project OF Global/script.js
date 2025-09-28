// Global variables
let currentDataIndex = 0;
let currentUser = null;
let farmData = [];

// Load farm data from JSON file
async function loadFarmData() {
  try {
    const response = await fetch('farm-data.json');
    farmData = await response.json();
    console.log('Farm data loaded:', farmData);
  } catch (error) {
    console.warn('Could not load farm-data.json, using fallback data');
    // Fallback data if JSON file not found
    farmData = [
      {
        timestamp: "2025-09-18T08:00:00Z",
        sensor: "Sensor-Field-01",
        moisture: 42,
        nutrients: 4,
        temperature: 24,
        pestRisk: true
      },
      {
        timestamp: "2025-09-18T12:00:00Z",
        sensor: "Sensor-Field-01",
        moisture: 28,
        nutrients: 2,
        temperature: 28,
        pestRisk: false
      },
      {
        timestamp: "2025-09-18T16:00:00Z",
        sensor: "Sensor-Field-01",
        moisture: 35,
        nutrients: 3,
        temperature: 26,
        pestRisk: false
      }
    ];
  }
}

// Action definitions
const actions = [
  {
    id: 'water',
    icon: '💧',
    title: 'Irrigate field',
    hint: 'Light spray for 15 minutes',
    condition: data => data.moisture < 35
  },
  {
    id: 'skip-water',
    icon: '🚫',
    title: 'Skip watering',
    hint: 'Soil moisture is adequate',
    condition: data => data.moisture >= 35
  },
  {
    id: 'fertilize',
    icon: '🌾',
    title: 'Apply fertilizer',
    hint: 'NPK blend - 100g per plant',
    condition: data => data.nutrients < 3
  },
  {
    id: 'pest-check',
    icon: '🐛',
    title: 'Pest inspection',
    hint: 'Check leaves and stems',
    condition: data => data.pestRisk
  }
];

// Device list
const devices = [
  { id: 'sensor-01', name: 'Field Sensor A1', status: 'online', signal: '-45 dBm' },
  { id: 'sensor-02', name: 'Weather Station', status: 'online', signal: '-38 dBm' },
  { id: 'sensor-03', name: 'Soil Probe B2', status: 'offline', signal: 'No signal' }
];

// Authentication functions
function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('signupPage').classList.add('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

function showSignup() {
  document.getElementById('signupPage').classList.remove('hidden');
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('signupPage').classList.add('hidden');
}

function logout() {
  currentUser = null;
  showLogin();
}

// Tab navigation
function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update screens
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
}

// Update dashboard with current data
function updateDashboard() {
  if (farmData.length === 0) return;
  
  const data = farmData[currentDataIndex];
  
  document.getElementById('moistureValue').textContent = data.moisture + '%';
  document.getElementById('nutrientValue').textContent = data.nutrients;
  document.getElementById('tempValue').textContent = data.temperature + '°C';
  
  updateActions(data);
}

// Update action recommendations
function updateActions(data) {
  const actionsList = document.getElementById('actionsList');
  actionsList.innerHTML = '';
  
  actions.forEach(action => {
    if (action.condition(data)) {
      const actionElement = document.createElement('div');
      actionElement.className = 'action-item';
      actionElement.innerHTML = `
        <div class="action-content">
          <div class="action-icon">${action.icon}</div>
          <div class="action-text">
            <div class="title">${action.title}</div>
            <div class="hint">${action.hint}</div>
          </div>
        </div>
        <button class="btn btn-primary btn-action" onclick="performAction('${action.id}')">
          Do it
        </button>
      `;
      actionsList.appendChild(actionElement);
    }
  });
}

// Perform action and log it
function performAction(actionId) {
  const timestamp = new Date().toLocaleString();
  const action = actions.find(a => a.id === actionId);
  
  if (action) {
    addLog(`${action.title} - ${action.hint}`, timestamp);
    alert(`Action completed: ${action.title}`);
  }
}

// Add log entry
function addLog(action, timestamp) {
  const logs = JSON.parse(localStorage.getItem('eFarmLogs') || '[]');
  logs.unshift({ action, timestamp });
  localStorage.setItem('eFarmLogs', JSON.stringify(logs.slice(0, 50))); // Keep last 50 logs
  updateLogsDisplay();
}

// Update logs display
function updateLogsDisplay() {
  const logs = JSON.parse(localStorage.getItem('eFarmLogs') || '[]');
  const logsList = document.getElementById('logsList');
  
  if (logs.length === 0) {
    logsList.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 2rem;">No activity logs yet</div>';
    return;
  }
  
  logsList.innerHTML = logs.map(log => `
    <div class="log-entry">
      <div>
        <div style="font-weight: 600;">${log.action}</div>
        <div style="color: var(--muted); font-size: 0.875rem;">${log.timestamp}</div>
      </div>
    </div>
  `).join('');
}

// Clear all logs function
function clearLogs() {
  if (confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
    localStorage.removeItem('eFarmLogs');
    updateLogsDisplay();
    alert('Activity logs cleared successfully!');
  }
}

// Update devices display
function updateDevicesDisplay() {
  const devicesList = document.getElementById('devicesList');
  
  devicesList.innerHTML = devices.map(device => `
    <div class="device-item">
      <div>
        <div style="font-weight: 600;">${device.name}</div>
        <div style="color: var(--muted); font-size: 0.875rem;">${device.signal}</div>
      </div>
      <div class="status-chip ${device.status === 'online' ? 'status-online' : 'status-offline'}">
        <span>●</span> ${device.status}
      </div>
    </div>
  `).join('');
}

// Scan for devices
function scanDevices() {
  const devicesList = document.getElementById('devicesList');
  devicesList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--muted);">🔍 Scanning for devices...</div>';
  
  setTimeout(() => {
    // Simulate finding new devices
    devices.push({
      id: 'sensor-04',
      name: 'New Field Sensor C1',
      status: 'online',
      signal: '-52 dBm'
    });
    updateDevicesDisplay();
  }, 2000);
}

// Export logs function
function exportLogs() {
  const logs = JSON.parse(localStorage.getItem('eFarmLogs') || '[]');
  const dataStr = JSON.stringify(logs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'efarm-logs.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Create simple charts for analytics
function createAnalyticsCharts() {
  const moistureChart = document.querySelector('.chart-placeholder:nth-child(1)');
  const nutrientChart = document.querySelector('.chart-placeholder:nth-child(2)');
  const growthChart = document.querySelector('.chart-placeholder:nth-child(3)');
  const yieldChart = document.querySelector('.chart-placeholder:nth-child(4)');

  if (moistureChart) {
    moistureChart.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 1rem;">
        <div style="font-weight: 600; text-align: center; color: #374151;">Moisture Trends</div>
        <div style="display: flex; align-items: end; justify-content: space-around; height: 120px;">
          <div style="width: 20px; height: 60%; background: #10b981; border-radius: 4px;"></div>
          <div style="width: 20px; height: 40%; background: #f59e0b; border-radius: 4px;"></div>
          <div style="width: 20px; height: 80%; background: #10b981; border-radius: 4px;"></div>
          <div style="width: 20px; height: 70%; background: #10b981; border-radius: 4px;"></div>
          <div style="width: 20px; height: 50%; background: #ef4444; border-radius: 4px;"></div>
        </div>
        <div style="font-size: 0.75rem; color: #6b7280; text-align: center;">Last 5 readings</div>
      </div>
    `;
  }

  if (nutrientChart) {
    nutrientChart.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1rem;">
        <div style="font-weight: 600; margin-bottom: 1rem; color: #374151;">Nutrient Levels</div>
        <div style="position: relative; width: 80px; height: 80px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(#10b981 0deg 216deg, #e5e7eb 216deg 360deg); display: flex; align-items: center; justify-content: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #10b981;">60%</div>
          </div>
        </div>
        <div style="font-size: 0.75rem; color: #6b7280; text-align: center; margin-top: 0.5rem;">Optimal range</div>
      </div>
    `;
  }

  if (growthChart) {
    growthChart.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 1rem;">
        <div style="font-weight: 600; text-align: center; color: #374151;">Growth Progress</div>
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
          <div style="width: 100%; background: #e5e7eb; height: 12px; border-radius: 6px; margin-bottom: 0.5rem;">
            <div style="width: 75%; background: #10b981; height: 100%; border-radius: 6px;"></div>
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">75%</div>
        </div>
        <div style="font-size: 0.75rem; color: #6b7280; text-align: center;">Expected harvest in 3 weeks</div>
      </div>
    `;
  }

  if (yieldChart) {
    yieldChart.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1rem;">
        <div style="font-weight: 600; margin-bottom: 1rem; color: #374151;">Yield Prediction</div>
        <div style="text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #10b981;">8.2 tons</div>
          <div style="font-size: 0.875rem; color: #6b7280;">Expected yield</div>
          <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #059669;">↑ 15% vs last season</div>
        </div>
      </div>
    `;
  }
}

// Initialize the app
function initializeApp() {
  updateDashboard();
  updateDevicesDisplay();
  updateLogsDisplay();
  createAnalyticsCharts();  // Add this line
  
  // Start data cycling every 15 seconds
  setInterval(() => {
    currentDataIndex = (currentDataIndex + 1) % farmData.length;
    updateDashboard();
  }, 15000);
}

// DOM Content Loaded - Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Load farm data first
  loadFarmData();
  
  // Login form handler
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login attempt:', email); // Debug log
    
    if (email && password) {
      currentUser = { email, name: email.split('@')[0] };
      console.log('User logged in:', currentUser); // Debug log
      showMainApp();
      initializeApp();
    } else {
      alert('Please fill in all fields');
    }
  });

  // Signup form handler
  document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const farm = document.getElementById('signupFarm').value;
    
    console.log('Signup attempt:', email); // Debug log
    
    if (name && email && password && farm) {
      currentUser = { email, name, farm };
      console.log('User signed up:', currentUser); // Debug log
      showMainApp();
      initializeApp();
    } else {
      alert('Please fill in all fields');
    }
  });
});