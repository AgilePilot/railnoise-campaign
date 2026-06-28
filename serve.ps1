$root = Join-Path $PSScriptRoot "site"
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving site at http://localhost:$port  (Ctrl+C to stop)" -ForegroundColor Green

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2"= "font/woff2"
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $path = $ctx.Request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }

        # Mock API endpoints
        if ($path -eq "/api/count") {
            $body = [System.Text.Encoding]::UTF8.GetBytes('{"count":42}')
            $ctx.Response.ContentType = "application/json"
            $ctx.Response.OutputStream.Write($body, 0, $body.Length)
            $ctx.Response.Close()
            continue
        }
        if ($path -eq "/api/sign") {
            $body = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
            $ctx.Response.ContentType = "application/json"
            $ctx.Response.StatusCode = 201
            $ctx.Response.OutputStream.Write($body, 0, $body.Length)
            $ctx.Response.Close()
            continue
        }

        $filePath = Join-Path $root ($path -replace "/", "\")
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $ctx.Response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $ctx.Response.OutputStream.Write($body, 0, $body.Length)
        }
        $ctx.Response.Close()
        Write-Host "$($ctx.Request.HttpMethod) $path -> $($ctx.Response.StatusCode)"
    }
} finally {
    $listener.Stop()
}
