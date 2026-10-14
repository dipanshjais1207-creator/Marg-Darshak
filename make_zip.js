const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname);
const zipPath = path.resolve(__dirname, '..', 'margdarshak_website.zip');

console.log('Zipping from:', sourceDir);
console.log('Output to:', zipPath);

// Use PowerShell to zip all files except node_modules
const psScript = `
if (Test-Path '${zipPath}') { Remove-Item '${zipPath}' -Force };
Get-ChildItem -Path '${sourceDir}' | Where-Object { $_.Name -ne 'node_modules' } | Compress-Archive -DestinationPath '${zipPath}' -CompressionLevel Optimal
`;

try {
  execSync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
  const stats = fs.statSync(zipPath);
  console.log('SUCCESS! Created zip file size:', (stats.size / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Failed to create zip:', err);
}
