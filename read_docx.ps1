Add-Type -AssemblyName System.IO.Compression.FileSystem

$dir = Get-ChildItem -Directory | Where-Object { $_.Name -like "*Y*u c*u*" }
Write-Host "Found dir: " $dir.FullName

$file = Get-ChildItem -Path $dir.FullName -Filter "*.docx" | Where-Object { $_.Name -like "*Y*u c*u*" }
Write-Host "Found file: " $file.FullName

$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$text = [System.Text.RegularExpressions.Regex]::Replace($xml, "<w:p[ >]", "`n")
$clean = [System.Text.RegularExpressions.Regex]::Replace($text, "<[^>]+>", "")
[System.IO.File]::WriteAllText("extracted_req.txt", $clean, [System.Text.Encoding]::UTF8)
Write-Host "Done writing extracted_req.txt"
