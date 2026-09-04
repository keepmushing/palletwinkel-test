# =============================================================================
#  't Palletje — lokale preview-server
#
#  Waarom dit bestaat: de site is puur statisch, maar de pagina's linken naar
#  absolute paden (/producten/, /contact/). Die werken niet als je index.html
#  gewoon dubbelklikt. Dit scriptje serveert de map alsof het een echte
#  webserver is, zodat je ziet wat een bezoeker straks ziet.
#
#  Gebruik:  rechtsklik op dit bestand > "Uitvoeren met PowerShell"
#            of in een terminal:  powershell -ExecutionPolicy Bypass -File serve.ps1
#
#  Daarna:   open http://localhost:8080/  in je browser.
#            Stoppen met Ctrl+C.
#
#  Geen installatie nodig. Dit gebruikt enkel wat er al op Windows staat.
# =============================================================================

param(
    [int]$Port = 8080
)

$root = $PSScriptRoot

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.webp' = 'image/webp'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png'  = 'image/png'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.txt'  = 'text/plain; charset=utf-8'
    '.xml'  = 'application/xml; charset=utf-8'
    '.pdf'  = 'application/pdf'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host ""
    Write-Host "Kon poort $Port niet openen." -ForegroundColor Red
    Write-Host "Draait er al een server? Probeer een andere poort:" -ForegroundColor Yellow
    Write-Host "    powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 8081"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "  't Palletje - preview draait" -ForegroundColor Green
Write-Host "  ---------------------------------"
Write-Host "  Open:   http://localhost:$Port/"
Write-Host "  Map:    $root"
Write-Host "  Stop:   Ctrl+C"
Write-Host ""

while ($listener.IsListening) {
    try {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response

        # Pad opschonen en normaliseren.
        $rel = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
        if ($rel -eq '') { $rel = 'index.html' }
        $rel = $rel -replace '/', '\'

        $path = Join-Path $root $rel

        # Map gevraagd? Dan index.html daarbinnen.
        if (Test-Path -LiteralPath $path -PathType Container) {
            $path = Join-Path $path 'index.html'
        }
        # Zonder trailing slash: /contact  ->  /contact/index.html
        elseif (-not (Test-Path -LiteralPath $path) -and (Test-Path -LiteralPath (Join-Path $path 'index.html'))) {
            $path = Join-Path $path 'index.html'
        }

        # Directory traversal blokkeren: nooit buiten de siteroot serveren.
        $full = [System.IO.Path]::GetFullPath($path)
        if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root), [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path -LiteralPath $full -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $type = $mime[$ext]
            if (-not $type) { $type = 'application/octet-stream' }

            $bytes = [System.IO.File]::ReadAllBytes($full)
            $response.ContentType = $type
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host ("  200  " + $request.Url.AbsolutePath) -ForegroundColor DarkGray
        }
        else {
            $body = @"
<!doctype html><meta charset="utf-8">
<title>404 - pagina bestaat nog niet</title>
<style>body{font:16px/1.6 "Segoe UI",sans-serif;background:#F4F4F2;color:#1C1C1C;
max-width:640px;margin:96px auto;padding:0 24px}code{background:#fff;border:1px solid #E2E2E0;
padding:2px 6px;border-radius:4px}a{color:#C7420F}</style>
<h1>404</h1>
<p>De pagina <code>$($request.Url.AbsolutePath)</code> bestaat nog niet.</p>
<p>Waarschijnlijk is ze nog niet gebouwd. <a href="/">Terug naar de homepage</a>.</p>
"@
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
            $response.StatusCode = 404
            $response.ContentType = 'text/html; charset=utf-8'
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host ("  404  " + $request.Url.AbsolutePath) -ForegroundColor DarkYellow
        }

        $response.Close()
    }
    catch {
        # Eén kapotte request mag de server niet neerhalen.
        Write-Host ("  !    " + $_.Exception.Message) -ForegroundColor Red
    }
}
