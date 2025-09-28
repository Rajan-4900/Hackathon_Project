// Dark/Light Mode Toggle
const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    modeToggle.innerText = document.body.classList.contains('dark-mode') ? '🌕' : '🌙';
});
