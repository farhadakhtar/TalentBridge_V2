param(
    [string]$Path = $PSScriptRoot,
    [int]$DebounceSeconds = 5,
    [string]$CommitPrefix = "auto"
)

$ErrorActionPreference = "Stop"
$watchPath = (Resolve-Path $Path).Path
$logPath = Join-Path $env:LOCALAPPDATA "TalentBridge_V2\auto-push.log"
$excludedPaths = @("TalentBridge_V2_Master_Prompt.md")
$sensitivePattern = '(^|/)\.env($|\.)|(^|/)(id_rsa|id_ed25519|id_dsa|id_ecdsa|credentials|\.npmrc|\.netrc|\.dockercfg)$|\.(key|pem|p12|pfx|ppk|jks|keystore|truststore|bak|backup|swp|swo)$|(^|/)node_modules(/|$)'

New-Item -ItemType Directory -Force -Path (Split-Path $logPath) | Out-Null

function Write-Log {
    param([string]$Message)
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Write-Host $line
    Add-Content -LiteralPath $logPath -Value $line
}

Set-Location $watchPath
$origin = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or $origin -notmatch '^https://github\.com/farhadakhtar/TalentBridge_V2\.git$') {
    throw "origin must be https://github.com/farhadakhtar/TalentBridge_V2.git"
}

$branch = git branch --show-current
if ($LASTEXITCODE -ne 0 -or -not $branch) {
    throw "Could not determine the current branch"
}

Write-Log "Watching $watchPath; debounce ${DebounceSeconds}s; pushing to $origin ($branch)"
$lastStatus = $null
$stableSince = Get-Date

while ($true) {
    try {
        $status = @(git status --porcelain --untracked-files=all)
        if ($LASTEXITCODE -ne 0) {
            Write-Log "git status failed; retrying"
            Start-Sleep -Seconds 2
            continue
        }

        $fingerprint = $status -join "`n"
        if ($fingerprint -ne $lastStatus) {
            $lastStatus = $fingerprint
            $stableSince = Get-Date
        }

        if ($status.Count -gt 0 -and ((Get-Date) - $stableSince).TotalSeconds -ge $DebounceSeconds) {
            $safePaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
            foreach ($entry in $status) {
                if ($entry.Length -lt 4) { continue }
                $pathParts = $entry.Substring(3) -split ' -> ', 2
                foreach ($file in $pathParts) {
                    $normalized = $file.Replace('\', '/')
                    if ($excludedPaths -contains $normalized -or $normalized -match $sensitivePattern) { continue }
                    [void]$safePaths.Add($file)
                }
            }

            if ($safePaths.Count -gt 0) {
                $files = @($safePaths)
                $addOutput = git add -- $files 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Log "git add failed: $($addOutput -join ' ')"
                }
                else {
                    $message = "${CommitPrefix}: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $($files.Count) file(s) changed"
                    $commitOutput = git commit -m $message -- $files 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Log "Committed $($files.Count) file(s): $message"
                    }
                    else {
                        Write-Log "git commit failed: $($commitOutput -join ' ')"
                    }
                }
            }
        }

        $ahead = git rev-list --count '@{u}..HEAD' 2>$null
        if ($LASTEXITCODE -eq 0 -and [int]$ahead -gt 0) {
            $pushOutput = git push -u origin $branch 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log "Pushed $branch to origin"
            }
            else {
                Write-Log "git push failed; will retry: $($pushOutput -join ' ')"
            }
        }
    }
    catch {
        Write-Log "Watcher error; retrying: $_"
    }
    Start-Sleep -Seconds 2
}
