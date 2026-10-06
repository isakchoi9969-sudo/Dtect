param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\docs\sentiment-model-presentation.png')
)

Add-Type -AssemblyName System.Drawing

$bitmap = [System.Drawing.Bitmap]::new(1920, 1080)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function Color([string]$hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }

function Rounded-Rect($g, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r, [string]$fill, [string]$stroke) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $brush = [System.Drawing.SolidBrush]::new((Color $fill))
  $pen = [System.Drawing.Pen]::new((Color $stroke), 2)
  try { $g.FillPath($brush, $path); $g.DrawPath($pen, $path) }
  finally { $brush.Dispose(); $pen.Dispose(); $path.Dispose() }
}

function Text($g, [string]$value, [int]$x, [int]$y, [int]$w, [int]$h, [int]$size, [string]$color, [bool]$bold = $false) {
  $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
  $font = [System.Drawing.Font]::new('Malgun Gothic', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new((Color $color))
  $format = [System.Drawing.StringFormat]::new()
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
  try { $g.DrawString($value, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $format) }
  finally { $font.Dispose(); $brush.Dispose(); $format.Dispose() }
}

function Arrow($g, [int]$x1, [int]$x2, [int]$y) {
  $pen = [System.Drawing.Pen]::new((Color '#80BDFF'), 4)
  $cap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(7, 8)
  $pen.CustomEndCap = $cap
  try { $g.DrawLine($pen, $x1, $y, $x2, $y) }
  finally { $cap.Dispose(); $pen.Dispose() }
}

try {
  $graphics.Clear((Color '#0B1525'))
  Text $graphics '기업 분석 화면의 뉴스 감성분석 파이프라인' 64 34 1790 73 49 '#F4F8FF' $true
  Text $graphics '기업 선택부터 뉴스 수집·선별, 금융 특화 모델 추론, 감성 분포 시각화까지' 66 112 1790 48 26 '#BCD0E3'

  Rounded-Rect $graphics 64 217 420 536 24 '#182A42' '#38506C'
  Text $graphics '① 사용자가 기업 선택' 90 244 368 67 31 '#79B8FF' $true
  Text $graphics '기업 검색에서 원하는' 92 354 360 48 26 '#F4F8FF'
  Text $graphics '기업을 클릭합니다' 92 400 360 48 26 '#F4F8FF'
  Rounded-Rect $graphics 91 484 358 90 18 '#203957' '#4B7099'
  Text $graphics '예: 삼성전자 분석 화면' 111 505 324 54 26 '#E1ECF8' $true
  Text $graphics '화면이 선택한 기업의' 92 628 360 44 24 '#BCD0E3'
  Text $graphics '뉴스 분석을 요청합니다' 92 674 360 44 24 '#BCD0E3'

  Rounded-Rect $graphics 518 217 420 536 24 '#182A42' '#38506C'
  Text $graphics '② 뉴스 수집·선별' 544 244 370 67 31 '#7ADBC1' $true
  Text $graphics '네이버 API Hub에서' 546 350 364 48 26 '#F4F8FF' $true
  Text $graphics '기업명·별칭으로 검색' 546 402 364 48 25 '#F4F8FF'
  Text $graphics '기사 제목·요약·링크 수신' 546 480 364 48 24 '#D7E8F7'
  Text $graphics '회사 언급·언론사 확인' 546 568 364 48 24 '#BCD0E3'
  Text $graphics '중복 제외 · 최대 100건' 546 620 364 48 24 '#BCD0E3'

  Rounded-Rect $graphics 972 217 420 536 24 '#1D3956' '#4B7099'
  Text $graphics '③ 모델로 기사별 분류' 998 244 368 67 30 '#F4C377' $true
  Text $graphics 'Hugging Face 공개 모델' 1000 341 366 48 25 '#D7E8F7'
  Text $graphics 'KR-FinBERT-SC' 1000 391 366 55 32 '#F4F8FF' $true
  Text $graphics '한국어 금융 뉴스용' 1000 465 366 46 25 '#F4F8FF'
  Text $graphics '긍정·중립·부정 분류기' 1000 509 366 46 25 '#F4F8FF'
  Text $graphics '기사 제목+요약을 입력해' 1000 603 366 43 23 '#BCD0E3'
  Text $graphics '라벨·모델 점수를 받습니다' 1000 646 366 47 23 '#BCD0E3'

  Rounded-Rect $graphics 1426 217 420 536 24 '#182A42' '#38506C'
  Text $graphics '④ 분석 화면에 표시' 1452 244 368 67 31 '#D2A9F7' $true
  Text $graphics '기사마다 감성 라벨 표시' 1454 348 364 48 25 '#F4F8FF'
  Text $graphics '전체 기사 건수로 비율 계산' 1454 406 364 48 25 '#F4F8FF'
  Rounded-Rect $graphics 1454 493 364 110 18 '#203957' '#4B7099'
  Text $graphics '예: 긍정 3 · 중립 5 · 부정 2' 1472 505 336 43 22 '#D7E8F7'
  Text $graphics '30% · 50% · 20%' 1472 551 336 46 27 '#7ADBC1' $true
  Text $graphics '감성 분석 요약에 반영' 1454 655 364 48 24 '#BCD0E3'

  Arrow $graphics 488 512 469
  Arrow $graphics 942 966 469
  Arrow $graphics 1396 1420 469

  Rounded-Rect $graphics 64 790 1782 205 23 '#203957' '#4B7099'
  Text $graphics '시스템 구성' 91 812 900 52 31 '#F4F8FF' $true
  Text $graphics '데이터 수집  |  NAVER API Hub' 93 881 520 42 25 '#7ADBC1' $true
  Text $graphics '기업명·별칭 기반 뉴스 검색' 93 925 520 42 23 '#D7E8F7'
  Text $graphics '감성 추론  |  KR-FinBERT-SC' 652 881 560 42 25 '#F4C377' $true
  Text $graphics '한국어 금융 뉴스 3분류 모델' 652 925 560 42 23 '#D7E8F7'
  Text $graphics '서비스 처리  |  D:TECT' 1264 881 530 42 25 '#79B8FF' $true
  Text $graphics '관련 기사 선별·결과 집계·시각화' 1264 925 530 42 23 '#D7E8F7'

  $resolvedPath = [System.IO.Path]::GetFullPath($OutputPath)
  [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($resolvedPath)) | Out-Null
  $bitmap.Save($resolvedPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output $resolvedPath
} finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}
