  // Simple screen navigation
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
  }

  // Mark action cards done (persist in localStorage)
  function markDone(cardId){
    const el = document.getElementById(cardId);
    if(!el) return;
    el.classList.toggle('done');
    const done = el.classList.contains('done');
    localStorage.setItem('done_'+cardId, done ? '1' : '0');
  }
  // Restore done states and paired sensor
  function restoreState(){
    ['card-1','card-2','card-3'].forEach(id=>{
      if(localStorage.getItem('done_'+id)==='1'){
        const el = document.getElementById(id);
        if(el) el.classList.add('done');
      }
    });
    const paired = localStorage.getItem('pairedSensor');
    if(paired){
      document.getElementById('paired-status').textContent = 'Sensor: ' + paired;
    }
  }

  // Demo scanning / pairing
  function startScan(){
    const area = document.getElementById('scanArea');
    const btn = document.getElementById('scanBtn');
    btn.disabled = true; btn.textContent = 'Scanning...';
    area.innerHTML = '<div class="muted">Searching for nearby sensors…</div>';
    // In real app: launch Web Bluetooth or native BLE scan. Here we simulate
    setTimeout(()=>{
      showDevices(['Sensor-Field-01','SoilProbe-23','LoRa-GW-7']);
      btn.disabled = false; btn.textContent = 'Scan for devices';
    }, 1400);
  }
  function simulateScan(){
    showDevices(['SIM-Sensor-01','SIM-Sensor-02']);
  }
  function showDevices(list){
    const area = document.getElementById('scanArea');
    area.innerHTML = '';
    list.forEach(name=>{
      const div = document.createElement('div');
      div.className = 'device';
      div.innerHTML = <div class=\"meta\"><div class=\"name\">${name}</div><div class=\"rssi\">~ -60 dBm</div></div><div><button class=\"btn primary\" onclick=\"pairSensor('${name}')\">Pair</button></div>;
      area.appendChild(div);
    });
  }
  function pairSensor(name){
    localStorage.setItem('pairedSensor', name);
    document.getElementById('paired-status').textContent = 'Sensor: ' + name;
    // go back to dashboard
    showScreen('dashboard');
  }

  function openDetail(idx){
    // For hackathon demo, just focus the card
    const card = document.getElementById('card-'+idx);
    if(card) card.scrollIntoView({behavior:'smooth', block:'center'});
    card.classList.add('pulse');
    setTimeout(()=>card.classList.remove('pulse'),800);
  }

  // Init
  restoreState();
