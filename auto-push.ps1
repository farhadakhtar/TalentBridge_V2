# Auto-push watcher for TalentBridge_V2
# Run this in background: powershell -File auto-push.ps1

$folder = "D:\PROJECTS\TalentBridge_V2"
$lastCommitHash = ""

function PushIfChanged {
    cd $folder
    $status = git status --porcelain
    if ($status) {
        git add -A
        $msg = "auto: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $($status -join '; ')"
        git commit -m $msg
        $newHash = git rev-parse HEAD
        if ($newHash -ne $lastCommitHash) {
            git push origin main
            $lastCommitHash = $newHash
            Write-Host "[$(Get-Date)] Pushed: $msg"
        }
    }
}

# Initial hash
cd $folder
$global:lastCommitHash = git rev-parse HEAD 2>$null

# Watch loop
while ($true) {
    PushIfChanged
    Start-Sleep -Seconds 5
}