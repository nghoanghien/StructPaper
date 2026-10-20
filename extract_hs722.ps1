Add-Type -AssemblyName System.IO.Compression.FileSystem

$dir = Get-ChildItem -Directory | Where-Object { $_.Name -like "*Y*u c*u*" }
$subDir = Get-ChildItem -Path $dir.FullName -Directory | Where-Object { $_.Name -like "*M*u VNUHCM-HS*" }
$file = Get-ChildItem -Path $subDir.FullName -Filter "*.docx" | Select-Object -First 1

Write-Host "Target docx: " $file.FullName

$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()

# Also let's inspect if there are media files
$mediaFiles = $zip.Entries | Where-Object { $_.FullName -like "word/media/*" } | ForEach-Object { $_.FullName }
Write-Host "Found media files: " ($mediaFiles -join ", ")

$zip.Dispose()

$text = [System.Text.RegularExpressions.Regex]::Replace($xml, "<w:p[ >]", "`n")
$clean = [System.Text.RegularExpressions.Regex]::Replace($text, "<[^>]+>", "")
[System.IO.File]::WriteAllText("extracted_hs722.txt", $clean, [System.Text.Encoding]::UTF8)
Write-Host "Extracted HS722 sample successfully! Length: " $clean.Length
