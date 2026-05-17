Write-Host "Watching for changes... Press Ctrl+C to stop."
$lastWrite = $null

while ($true) {
    $files = Get-ChildItem -Path . -Include *.js, *.html, *.mp3 -Recurse
    $currentWrite = ($files | Measure-Object -Property LastWriteTime -Maximum).Maximum

    if ($currentWrite -ne $lastWrite) {
        $lastWrite = $currentWrite
        Start-Sleep -Seconds 2
        git add .
        git commit -m "auto update"
        git push
        Write-Host "Pushed at $currentWrite"
    }

    Start-Sleep -Seconds 3
}