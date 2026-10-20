const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Node 22 has built-in zip support or we can use adm-zip / jszip or simple unzip script
// Let's use PowerShell via child_process or read zip headers
const { execSync } = require('child_process');

try {
  const psScript = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead('Yêu cầu phần mềm, Template, các file mẫu của Tạp chí/Yêu cầu phần mềm.docx')
    $entry = $zip.GetEntry('word/document.xml')
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Dispose()
    $clean = $text -replace '<w:p[ >]', "`n" -replace '<[^>]+>', ''
    Set-Content -Path 'extracted_yeucau.txt' -Value $clean -Encoding UTF8
  `;
  fs.writeFileSync('read_req.ps1', psScript, 'utf8');
  execSync('powershell -ExecutionPolicy Bypass -File read_req.ps1', { stdio: 'inherit' });
  const content = fs.readFileSync('extracted_yeucau.txt', 'utf8');
  console.log('=== EXTRACTED REQUIREMENTS ===\n', content);
} catch (e) {
  console.error(e);
}
