---
date: "2018-03-24T00:00:00Z"
categories:
- Forensics
title: PNG 파일 구조
summary: " "
---

CTF를 풀다보면 PNG 파일 구조를 조작해둔 포렌식 문제를 종종 볼 수 있습니다.
PNG 포맷 관련하여 생각보다 한국어로 정리된 자료가 없어서,
기본적인 PNG 파일의 구조를 정리해보았습니다.

---

## File signature

`89 50 4E 47 0D 0A 1A 0A`

PNG 파일은 8 바이트의 시그니쳐를 갖습니다.
이중 `50 4E 47`이 ASCII 값으로 PNG이기도 해서,
Hex viewer에서 PNG 파일을 열었을 때 이 부분이 보이면
쉽게 PNG 파일이라고 판단할 수 있습니다.


## Chunk

PNG 파일은 N개의 청크(chunk)로 구성됩니다. 청크의 구조는 아래와 같습니다.

```
{
  Length (4 byte),          # Chunk의 크기
  Chunk Type (4 byte),      # Chunk의 타입
  Chunk Data (length byte), # Chunk 내용
  CRC (4byte)               # 오류 검사를 위한 값
}
```

CRC를 계산하는 식은 [이 곳](https://www.w3.org/TR/PNG/#D-CRCAppendix)에 정리되어 있습니다.

청크의 타입에는 여러가지가 있고,
그 중에서 모든 PNG 파일에 반드시 포함되어야 하는 청크로 다음의 세가지 청크가 있습니다.

- IHDR
- IDAT
- IEND

그 외의 청크는 PNG 파일의 타입에 따라 요구되거나,
또는 메타데이터를 저장하는 데에 사용됩니다.

### IHDR

IHDR 청크는 header라는 이름에서 알 수 있듯이
PNG 파일의 가장 앞에 위치하는 청크로,
PNG 이미지의 크기, 필터링 방식, 압축 방식 등을 알려줍니다.

```
{
 Length : 00 00 00 0D (13 byte),
 Chunk Type : IHDR,
 Chunk Data ( 13 byte ),
 {
   Width (4 byte),
   Height (4 byte),
   Bit depth (1 byte),
   Color Type (1 byte),
   Compression method (1 byte),
   Filter method (1 byte),
   Interlace method (1 byte),
 }
 CRC
}
```

IHDR 청크의 데이터 길이는 언제나 13바이트이고,
내용은 다음과 같습니다.

- Width & Height

이미지의 폭과 높이를 지정합니다.
일반적으로 이미지 뷰어, 브라우저 등은 이 값을 바탕으로
이미지 데이터를 디코딩하고 출력합니다.
따라서 이 부분을 조작하면 이미지를 일그러뜨리거나 이미지의 아랫부분을 감추는 것도
가능합니다. ([예시](https://github.com/ryanking13/png-unhide))

- Color type & Bit depth

Color type은 PNG 이미지의 색상을 어떻게 구성할 것인지를 정하고,
Bit depth는 하나의 채널(channel)이 몇 비트로 구성될 지를 정합니다.
이미지의 한 픽셀(pixel)은 하나 또는 여러개의 채널로 구성될 수 있습니다.
예를 들어 RGB Color type 이라면 한 픽셀은 3개의 채널 (R, G, B)를 갖습니다.

| PNG image type       | Color type | Allowed bit depths | Interpretation                    |
| :------------------- | :--------- | :----------------- | :-------------------------------- |
| Grayscale            | 0          | 1, 2, 4, 8, 16     | 그레이 스케일 값을 갖는다         |
| Truecolor            | 2          | 8, 16              | RGB 값을 갖는다                   |
| Indexed-color        | 3          | 1, 2, 4, 8         | 팔레트에 따른 값을 갖는다         |
| Grayscale with alpha | 4          | 8, 16              | 그레이 스케일 + alpha 값을 갖는다 |
| Truecolor with alpha | 6          | 8, 16              | RGB + alpha 값을 갖는다           |

예를 들어, 흔히 웹에서 볼 수 있는 투명도가 있는 RGBA 이미지
(`#FFFFFF00` 꼴로 색상을 나타내는) 의 경우,
Color type은 6, Bit depth는 8이 됩니다.
주목할 만한 것은 하나의 채널이 1바이트보다 작은 단위의 비트로도
구성될 수 있다는 점입니다.

Indexed-color의 경우는 추가로 파일에 `PLTE` 청크가 존재하여야 합니다.
해당 청크에서 사용할 팔레트를 지정합니다.


- Compression method

압축 방식을 지정합니다.
현재까지 PNG에서 표준으로 정의된 압축 방식은
0: [DEFLATE](https://en.wikipedia.org/wiki/DEFLATE) 한 가지입니다.

- Filter method

필터링 방식을 지정합니다.
필터링 방식에 대해서는 `IDAT` 청크를 설명할 때 다시 다루겠습니다.
현재까지 PNG에서 표준으로 정의된 필터링 방식은 0 한 가지입니다.

- Interlace method

인터레이스는 웹 페이지 등에 이미지를 표시할 때
이미지 로딩이 완료되기 전 먼저 해상도가 낮은 이미지를 보여주기 위하여 사용됩니다.

현재까지 PNG에서 표준으로 정의된 인터레이스 방식은,
0 (No interlace),
1 ([Adam7](https://en.wikipedia.org/wiki/Adam7_algorithm) interlace)
두 가지입니다.

### IDAT

`IDAT` 청크는 실제로 이미지 데이터가 들어가는 부분입니다.
이미지의 원본 픽셀 데이터가 필터링과 압축을 거쳐서 IDAT 청크에 저장됩니다.

__인코딩 과정__

- 픽셀 데이터 --> Filter --> Compression --> IDAT chunk data

__디코딩 과정__

- IDAT chunk data --> Decompression --> Unfilter --> Pixel data

한 PNG 파일은 여러 개의 `IDAT` 청크를 가질 수 있는데,
이는 데이터를 적절한 사이즈로 나누어 전송하기 위한 것으로,
일반적으로 한 IDAT 청크당 65536 바이트의 데이터 크기를 갖습니다.

착각하기 쉬운 것은,
하나의 IDAT 청크가 이미지의 특정 부분을 나타내지는 않는다는 점입니다.
PNG는 전체 이미지 데이터를 한꺼번에 압축한 뒤,
여러 IDAT 청크에 나누어 담는 방식을 사용합니다.
따라서, 모든 IDAT 청크가 있어야만 이미지 디코딩이 가능합니다.
반대로 말하면, 하나의 IDAT 청크라도 사라지면 압축된 이미지를 디코딩 할 수 없습니다.


- 필터링

필터링은 원시 이미지 데이터의 압축률을 높이기 위하여
데이터를 가공하는 작업입니다.

현재 유일한 PNG 표준 필터링 방식(filter 0)은
이미지의 각 행(row, scanline)에 대하여
5가지 필터 타입 중 한 가지를 정하여 바이트 단위로 적용합니다.
이 때 어떠한 필터 타입을 적용할지는 휴리스틱적으로 결정한다.

필터링할 바이트를 x라고 했을 때,
x에 대한 상대적 위치에 따라 다음의 a, b, c를 정의합니다.

| Name | Position                                            |
| :--- | :-------------------------------------------------- |
| x    | 필터링할 바이트                                     |
| a    | x 바로 왼쪽 픽셀에서 x에 대응되는 바이트            |
| b    | x 바로 위 행(row, scanline)에서 x에 대응되는 바이트 |
| c    | b 바로 왼쪽 픽셀에서 b에 대응되는 바이트            |

```
c b
a x
```

간단하게 그림으로 나타내면 위와 같습니다.
이때 `대응된다`라는 것은 서로 다른 픽셀에서 같은 위치에 있는 바이트라는 뜻입니다.

예를 들어, color type이 RGB, bit depth가 16인 경우를 생각해보면,
한 픽셀은 6바이트로 구성되게 되는데,

```
A1B2C3 D4E5F6
012345 567890
```

필터링 하고자하는 바이트 x가 우측 하단의 8이라고 하면, a=3, b=5, c=2가 됩니다.

{{% admonition type="note" title="Bit depth < 8?" %}}

만약 bit depth가 8보다 작다면,
필터링 하는 단위가 여러 채널이 될 수도 있습니다.
이 경우는 픽셀 단위로 대응되는 바이트를 찾는 것이 아니라,
바이트 단위로 대응되는 값을 찾습니다. (즉, 왼쪽 바이트, 위쪽 바이트를 사용합니다.)

{{% /admonition %}}

위와 같이 정의되는 값을 바탕으로, 아래의 5가지 필터 타입을 적용합니다.

| Type | Name    | Filter Function                                                | Reconstruction Function                                            |
| :--- | :------ | :------------------------------------------------------------- | :----------------------------------------------------------------- |
| 0    | None    | Filt(x) = Orig(x)                                              | Recon(x) = Filt(x)                                                 |
| 1    | Sub     | Filt(x) = Orig(x) - Orig(a)                                    | Recon(x) = Filt(x) + Recon(a)                                      |
| 2    | Up      | Filt(x) = Orig(x) - Orig(b)                                    | Recon(x) = Filt(x) + Recon(b)                                      |
| 3    | Average | Filt(x) = Orig(x) - floor((Orig(a) + Orig(b)) / 2)             | Recon(x) = Filt(x) + floor((Recon(a) + Recon(b)) / 2)              |
| 4    | Paeth   | Filt(x) = Orig(x) - PaethPredictor(Orig(a), Orig(b), Orig(c )) | Recon(x) = Filt(x) + PaethPredictor(Recon(a), Recon(b), Recon(c )) |


```
R G B R G B R G B R G B R G B     Original image
R G B R G B R G B R G B R G B
R G B R G B R G B R G B R G B
R G B R G B R G B R G B R G B
R G B R G B R G B R G B R G B
R G B R G B R G B R G B R G B

            |
            | filtering
            |
            |

F d d d d d d d d d d d d d d d     Filtered Image Data
F d d d d d d d d d d d d d d d
F d d d d d d d d d d d d d d d
F d d d d d d d d d d d d d d d
F d d d d d d d d d d d d d d d
F d d d d d d d d d d d d d d d
```

원본 이미지 데이터와 필터링 후의 데이터를 시각적으로 나타내면 위와 같습니다.
각 행의 맨 앞 1 byte에는 어떠한 필터 타입을 적용했는 지가 기록되어
de-filter시에 사용될 수 있도록 하며, 나머지 바이트는 필터링된 바이트로 바뀌게됩니다.

따라서 필터링을 거친 이미지는 크기가 약간 (height bytes) 커지게 됩니다.

### IEND

```
{
 Length : 00 00 00 00 (0 byte),
 Chunk Type : IEND,
 Chunk Data (0 byte),
 CRC
}
```

`IEND` 청크는 이미지의 맨 뒤에 위치하는 청크로 PNG 파일의 끝을 나타냅니다.
데이터를 담는 목적으로 사용하지 않으므로 않으므로 Length 값은 언제나 0입니다.

### Reference

> https://www.w3.org/TR/PNG

> http://halicery.com/Image/png/pngdecoding.html

> http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html
