---
date: "2022-09-10T00:01:00"
title: pdqsort - Pattern-defeating Quicksort
categories:
- Algorithm
description: pdqsort - Pattern-defeating Quicksort
summary: " "
draft: true
---

알고리즘을 배웠다면 누구나 가장 처음 배우는 것이 정렬 알고리즘입니다.
보통은 버블 정렬(Bubble Sort)에서 시작해서 퀵 정렬(Quick Sort)과 병합 정렬(Merge Sort)까지 구현하면서,
시간 복잡도와 분할 정복, 재귀 등의 개념을 익히게 됩니다.

사실 웬만한 언어에서는 정렬 함수를 표준 라이브러리로 제공하다 보니,
이 정도의 이론적 내용을 알고 있다면 정렬 알고리즘을 사용하는 것에는 문제가 없는데요.
얼마 전 Golang 1.18 릴리즈에서 [기본 정렬 알고리즘이
pdqsort로 변경된다는 소식](https://github.com/golang/go/issues/50154)을 듣고서,
최신 언어 구현체에서는 어떤 식으로 정렬 알고리즘을 최적화하고 있는지 알아보게 되었습니다.

그래서 이 글에서는 Golang과 Rust의 표준 정렬 알고리즘으로 선정된 pdqsort를 소개하면서
현대 정렬 알고리즘의 최적화 기법에 대해서 소개하고자 합니다.

> 본 글은 다음의 자료를 참고하여 작성되었습니다.
> - https://www.youtube.com/watch?v=jz-PBiWwNjc
> - https://arxiv.org/abs/2106.05123
> - https://arxiv.org/pdf/1604.06697.pdf

## 정렬 알고리즘 기본 지식

정렬 알고리즘을 공부했다면, 다음과 같은 내용을 이미 알고 있을 것입니다.

- `O(N^2)`의 시간 복잡도를 가지는 정렬 알고리즘으로 버블 정렬, 삽입 정렬(Insertion Sort)가 있고,
- `O(NlogN)`의 시간 복잡도를 가지는 정렬 알고리즘으로 퀵 정렬, 병합 정렬, 힙 정렬(Heap Sort)가 있다.
- 시간 복잡도 상에 나타나지 않는 상수값을 고려했을 때 일반적으로 퀵 정렬의 성능이 가장 좋아서 널리 사용되고 있으며,
- 비교 기반 정렬(Comparison Sort)의 경우 worst case 시간 복잡도의 [lower bound가 O(NlogN)임이 증명되어 있다.](https://tildesites.bowdoin.edu/~ltoma/teaching/cs231/fall04/Lectures/sortLB.pdf)

## 정렬 알고리즘의 최적화 방향성

본격적으로 내용을 시작하기 전에 알아두어야 할 것은 다음과 같습니다.
앞서 비교 기반 정렬 알고리즘의 worst case의 lower bound가 `O(NlogN)`임이 증명되어 있다는 것을
고려할 때, 정렬 알고리즘의 최적화는 이론적인 시간 복잡도 측면보다는
다음과 같은 요소들을 중점적으로 고려하여 이루어지게 됩니다. [^radixsort]

- 평균적인 경우나 worse case에서의 성능을 최적화
- 현실에서 흔히 사용되는 특수한 케이스를 최적화
- 하드웨어의 특성을 고려한 최적화

이러한 내용을 바탕으로, pdqsort의 기반이 되는 introsort로부터 시작해서,
pdqsort는 어떤 최적화 기법들을 더했는지 알아보겠습니다.

[^radixsort]: 물론 입력이 한정된 경우 `O(KN)`의 복잡도를 가진 Radix Sort 같은 경우도 존재합니다만,
이 글에서는 그러한 제약사항이 없는 경우를 이야기합니다,

## Introsort

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/introsort.webp" />
<div>
    <span style="color:grey"><small><i>Introsort 시각화 (출처: https://youtu.be/67ta5WTjjUo)</i></small></span>
</div>
</div>

우선 pdqsort의 기반이 되는 정렬 알고리즘인 Intro Sort(내성 정렬, Introspective Sort)를 알아보겠습니다.
Intro Sort는 이 글을 작성하고 있는 현 시점을 기준으로,
gcc에서 사용되는 기본 정렬 알고리즘이며,
퀵 정렬을 기본으로 힙 정렬과 삽입 정렬이 더해진 하이브리드(Hybrid) 정렬 기법입니다.

퀵 정렬은 일반적으로 가장 빠른 정렬 알고리즘으로 알려져 있지만,
잘못된 피벗(pivot)을 선택해서 partitioning이 제대로 이루어지지 않을 경우,
worst case의 시간 복잡도가 `O(N^2)`이 될 수 있습니다.

가장 대표적인 경우로는 이미 정렬된 배열을 정렬할 때가 있습니다.
이 경우, 피벗을 선택하는 과정에서 이미 정렬된 배열의 가장 앞 또는 뒤의 원소를 선택할 경우
partitioning이 제대로 이루어지지 않고, 시간 복잡도가 `O(N^2)`이 됩니다.

이에 Intro Sort에서는 기본적으로 퀵 정렬을 사용하되,
퀵 정렬의 worst case를 방지하기 위해 퀵 정렬의 재귀 호출이 일정 횟수를 넘어가면
worst case 시간 복잡도가 `O(NlogN)`으로 보장된 힙 정렬로 전환합니다.

또한 퀵 정렬의 재귀 과정에서 정렬 대상의 수(N)가 충분히 작아졌을 때는,
퀵 정렬에 비해 상대적으로 constant factor가 작은 삽입 정렬로 전환하여 최적화를 수행합니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/introsort-code.png" />
<div>
    <span style="color:grey"><small><i>Introsort pseudocode</i></small></span>
</div>
</div>

<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=19px&ph=18px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=void%2520introsort%28A%255B%255D%29%2520%257B%250A%2520%2520maxdepth%2520%253D%25202%2520*%2520log2%28length%28A%29%29%253B%250A%2520%2520introsort_inner%28A%252C%2520maxdepth%29%253B%250A%257D%250A%250Avoid%2520introsort_inner%28A%255B%255D%252C%2520depth%29%2520%257B%250A%2520%2520if%2520%28length%28A%29%2520%253C%252016%29%2520insertion_sort%28A%29%253B%250A%2520%2520else%2520if%2520%28depth%2520%253D%253D%25200%29%2520heapsort%28A%29%253B%250A%2520%2520else%2520%257B%250A%2520%2520%2520%2520p%2520%253D%2520partition%28A%29%253B%250A%2520%2520%2520%2520introsort_inner%28A%255B1%253Ap-1%255D%252C%2520depth-1%29%253B%250A%2520%2520%2520%2520introsort_inner%28A%255Bp%252B1%253Alength%28A%29%255D%252C%2520depth-1%29%253B%250A%2520%2520%257D%250A%257D -->

이제 Intro Sort를 기반으로 하여 본격적으로 pdqsort의 최적화 방법들을 알아보겠습니다.

### BlockQuicksort - Branchless Prediction

가장 먼저 소개할 것은 퀵 정렬의 Partitioning 과정을 최적화하는 기법입니다.
이는 pdqsort에서 사용되었지만, 2016년에 발표된
[BlockQuicksort](https://arxiv.org/pdf/2106.05123.pdf) 논문에서 처음 소개된 기법입니다.

퀵 정렬의 partitioning의 한 가지 문제점은,
피벗을 기준으로 작은 값들과 큰 값들을 나누는 과정에서
많은 branch prediction이 발생한다는 점입니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-normal.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=void%2520partition%28A%255B%255D%252C%2520pivot%252C%2520l%252C%2520r%29%2520%257B%2520%2520%250A%2520%2520while%28l%2520%253C%2520r%29%2520%257B%250A%2520%2520%2520%2520while%2520%28A%255Bl%255D%2520%253C%2520pivot%29%2520l%252B%252B%253B%250A%2520%2520%2520%2520while%2520%28A%255Br%255D%2520%253E%2520pivot%29%2520r--%253B%250A%2520%2520%2520%2520if%2520%28l%2520%253C%2520r%29%2520%257B%250A%2520%2520%2520%2520%2520%2520swap%28A%255Bl%255D%252C%2520A%255Br%255D%29%253B%250A%2520%2520%2520%2520%2520%2520l%252B%252B%253B%2520r--%253B%250A%2520%2520%2520%2520%257D%250A%2520%2520%257D%250A%257D -->
</div>

위 그림은 일반적인 퀵 정렬의 partitioning 과정을 보여주는데요.
swap할 대상을 찾기 위해 `l`, `r` 포인터를 이동시키는 과정에서
많은 branch prediction이 발생합니다.

BlockQuicksort에서는 이러한 branch prediction을 최소화하기 위해

- swap 대상이 되는 포인터들을 찾는 과정
- 실제로 swap을 수행하는 과정

과 같이 두 과정을 분리하여 각 과정을 개별 포인터가 아닌 블록 단위로 처리함으로써
branch prediction을 없애는 방법을 제안했습니다.


<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-block.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=num_l%2520%253D%25200%253B%250Afor%2520%28i%2520%253D%25200%253B%2520i%2520%253C%2520block_size%253B%2520i%252B%252B%29%2520%257B%250A%2520%2520offsets_l%255Bnum_l%255D%2520%253D%2520i%253B%250A%2520%2520num_l%2520%252B%253D%2520*%28l%2520%252B%2520i%29%2520%253E%253D%2520pivot%253B%250A%257D%250A%250A%252F%252F%2520do%2520same%2520for%2520offsets_r%250A%250Afor%2520%28int%2520i%2520%253D%25200%253B%2520i%2520%253C%2520min%28num_l%252C%2520num_r%29%253B%2520i%252B%252B%29%2520%257B%250A%2520%2520swap%28l%2520%252B%2520offsets_l%255Bi%255D%252C%2520r%2520-%2520offsets_r%255Bi%255D%29%253B%250A%257D -->
</div>

위 그림은 블록 단위로 partitioning을 수행하는 과정을 보여주는데요.
주목해야 할 부분은, `num_l`을 업데이트하는 부분으로,
컴파일 시에 contional branch (`Jcc`)가 생성되는 if 문을 사용하지 않고,
`CMOVcc`나 `SETcc`와 같은 conditional move / set instruction 명령어가 생성되게끔 구현된 모습을 볼 수 있습니다. [^comparision]

[^comparision]: 단, 이는 값을 비교하는 함수가 그 자체로 branchless인 경우에만 효과를 볼 수 있습니다.

만약 위 그림을 if 문을 사용해서 구현한다면 아래와 같습니다.
이 경우는 branch prediction이 발생합니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-block-if.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=num_l%2520%253D%25200%253B%250Afor%2520%28i%2520%253D%25200%253B%2520i%2520%253C%2520block_size%253B%2520i%252B%252B%29%2520%257B%250A%2520%2520if%2520%28*%28l%2520%252B%2520i%29%2520%253E%253D%2520pivot%29%2520%257B%250A%2520%2520%2520%2520offsets_l%255Bnum_l%255D%2520%253D%2520i%253B%250A%2520%2520%2520%2520num_1%252B%252B%253B%250A%2520%2520%257D%250A%257D -->
</div>

BlockQuicksort를 이용한 Branchless Prediction은 원 논문 기준으로 80% 수준의 성능 향상을 보였다고 되어있으며,
가장 중요한 최적화 기법 중 하나로 꼽힙니다. BlockQuicksort는 앞서 설명한 핵심 개념 외에도,
블록 단위 연산에서의 loop-unrolling과 swap 과정에서 data movement를 최적화하는 방법,
그리고 Block size와 L1 캐시 크기를 맞추는 것에 따른 캐싱 효과 최적화 등을 포함하고 있으니
관심이 있으시다면 원 논문을 읽어보시는 것을 추천드립니다.

### Quicksort pivot selection



### bounds check elimination

### Cache


{{% youtube "gjSfhGdgVc0" %}}

<div style="text-align: center;">
<div>
    <span style="color:grey"><small><i>pdqsort 시각화</i></small></span>
</div>
</div>