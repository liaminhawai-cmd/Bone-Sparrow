# Builds <Name>.pptx in the repo root from tools/deck-pptx/out/<Name>.json,
# which extract.js writes from the HTML deck. Needs PowerPoint on Windows.
# Each web slide becomes a display slide and, where it has one, a reveal
# slide, so a click in Slide Show does what Reveal does on the web page.
# The teacher notes go into the speaker notes for Presenter View.
#
#   node tools/deck-pptx/extract.js SentenceFluencyDeck.html
#   powershell -ExecutionPolicy Bypass -File tools/deck-pptx/build.ps1 SentenceFluencyDeck
#
# The saved file has its author fields emptied and a description naming this
# script, because generated files are rebuilt, never edited by hand.
param([Parameter(Mandatory=$true)][string]$Name)
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $here "..\..")
$out = Join-Path $here "out"
$spec = Get-Content -Raw -Encoding UTF8 (Join-Path $out "$Name.json") | ConvertFrom-Json
$target = Join-Path $root "$Name.pptx"

function RGB([string]$hex){ $r=[Convert]::ToInt32($hex.Substring(0,2),16); $g=[Convert]::ToInt32($hex.Substring(2,2),16); $b=[Convert]::ToInt32($hex.Substring(4,2),16); return $r + 256*$g + 65536*$b }
$C = @{ head=(RGB "8C072D"); ink=(RGB "212121"); grey=(RGB "6B6B6B"); numgrey=(RGB "888888");
        s=(RGB "A24800"); v=(RGB "0F6E4D"); p=(RGB "1F5FA8"); c=(RGB "212121"); bar=(RGB "E6D8DA") }
$FONT = "Aptos"

# A run: @{ t="text"; k="s|v|p|c|"; bold; italic; underline; color }
function KindRun($r){
  $o = @{ t=$r.t; k=$r.k }
  switch($r.k){
    "s" { $o.color=$C.s; $o.bold=$true }
    "v" { $o.color=$C.v; $o.bold=$true; $o.italic=$true }
    "p" { $o.color=$C.p; $o.bold=$true }
    "c" { $o.color=$C.c; $o.bold=$true; $o.underline=$true }
    "e" { $o.underline=$true }   # a marked rhyme word on a poem reveal
  }
  return $o
}
function Para($runs, $size, $extra){ $p = @{ runs=@($runs); size=$size; before=0; indent=0; align=1 }; if($extra){ foreach($k in $extra.Keys){ $p[$k]=$extra[$k] } }; return $p }

# One text box from a list of paragraphs, each a list of formatted runs.
function TextBox($slide, $l, $t, $w, $h, $paras, $autofit){
  $tb = $slide.Shapes.AddTextbox(1, $l, $t, $w, $h)
  $tf = $tb.TextFrame
  $tf.WordWrap = -1
  $tf.MarginLeft = 0; $tf.MarginRight = 0; $tf.MarginTop = 0; $tf.MarginBottom = 0
  $text = ($paras | ForEach-Object { ($_.runs | ForEach-Object { $_.t }) -join "" }) -join "`r"
  $tr = $tf.TextRange
  $tr.Text = $text
  $tr.Font.Name = $FONT; $tr.Font.Color.RGB = $C.ink; $tr.Font.Bold = 0; $tr.Font.Italic = 0
  $pos = 1
  for($i=0; $i -lt $paras.Count; $i++){
    $p = $paras[$i]
    $pr = $tr.Paragraphs($i+1)
    $pr.Font.Size = $p.size
    $pr.ParagraphFormat.SpaceBefore = $p.before
    $pr.ParagraphFormat.Alignment = $p.align
    if($p.indent -gt 0){ $pf = $tb.TextFrame2.TextRange.Paragraphs($i+1).ParagraphFormat; $pf.LeftIndent = $p.indent; $pf.FirstLineIndent = 0 }
    foreach($r in $p.runs){
      $len = $r.t.Length
      if($len -gt 0){
        $cr = $tr.Characters($pos, $len)
        if($r.color){ $cr.Font.Color.RGB = $r.color }
        if($r.bold){ $cr.Font.Bold = -1 }
        if($r.italic){ $cr.Font.Italic = -1 }
        if($r.underline){ $cr.Font.Underline = -1 }
      }
      $pos += $len
    }
    $pos += 1   # the paragraph break
  }
  if($autofit){ $tb.TextFrame2.AutoSize = 2 } else { $tb.TextFrame2.AutoSize = 0 }
  $tb.Height = $h
  return $tb
}

$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Add(0)
$pres.PageSetup.SlideWidth = 960
$pres.PageSetup.SlideHeight = 540
$W = 960; $L = 60; $BODYW = 840

$idx = 0
foreach($st in $spec.states){
  $idx++
  $s = $pres.Slides.Add($idx, 12)
  $s.FollowMasterBackground = 0
  $s.Background.Fill.Solid()
  $s.Background.Fill.ForeColor.RGB = (RGB $st.bg)

  # Heading, sub-prompt, icons, footer, code: the frame every session deck uses.
  [void](TextBox $s $L 26 700 36 @( (Para @(@{ t=$st.h; bold=$true; color=$C.head }) 26) ) $false)
  if($st.sub){ [void](TextBox $s $L 64 700 26 @( (Para @(@{ t=$st.sub; italic=$true; color=$C.grey }) 17) ) $false) }
  $icons = @($st.icons); $isz = 62; $gap = 10
  for($j=0; $j -lt $icons.Count; $j++){
    $x = 900 - ($icons.Count - $j) * $isz - ($icons.Count - 1 - $j) * $gap
    [void]$s.Shapes.AddPicture((Join-Path $out ($icons[$j] + ".svg")), 0, -1, $x, 22, $isz, $isz)
  }
  if($st.foot -eq "legend"){
    $runs = @(); foreach($k in @("s","v","p","c")){ $r = KindRun @{ t=($spec.tags.$k.Substring(0,1).ToUpper() + $spec.tags.$k.Substring(1)); k=$k }; $runs += $r; $runs += @{ t="     " } }
    [void](TextBox $s $L 500 600 20 @( (Para $runs 12) ) $false)
  } elseif($st.footRuns){
    $runs = @(); foreach($r in $st.footRuns){ $runs += (KindRun @{ t=$r.t; k=$r.k }); $runs += @{ t="     " } }
    [void](TextBox $s $L 500 600 20 @( (Para $runs 12) ) $false)
  } elseif($st.foot){
    [void](TextBox $s $L 500 600 20 @( (Para @(@{ t=$st.foot; italic=$true; color=$C.grey }) 12) ) $false)
  }
  [void](TextBox $s 840 500 60 20 @( (Para @(@{ t=$spec.code; color=$C.grey }) 12 @{ align=3 }) ) $false)

  if($st.kind -eq "title"){
    $rule = @($st.rule | ForEach-Object { KindRun $_ })
    [void](TextBox $s $L 150 $BODYW 120 @( (Para $rule 38) ) $true)
    $keyParas = @(); foreach($k in $st.key){ $keyParas += (Para @(@{ t=($k[0] + "   "); bold=$true; color=$C.numgrey }, @{ t=$k[1] }) 28 @{ before=8 }) }
    [void](TextBox $s $L 300 $BODYW 140 $keyParas $true)
  }
  elseif($st.kind -eq "sentence"){
    $paras = @( (Para @($st.sent | ForEach-Object { KindRun $_ }) 36),
                (Para @(@{ t=$st.src; color=$C.grey }) 14 @{ before=6 }) )
    $first = $true
    foreach($a in $st.ans){
      $runs = @($a | ForEach-Object { KindRun $_ })
      if($first){ $runs = @($runs | ForEach-Object { $_.bold=$true; if(-not $_.k){ $_.color=$C.head }; $_ }) }
      $paras += (Para $runs 22 @{ before=($(if($first){18}else{4})); indent=40 })
      $first = $false
    }
    [void](TextBox $s $L 118 $BODYW 370 $paras $true)
  }
  elseif($st.kind -eq "go"){
    [void](TextBox $s $L 170 $BODYW 200 @( (Para @(@{ t=$st.line }) 36) ) $true)
  }
  elseif($st.kind -eq "rows"){
    # Poem, vote and move slides: number, line, then the tag shown on the reveal.
    # Sizes are worked out from the longest line so no line wraps.
    $maxLen = 0; $hasTag = $false
    foreach($r in $st.rows){
      if($r.type -eq "line"){
        $len = (($r.runs | ForEach-Object { $_.t }) -join "").Length
        if($len -gt $maxLen){ $maxLen = $len }
        if(@($r.tagSpace).Count){ $hasTag = $true }
      }
    }
    $numW = 34; $tagW = $(if($hasTag){ 190 } else { 0 })
    $textW = $BODYW - $numW - $tagW
    $size = [Math]::Max(16, [Math]::Min(28, [Math]::Floor($textW / ($maxLen * 0.52))))
    $step = [Math]::Round($size * 1.7)
    $tagX = [Math]::Min(($L + $numW + $textW + 10), ($L + $numW + 10 + $maxLen * $size * 0.47 + 24))
    $y = 118
    foreach($r in $st.rows){
      if($r.type -eq "label"){
        if(-not $r.hidden){ [void](TextBox $s $L $y 400 18 @( (Para @(@{ t=$r.text; bold=$true; color=$C.head }) 13) ) $false) }
        $y += 24
      }
      elseif($r.type -eq "gap"){ $y += 14 }
      else {
        if(-not $r.hidden){
          if($r.hit){
            $hb = $s.Shapes.AddShape(1, ($L - 6), ($y - 2), ($BODYW + 12), ($step - 2))
            $hb.Line.Visible = 0
            $hb.Fill.ForeColor.RGB = (RGB "F0DDE2")
          }
          [void](TextBox $s $L $y $numW 24 @( (Para @(@{ t=("" + $r.no); bold=$true; color=$C.numgrey }) $size @{ align=3 }) ) $false)
          $runs = @($r.runs | ForEach-Object { KindRun $_ })
          if($r.hit){ $runs = @($runs | ForEach-Object { $_.bold=$true; $_ }) }
          $tb = TextBox $s ($L + $numW + 10) $y ($textW - 10 + $tagW) 24 @( (Para $runs $size) ) $false
          $tb.TextFrame.WordWrap = 0
          $tagRuns = @()
          foreach($t in @($r.tag)){
            if($t.k -eq "r"){ $tagRuns += @{ t=$t.t; bold=$true; color=$C.head } } else { $tagRuns += @{ t=$t.t; color=$C.grey } }
            $tagRuns += @{ t="   " }
          }
          if($tagRuns.Count){
            $tb2 = TextBox $s $tagX ($y + ($size - 14) * 0.75) ($tagW - 10) 20 @( (Para $tagRuns 14) ) $false
            $tb2.TextFrame.WordWrap = 0
          }
        }
        $y += $step
      }
    }
    [void](TextBox $s $L ($y + 4) 700 20 @( (Para @(@{ t=$st.src; color=$C.grey }) 13) ) $false)
    if($st.ans.Count){
      $paras = @(); $first = $true
      foreach($a in $st.ans){
        $runs = @($a | ForEach-Object { KindRun $_ })
        if($first){ $runs = @($runs | ForEach-Object { $_.bold=$true; if(-not $_.k){ $_.color=$C.head }; $_ }) }
        $paras += (Para $runs 20 @{ before=($(if($first){0}else{2})); indent=40 })
        $first = $false
      }
      [void](TextBox $s $L ($y + 30) $BODYW 90 $paras $true)
    }
  }
  elseif($st.kind -eq "length"){
    $paras = @()
    for($j=0; $j -lt $st.sentences.Count; $j++){
      $hit = $st.rev -and ($j -eq $st.lands)
      $body = @{ t=$st.sentences[$j] }
      if($hit){ $body.underline=$true; $body.color=$C.head }
      $paras += (Para @(@{ t=("" + ($j+1) + ".  "); bold=$true; color=$C.numgrey }, $body) 22 @{ before=($(if($j -gt 0){14}else{0})) })
    }
    [void](TextBox $s $L 118 540 270 $paras $true)
    # Bars: words per sentence, worked out by extract.js from the same text.
    $max = ($st.counts | Measure-Object -Maximum).Maximum
    $bw = 80; $bgap = 40; $bottom = 380; $bmax = 210; $x0 = 660
    for($j=0; $j -lt $st.counts.Count; $j++){
      $hgt = [Math]::Max(4, $bmax * $st.counts[$j] / $max)
      $x = $x0 + $j * ($bw + $bgap)
      $hit = $st.rev -and ($j -eq $st.lands)
      $bar = $s.Shapes.AddShape(1, $x, $bottom - $hgt, $bw, $hgt)
      $bar.Line.Visible = 0
      $bar.Fill.ForeColor.RGB = $(if($hit){ $C.head } else { $C.bar })
      [void](TextBox $s $x ($bottom - $hgt - 24) $bw 20 @( (Para @(@{ t=$(if($hit){"LANDS  " + ($j+1)} else {"" + ($j+1)}); bold=$true; color=$(if($hit){$C.head}else{$C.grey}) }) 13 @{ align=2 }) ) $false)
      [void](TextBox $s ($x - 10) ($bottom + 4) ($bw + 20) 22 @( (Para @(@{ t=("" + $st.counts[$j] + " words"); bold=$true }) 16 @{ align=2 }) ) $false)
    }
    [void](TextBox $s $L 392 540 20 @( (Para @(@{ t=$st.src; color=$C.grey }) 13) ) $false)
    if($st.ans.Count){
      $paras = @(); $first = $true
      foreach($a in $st.ans){
        $runs = @($a | ForEach-Object { KindRun $_ })
        if($first){ $runs = @($runs | ForEach-Object { $_.bold=$true; if(-not $_.k){ $_.color=$C.head }; $_ }) }
        $paras += (Para $runs 18 @{ before=($(if($first){0}else{2})) })
        $first = $false
      }
      [void](TextBox $s $L 424 $BODYW 66 $paras $true)
    }
  }

  # Teacher notes into the speaker notes, for Presenter View.
  $s.NotesPage.Shapes.Placeholders(2).TextFrame.TextRange.Text = $st.notes
}

if(Test-Path $target){ Remove-Item $target -Force }
$pres.SaveAs($target, 24)
$pres.Close()
$ppt.Quit()
[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt)

# Empty the author fields and say where the file comes from.
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($target, "Update")
function Rewrite($entryName, [scriptblock]$fix){
  $e = $zip.GetEntry($entryName); if(-not $e){ return }
  $r = New-Object IO.StreamReader($e.Open()); $x = $r.ReadToEnd(); $r.Close()
  $x = & $fix $x
  $e.Delete(); $n = $zip.CreateEntry($entryName)
  $w = New-Object IO.StreamWriter($n.Open(), (New-Object Text.UTF8Encoding($false))); $w.Write($x); $w.Close()
}
Rewrite "docProps/core.xml" {
  param($x)
  $x = $x -replace '<dc:creator>[^<]*</dc:creator>', '<dc:creator></dc:creator>'
  $x = $x -replace '<cp:lastModifiedBy>[^<]*</cp:lastModifiedBy>', '<cp:lastModifiedBy></cp:lastModifiedBy>'
  $x = $x -replace '<dc:description>[^<]*</dc:description>', ''
  $x = $x -replace '</cp:coreProperties>', "<dc:description>Generated by tools/deck-pptx/build.ps1 from $Name.html. Edit the HTML deck and rebuild; do not edit this file.</dc:description></cp:coreProperties>"
  return $x
}
Rewrite "docProps/app.xml" {
  param($x)
  $x = $x -replace '<Company>[^<]*</Company>', '<Company></Company>'
  $x = $x -replace '<Manager>[^<]*</Manager>', '<Manager></Manager>'
  return $x
}
$zip.Dispose()
Write-Output "Wrote $target ($($spec.states.Count) slides)"
