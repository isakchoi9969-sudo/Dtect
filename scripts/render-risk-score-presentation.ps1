param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\docs\risk-score-presentation.png')
)

Add-Type -AssemblyName System.Drawing

$width = 1600
$height = 900
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function Color([string]$hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Draw-RoundedRect($g, [int]$x, [int]$y, [int]$w, [int]$h, [int]$radius, [string]$fill, [string]$stroke) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $brush = [System.Drawing.SolidBrush]::new((Color $fill))
  $pen = [System.Drawing.Pen]::new((Color $stroke), 2)
  try {
    $g.FillPath($brush, $path)
    $g.DrawPath($pen, $path)
  } finally {
    $brush.Dispose()
    $pen.Dispose()
    $path.Dispose()
  }
}

function Draw-Text($g, [string]$value, [int]$x, [int]$y, [int]$w, [int]$h, [int]$size, [string]$color, [bool]$bold = $false) {
  $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
  $font = [System.Drawing.Font]::new('Malgun Gothic', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new((Color $color))
  $format = [System.Drawing.StringFormat]::new()
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
  try {
    $g.DrawString($value, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $format)
  } finally {
    $font.Dispose()
    $brush.Dispose()
    $format.Dispose()
  }
}

function Draw-Card($g, [int]$x, [int]$y, [string]$title, [string]$weight, [string]$what, [string]$why, [string]$calculation, [string]$accent) {
  Draw-RoundedRect $g $x $y 720 270 22 '#18283F' '#344861'
  $accentBrush = [System.Drawing.SolidBrush]::new((Color $accent))
  try { $g.FillRectangle($accentBrush, $x + 28, $y + 35, 7, 48) } finally { $accentBrush.Dispose() }
  Draw-Text $g $title ($x + 50) ($y + 25) 470 58 32 '#F4F8FF' $true
  Draw-Text $g $weight ($x + 550) ($y + 17) 145 75 48 $accent $true
  Draw-Text $g $what ($x + 34) ($y + 108) 655 40 25 '#E1ECF8'
  Draw-Text $g $why ($x + 34) ($y + 152) 655 66 22 '#B9CDE2'
  Draw-Text $g $calculation ($x + 34) ($y + 222) 655 42 26 $accent $true
}

try {
  $graphics.Clear((Color '#0B1525'))

  Draw-Text $graphics '종합 리스크 점수, 이렇게 만듭니다' 64 34 1450 69 48 '#F4F8FF' $true
  Draw-Text $graphics '최근 30일의 기업 관련 뉴스에서 4가지 신호를 산출하고 가중 합산합니다' 66 103 1450 42 25 '#B9CDE2'

  Draw-Card $graphics 64 160 '이슈 영향도' '40%' '사업에 줄 수 있는 영향의 크기' '가장 직접적인 위험 판단 근거이므로 가장 크게 반영' '예시  60점 × 40% = 24점' '#79B8FF'
  Draw-Card $graphics 816 160 '기사 정서 지표' '30%' '우려성 기사 비율과 분류 신뢰도' '기사 분위기만으로 실제 피해를 단정할 수 없어 2순위' '예시  20점 × 30% = 6점' '#7ADBC1'
  Draw-Card $graphics 64 450 '이슈 보도 확산도' '20%' '평소보다 늘어난 관련 보도' '보도량 증가가 곧 피해 규모는 아니므로 보조 반영' '예시  30점 × 20% = 6점' '#F4C377'
  Draw-Card $graphics 816 450 '보도 지속도' '10%' '우려성 보도가 이어진 날짜 수' '같은 사안의 반복 보도일 수 있어 가장 낮은 비중' '예시  40점 × 10% = 4점' '#D2A9F7'

  Draw-RoundedRect $graphics 64 748 1472 103 22 '#203957' '#4C7298'
  Draw-Text $graphics '24 + 6 + 6 + 4 =' 98 767 650 62 39 '#E1ECF8' $true
  Draw-Text $graphics '40점 / 100점' 760 760 560 72 52 '#F4F8FF' $true
  Draw-RoundedRect $graphics 1330 774 166 53 18 '#554118' '#8B6A29'
  Draw-Text $graphics '주의' 1378 778 105 47 28 '#FFE2A0' $true

  Draw-Text $graphics '발표용 가상 예시 · 40/30/20/10%는 서비스 설계 가중치이며 실제 손실 확률을 뜻하지 않습니다.' 69 860 1450 30 19 '#9EB3CB'

  $resolvedPath = [System.IO.Path]::GetFullPath($OutputPath)
  $directory = [System.IO.Path]::GetDirectoryName($resolvedPath)
  [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  $bitmap.Save($resolvedPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output $resolvedPath
} finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}
