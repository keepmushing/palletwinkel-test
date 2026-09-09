# Controle van de statische site: links, id's, koppen en klassen.
param([string]$Root = "C:\Users\bert\dev\palletwinkel")

$ErrorActionPreference = "Stop"
$fouten = New-Object System.Collections.ArrayList

function Meld($pagina, $soort, $tekst) {
    [void]$fouten.Add([pscustomobject]@{ Pagina = $pagina; Soort = $soort; Detail = $tekst })
}

# --- klassen die in de stylesheets gedefinieerd zijn ---
$cssTekst = ""
foreach ($css in (Get-ChildItem -Path $Root -Filter *.css -Recurse -File | Where-Object { $_.FullName -notlike "*\.git\*" })) {
    $cssTekst += (Get-Content $css.FullName -Raw)
}
$gedefinieerd = New-Object System.Collections.Generic.HashSet[string]
foreach ($m in [regex]::Matches($cssTekst, '\.(-?[A-Za-z_][A-Za-z0-9_-]*)')) {
    [void]$gedefinieerd.Add($m.Groups[1].Value)
}
# klassen die alleen door JavaScript gezet of gelezen worden
foreach ($extra in @('cfg','active','open','on','is-active','is-manual','hidden','slide','dots','photo-nav','bijschrift','lb-leeg','num','is-header','is-blank','rownum','corner','tabs-select','group','tab','soort','titel','fragment','zoekleeg','show-box','show-wall','show-pallet','show-floor','show-krat','show-kist','hide-wall','hide-kist','show-PBL','show-PBA','show-KIS','show-KIB','show-KIP','show-KRS','show-KRB','show-KRP','show-HVL','show-HWA','paaltype','kolommen','lbl','unit','faq-permalink','met-teller','foto-teller')) {
    [void]$gedefinieerd.Add($extra)
}

$paginas = Get-ChildItem -Path $Root -Filter *.html -Recurse -File | Where-Object { $_.FullName -notlike "*\.git\*" -and $_.FullName -notlike "*\node_modules\*" }

# --- id's per pagina verzamelen ---
$idsPerPagina = @{}
foreach ($p in $paginas) {
    $html = Get-Content $p.FullName -Raw
    $set = New-Object System.Collections.Generic.HashSet[string]
    foreach ($m in [regex]::Matches($html, 'id="([^"]+)"')) { [void]$set.Add($m.Groups[1].Value) }
    $rel = $p.FullName.Substring($Root.Length).Replace('\','/')
    $idsPerPagina[$rel] = $set
}

function NaarRelatief($pad) {
    # /producten/ -> /producten/index.html ; /404.html blijft
    if ($pad -eq "/") { return "/index.html" }
    if ($pad.EndsWith("/")) { return $pad + "index.html" }
    if ($pad.EndsWith(".html")) { return $pad }
    return $pad + "/index.html"
}

$verplichteIds = @('ddBtn','ddMenu','zoekknop','zoekbalk','zoekveld','zoeksluit','zoekresultaten','burger','menu')

foreach ($p in $paginas) {
    $rel = $p.FullName.Substring($Root.Length).Replace('\','/')
    $html = Get-Content $p.FullName -Raw

    # 1. verplichte gedeelde onderdelen
    if ($html -notmatch '/assets/css/site\.css') { Meld $rel "stijl" "site.css ontbreekt" }
    if ($html -notmatch '/assets/js/site\.js')   { Meld $rel "script" "site.js ontbreekt" }

    # 2. koppen
    $h1 = ([regex]::Matches($html, '<h1[ >]')).Count
    if ($h1 -ne 1) { Meld $rel "kop" "$h1 h1-elementen (moet 1 zijn)" }

    # 3. signatuurvorm
    $final = ([regex]::Matches($html, 'class="final"')).Count
    if ($final -gt 1) { Meld $rel "final" "$final final-blokken (max 1)" }

    # 4. verplichte id's precies een keer
    foreach ($id in $verplichteIds) {
        $n = ([regex]::Matches($html, ('id="' + $id + '"'))).Count
        if ($n -ne 1) { Meld $rel "id" "id=$id komt $n keer voor (moet 1 zijn)" }
    }

    # 5. dubbele id's algemeen
    $alleIds = @()
    foreach ($m in [regex]::Matches($html, 'id="([^"]+)"')) { $alleIds += $m.Groups[1].Value }
    $dubbel = $alleIds | Group-Object | Where-Object { $_.Count -gt 1 }
    foreach ($d in $dubbel) { Meld $rel "id" ("dubbel id: " + $d.Name) }

    # 6. eigen style- of scriptblokken
    if ($rel -ne "/configurator/index.html" -and $rel -ne "/index.html") {
        if ($html -match '<style[ >]') { Meld $rel "stijl" "eigen <style>-blok in de pagina" }
    }

    # 7. links
    foreach ($m in [regex]::Matches($html, 'href="([^"]+)"')) {
        $href = $m.Groups[1].Value
        if ($href -match '^(mailto:|tel:|https?:|javascript:|data:)') { continue }
        if ($href -eq "#") { Meld $rel "link" "lege href=#"; continue }

        if ($href.StartsWith("#")) {
            $frag = $href.Substring(1)
            if (-not $idsPerPagina[$rel].Contains($frag)) { Meld $rel "anker" "#$frag bestaat niet op deze pagina" }
            continue
        }
        if (-not $href.StartsWith("/")) { Meld $rel "link" "relatief pad: $href"; continue }

        $pad = $href; $frag = ""
        if ($href.Contains("#")) {
            $delen = $href.Split("#")
            $pad = $delen[0]; $frag = $delen[1]
        }
        if ($pad.Contains("?")) { $pad = $pad.Split("?")[0] }
        if ($pad -eq "") { continue }

        $doelRel = NaarRelatief $pad
        $doelPad = Join-Path $Root ($doelRel.TrimStart("/").Replace("/","\"))
        if (-not (Test-Path $doelPad)) {
            # misschien een bestand zonder index (afbeelding, css, js)
            $direct = Join-Path $Root ($pad.TrimStart("/").Replace("/","\"))
            if (-not (Test-Path $direct)) { Meld $rel "link" "bestaat niet: $href" ; continue }
            continue
        }
        if ($frag -ne "") {
            if ($idsPerPagina.ContainsKey($doelRel)) {
                if (-not $idsPerPagina[$doelRel].Contains($frag)) { Meld $rel "anker" "#$frag bestaat niet op $doelRel" }
            }
        }
    }

    # 8. bronnen (src). Het ?v=… erachter is een versiestempel tegen oude
    #    browsercache; voor het bestaan van het bestand telt dat niet mee.
    foreach ($m in [regex]::Matches($html, 'src="([^"]+)"')) {
        $src = $m.Groups[1].Value
        if ($src -match '^(https?:|data:)') { continue }
        if (-not $src.StartsWith("/")) { Meld $rel "bron" "relatief pad: $src"; continue }
        if ($src.Contains("?")) { $src = $src.Split("?")[0] }
        $bron = Join-Path $Root ($src.TrimStart("/").Replace("/","\"))
        if (-not (Test-Path $bron)) { Meld $rel "bron" "bestaat niet: $src" }
    }

    # 9. klassen
    $onbekend = New-Object System.Collections.Generic.HashSet[string]
    foreach ($m in [regex]::Matches($html, 'class="([^"]*)"')) {
        foreach ($c in ($m.Groups[1].Value -split '\s+')) {
            if ($c -eq "") { continue }
            if (-not $gedefinieerd.Contains($c)) { [void]$onbekend.Add($c) }
        }
    }
    foreach ($c in $onbekend) { Meld $rel "klasse" "onbekende klasse: $c" }
}


# --- 10. loopt faq-data.js gelijk met faq/index.html? -------------------------
#  De vijftig antwoorden staan op twee plaatsen: uitgeschreven in faq/index.html
#  (dat is de pagina die Google moet indexeren) en als data in faq-data.js (dat
#  voedt de uittreksels op de productpagina's). Wijkt er één af, dan leest een
#  bezoeker op de productpagina iets anders dan op de FAQ. Vandaar deze controle.
$faqPagina = Join-Path $Root "faq\index.html"
$faqData   = Join-Path $Root "assets\js\faq-data.js"
if ((Test-Path $faqPagina) -and (Test-Path $faqData)) {
    $hp = Get-Content $faqPagina -Raw
    $hd = Get-Content $faqData -Raw

    $inPagina = @{}
    foreach ($m in [regex]::Matches($hp, '<details id="(?<id>[^"]+)"[^>]*><summary>(?<q>.*?)</summary><div class="faq-answer"><div class="faq-copy">(?<a>.*?)</div><div class="faq-share">')) {
        $inPagina[$m.Groups['id'].Value] = @{ q = $m.Groups['q'].Value; a = $m.Groups['a'].Value }
    }
    $inData = @{}
    foreach ($m in [regex]::Matches($hd, "\{ id: '(?<id>[^']+)', topic: \d+, populair: (?:true|false),\s*\r?\n\s*vraag: '(?<q>.*?)',\s*\r?\n\s*antwoord: '(?<a>.*?)' \}")) {
        # In faq-data.js staat een apostrof als \' omdat de tekst tussen enkele quotes staat.
    # De regex hieronder moet dus de BACKSLASH weghalen: "\\'" is een echte backslash
    # gevolgd door een quote. Met "\'" matcht .NET enkel de quote zelf en verandert er niets,
    # waardoor elk antwoord met een apostrof onterecht als afwijking werd gemeld.
    $inData[$m.Groups['id'].Value] = @{ q = ($m.Groups['q'].Value -replace "\\'","'"); a = ($m.Groups['a'].Value -replace "\\'","'") }
    }

    foreach ($id in $inPagina.Keys) {
        if (-not $inData.ContainsKey($id)) { Meld "faq-data.js" "faq" "ontbreekt in faq-data.js: $id" ; continue }
        if ($inData[$id].q -ne $inPagina[$id].q) { Meld "faq-data.js" "faq" "vraag wijkt af: $id" }
        if ($inData[$id].a -ne $inPagina[$id].a) { Meld "faq-data.js" "faq" "antwoord wijkt af: $id" }
    }
    foreach ($id in $inData.Keys) {
        if (-not $inPagina.ContainsKey($id)) { Meld "faq/index.html" "faq" "staat wel in faq-data.js maar niet op de FAQ-pagina: $id" }
    }

    # elke data-faq="…" op een productpagina moet naar bestaande id's wijzen
    foreach ($p in $paginas) {
        $h = Get-Content $p.FullName -Raw
        $r = $p.FullName.Substring($Root.Length).TrimStart("\")
        foreach ($m in [regex]::Matches($h, 'data-faq="([^"]+)"')) {
            foreach ($id in ($m.Groups[1].Value -split ',')) {
                $id = $id.Trim()
                if ($id -eq "") { continue }
                if (-not $inData.ContainsKey($id)) { Meld $r "faq" "data-faq verwijst naar onbekende id: $id" }
            }
        }
    }
}

# --- rapport ---
if ($fouten.Count -eq 0) {
    Write-Output "GEEN FOUTEN. $($paginas.Count) pagina's gecontroleerd."
} else {
    Write-Output "$($fouten.Count) bevindingen over $($paginas.Count) pagina's:"
    Write-Output ""
    $fouten | Group-Object Pagina | Sort-Object Name | ForEach-Object {
        Write-Output ("== " + $_.Name + " (" + $_.Count + ")")
        $_.Group | ForEach-Object { Write-Output ("   [" + $_.Soort + "] " + $_.Detail) }
    }
}
