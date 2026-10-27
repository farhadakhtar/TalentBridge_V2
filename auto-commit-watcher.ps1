<#
.SYNOPSIS
    Auto-commit watcher for Git repos. Watches folder, debounces changes, commits + pushes to GitHub.

.PARAMETER Path
    Folder to watch (default: current directory)

.PARAMETER DebounceSeconds
    Seconds of inactivity before committing (default: 5)

.PARAMETER CommitPrefix
    Prefix for commit messages (default: "auto")
#>

param(
    [string]$Path = (Get-Location).Path,
    [int]$DebounceSeconds = 5,
    [string]$CommitPrefix = "auto"
)

$ErrorActionPreference = "Stop"

# Resolve path
$watchPath = Resolve-Path $Path
Write-Host "[INFO] Watching: $watchPath" -ForegroundColor Cyan
Write-Host "[INFO] Debounce: ${DebounceSeconds}s | Prefix: $CommitPrefix" -ForegroundColor Cyan
Write-Host "[INFO] Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Verify git repo
if (-not (Test-Path (Join-Path $watchPath ".git"))) {
    Write-Error "Not a git repository: $watchPath"
    exit 1
}

cd $watchPath
$origin = git remote get-url origin 2>$null
if (-not $origin) {
    Write-Error "No 'origin' remote configured"
    exit 1
}
Write-Host "[INFO] Origin: $origin" -ForegroundColor Green

# Sensitive file patterns - never commit these
$sensitivePatterns = @(
    "*.env", "*.env.*", "*.key", "*.pem", "*.pfx", "*.ppk",
    "id_rsa", "id_ed25519", "id_dsa", "id_ecdsa",
    "credentials", ".npmrc", ".netrc", ".dockercfg",
    "*.p12", "*.jks", "*.keystore", "*.truststore",
    "*.bak", "*.backup", "*.swp", "*.swo"
)

function Test-SensitiveFile {
    param([string]$File)
    foreach ($pattern in $sensitivePatterns) {
        if ($File -like $pattern) { return $true }
    }
    return $false
}

function UnstageSensitiveFiles {
    $staged = git diff --name-only --cached
    foreach ($file in $staged) {
        if (Test-SensitiveFile $file) {
            git reset HEAD -- "$file" 2>$null
            Write-Host "[WARN] Unstaged sensitive file: $file" -ForegroundColor Yellow
        }
    }
}

# Debounce timer
$timer = $null
$pending = $false
$commitCount = 0

# FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $watchPath
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::CreationTime -bor [System.IO.NotifyFilters]::Size
$watcher.EnableRaisingEvents = $true

$action = {
    $global:pending = $true
    if ($global:timer) { $global:timer.Dispose() }
    $global:timer = New-Object System.Timers.Timer($DebounceSeconds * 1000)
    $global:timer.AutoReset = $false
    $global:timer.Elapsed += {
        if ($global:pending) {
            $global:pending = $false
            CommitAndPush
        }
    }
    $global:timer.Start()
}

Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $action | Out-Null

function CommitAndPush {
    $status = git status --porcelain
    if (-not $status) { return }

    $files = $status -split "`n" | Where-Object { $_ } | ForEach-Object { $_.Substring(3) }

    git add -A
    UnstageSensitiveFiles

    $staged = git diff --name-only --cached
    if (-not $staged) { return }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $msg = "$CommitPrefix: $timestamp - $($staged.Count) file(s) changed"

    try {
        git commit -m $msg
        $commitCount++
        Write-Host "[$(Get-Date -Format HH:mm:ss)] [COMMIT #$commitCount] $msg" -ForegroundColor Green
        $staged | ForEach-Object { Write-Host "  + $_" -ForegroundColor Gray }

        $branch = git branch --show-current
        git push -u origin $branch
        Write-Host "  [OK] Pushed to origin/$branch" -ForegroundColor Cyan
    }
    catch {
        Write-Host "  [ERROR] $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "[READY] Watching for changes..." -ForegroundColor Green
Write-Host ""

try {
    while ($true) { Start-Sleep -Seconds 3600 }
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    if ($timer) { $timer.Dispose() }
    Get-EventSubscriber | Unregister-Event -Force
    Write-Host "`n[STOPPED] Watcher ended. Total commits: $commitCount" -ForegroundColor Yellow
}