const { spawn } = require('child_process');
const path = require('path');

console.log('🌟 Starting TaskPlanet Social Web Application...');

// Start Backend Server
const serverProcess = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

// Start Frontend Client with npm.cmd (Windows compatible)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});
