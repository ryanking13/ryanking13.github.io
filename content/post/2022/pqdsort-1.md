---
date: "2022-10-12T00:01:00"
title: pdqsort - Pattern-defeating Quicksort
categories:
- Algorithm
description: pdqsort - Pattern-defeating Quicksort
summary: " "
draft: true
---

[[[맞춤법검사]]]

알고리즘을 배웠다면 누구나 가장 처음 배우는 것이 정렬 알고리즘입니다.
보통은 버블 정렬(Bubble Sort)에서 시작해서 최종적으로 퀵 정렬(Quick Sort)과
병합 정렬(Merge Sort)까지 배우게 되고,
그 과정에서 시간 복잡도와 분할 정복, 재귀 등의 개념을 익히게 됩니다.

사실 웬만한 언어에서는 정렬 함수를 표준 라이브러리로 제공하다 보니,
기본적인 내용만 알고 있다면 정렬 알고리즘을 사용하는 것에는 문제가 없는데요.
그렇다 보니 별도의 관심이 없다면
각 언어의 내부 정렬 함수가 어떻게 구현되어 있는지는 알지 못하는 경우가 많습니다.
저 역시도 크게 관심을 두지 않는 부분이였구요.

그러다 얼마 전 Golang 1.18 릴리즈에서 [기본 정렬 알고리즘이
pdqsort로 변경된다는 소식](https://github.com/golang/go/issues/50154)을 듣고서,
최신 언어 구현체에서 사용되는 정렬 알고리즘에 대해 알아보게 되었습니다.
그래서 이 글에서는 Golang과 Rust의 표준 정렬 알고리즘으로 선정된 pdqsort를 소개하면서
현대 정렬 알고리즘의 최적화 기법에 대해서 소개하고자 합니다.

> 본 글은 다음의 자료를 참고하여 작성되었습니다.
> - [Pattern-defeating Quicksort - Orson Peters](https://www.youtube.com/watch?v=jz-PBiWwNjc)
> - [Pattern-defeating Quicksort](https://arxiv.org/abs/2106.05123)
> - [BlockQuicksort: How Branch Mispredictions don't affect Quicksort](https://arxiv.org/abs/1604.06697)

{{% admonition type="note" title="Note" %}}

pdqsort는 Unstable Sort의 한 종류로,
비교 값이 동일한 원소에 대해서 정렬 전후의 순서가 동일함을 보장하지 않습니다.
이를 보장하는 Stable Sort 중에서
현 시점에서 효율적이라고 알려진 정렬 알고리즘은
Python에서 표준 정렬 알고리즘으로 사용되는
[Tim Sort](https://en.wikipedia.org/wiki/Timsort)입니다.

{{% /admonition %}}

## 정렬 알고리즘 관련 기본 지식

이 글은 아래의 정렬 알고리즘에 대한 기초 지식을 알고 있음을 전제로 작성되었습니다.

- `O(N^2)`의 시간 복잡도를 가지는 정렬 알고리즘으로 버블 정렬(Bubble Sort),
삽입 정렬(Insertion Sort)이 있다.
- `O(NlogN)`의 시간 복잡도를 가지는 정렬 알고리즘으로 퀵 정렬(Quick Sort),
병합 정렬(Merge Sort), 힙 정렬(Heap Sort)이 있다.
- 퀵 정렬은 병합 정렬과 비교했을 때 추가적인 메모리 공간을 사용하지 않고,
힙 정렬과 비교했을 때는 캐시 효율이 더 좋아서 일반적으로
가장 널리 사용되고 있다.
- 비교 기반 정렬(Comparison Sort)은
최악의 경우(worst case)의 시간 복잡도의 [lower bound가 O(NlogN)임이 증명되어 있다.](https://tildesites.bowdoin.edu/~ltoma/teaching/cs231/fall04/Lectures/sortLB.pdf)

## 정렬 알고리즘의 최적화 방향성

비교 기반 정렬 알고리즘은 최악의 경우의 lower bound가
`O(NlogN)`임이 증명되어 있다는 것을 고려할 때,
정렬 알고리즘의 최적화는 시간 복잡도 측면보다는
다음과 같은 요소들을 고려하여 이루어지게 됩니다. [^radixsort]

- 평균적인 경우 또는 최악의 경우에 대해 성능을 최적화
- 현실에서 널리 볼 수 있는 패턴에 대한 최적화
- 캐시와 같은 하드웨어의 특성을 고려한 최적화

이러한 내용을 바탕으로, pqdsort의 최적화 기법에 대해 알아보겠습니다.

[^radixsort]: 물론 입력의 범위가 종류가 한정된 경우 `O(N)`의 복잡도를 가진
Counting Sort 같은 경우도 존재합니다만,
이 글에서는 그러한 제약사항이 없는 경우를 이야기합니다,

## Introsort

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/introsort.webp" />
<div>
    <span style="color:grey"><small><i>Introsort 시각화 (출처: https://youtu.be/67ta5WTjjUo)</i></small></span>
</div>
</div>

우선 pdqsort의 기반이 되는 정렬 알고리즘인
Introsort(내성 정렬, Introspective Sort)를 살펴보겠습니다.
Introsort는 이 글을 작성하고 있는 시점에
gcc(libstdc++)에서 사용되는 기본 정렬 알고리즘이며,
퀵 정렬을 기반으로 힙 정렬과 삽입 정렬이 더해진
하이브리드(Hybrid) 정렬 기법입니다.

퀵 정렬은 일반적으로 가장 빠른 정렬 알고리즘으로 알려져 있지만,
잘못된 피벗(pivot)을 선택해서 파티셔닝(partitioning)이 제대로 이루어지지 않을 경우,
최악의 경우 시간 복잡도가 `O(N^2)`이 될 수 있습니다.
대표적인 경우로는 이미 정렬된 배열을 정렬할 때가 있습니다.
이 때, 피벗을 선택하는 과정에서 이미 정렬된 배열의 가장 앞 또는 뒤의 원소를 선택할 경우
파티셔닝이 제대로 이루어지지 않고, 시간 복잡도가 `O(N^2)`이 되는 경우가 발생합니다.

이에 Introsort에서는 기본적으로 퀵 정렬을 사용하되,
잘못된 파티셔닝이 지속적으로 이루어지는 경우를 방지하기 위해
퀵 정렬의 재귀 호출이 일정 횟수를 넘어가면
최악의 경우 시간 복잡도가 `O(NlogN)`으로 보장된 힙 정렬로 전환합니다.

또한 퀵 정렬의 재귀 과정에서 정렬 대상의 개수가 충분히 작아졌을 때,
Introsort는 삽입 정렬로 전환하여 최적화를 수행합니다. 삽입 정렬은
시간복잡도가 `O(N^2)`이지만, 정렬 대상의 개수가 작을 때는
퀵 정렬에서 발생하는 피벗 선택 등의 추가적인 오버헤드가 발생하지 않기 때문에
더 효율적이라고 알려져 있습니다.

Introsort의 전체적인 흐름을 나타낸 코드는 아래와 같습니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/introsort-code.png" />
<div>
    <span style="color:grey"><small><i>Introsort pseudocode</i></small></span>
</div>
</div>
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=19px&ph=18px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=void%2520introsort%28A%255B%255D%29%2520%257B%250A%2520%2520maxdepth%2520%253D%25202%2520*%2520log2%28length%28A%29%29%253B%250A%2520%2520introsort_inner%28A%252C%2520maxdepth%29%253B%250A%257D%250A%250Avoid%2520introsort_inner%28A%255B%255D%252C%2520depth%29%2520%257B%250A%2520%2520if%2520%28length%28A%29%2520%253C%252016%29%2520insertion_sort%28A%29%253B%250A%2520%2520else%2520if%2520%28depth%2520%253D%253D%25200%29%2520heapsort%28A%29%253B%250A%2520%2520else%2520%257B%250A%2520%2520%2520%2520p%2520%253D%2520partition%28A%29%253B%250A%2520%2520%2520%2520introsort_inner%28A%255B1%253Ap-1%255D%252C%2520depth-1%29%253B%250A%2520%2520%2520%2520introsort_inner%28A%255Bp%252B1%253Alength%28A%29%255D%252C%2520depth-1%29%253B%250A%2520%2520%257D%250A%257D -->


이제 Introsort를 기반으로 pdqsort에 적용된 최적화 기법들을 알아보겠습니다.

## BlockQuicksort - Branchless Prediction

가장 먼저 소개할 것은 퀵 정렬의 파티셔닝 과정을 최적화하는 기법입니다.
이는 pdqsort에서 사용되었지만, 2016년에 발표된
[BlockQuicksort](https://arxiv.org/pdf/2106.05123.pdf)
논문에서 처음 소개된 기법입니다.

퀵 정렬 파티셔닝 과정의 한 가지 문제점은,
피벗을 기준으로 작은 값들과 큰 값들을 나누는 과정에서
많은 Branch Prediction(분기 예측)이 발생한다는 점입니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-normal.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=void%2520partition%28A%255B%255D%252C%2520pivot%252C%2520l%252C%2520r%29%2520%257B%2520%2520%250A%2520%2520while%28l%2520%253C%2520r%29%2520%257B%250A%2520%2520%2520%2520while%2520%28A%255Bl%255D%2520%253C%2520pivot%29%2520l%252B%252B%253B%250A%2520%2520%2520%2520while%2520%28A%255Br%255D%2520%253E%2520pivot%29%2520r--%253B%250A%2520%2520%2520%2520if%2520%28l%2520%253C%2520r%29%2520%257B%250A%2520%2520%2520%2520%2520%2520swap%28A%255Bl%255D%252C%2520A%255Br%255D%29%253B%250A%2520%2520%2520%2520%2520%2520l%252B%252B%253B%2520r--%253B%250A%2520%2520%2520%2520%257D%250A%2520%2520%257D%250A%257D -->
</div>

위 그림은 일반적인 퀵 정렬의 파티셔닝 과정을 보여주는데요.
swap할 대상을 찾기 위해 `l`, `r` 포인터를 이동시키는 과정에서
많은 branch prediction이 발생합니다.
CPU의 Instruction Cycle에 대해 공부한 적이 있다면,
branch mis-prediction이 성능에 큰 영향을 미친다는 것을 알고 계실 것입니다.

BlockQuicksort에서는 이러한 branch mis-prediction
문제를 최소화하기 위해

- swap 대상이 되는 포인터들을 찾는 과정
- 실제로 swap을 수행하는 과정

두 과정을 분리하여 각 과정을 개별 포인터가 아닌 블록 단위로 처리함으로써
branch prediction을 없애는 방법을 제안했습니다.


<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-block.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=num_l%2520%253D%25200%253B%250Afor%2520%28i%2520%253D%25200%253B%2520i%2520%253C%2520block_size%253B%2520i%252B%252B%29%2520%257B%250A%2520%2520offsets_l%255Bnum_l%255D%2520%253D%2520i%253B%250A%2520%2520num_l%2520%252B%253D%2520*%28l%2520%252B%2520i%29%2520%253E%253D%2520pivot%253B%250A%257D%250A%250A%252F%252F%2520do%2520same%2520for%2520offsets_r%250A%250Afor%2520%28int%2520i%2520%253D%25200%253B%2520i%2520%253C%2520min%28num_l%252C%2520num_r%29%253B%2520i%252B%252B%29%2520%257B%250A%2520%2520swap%28l%2520%252B%2520offsets_l%255Bi%255D%252C%2520r%2520-%2520offsets_r%255Bi%255D%29%253B%250A%257D -->
</div>

위 그림은 블록 단위로 파티셔닝을 수행하는 BlockQuicksort의
파티셔닝 과정을 보여주는데요.
주목해야 할 부분은, `num_l`을 업데이트하는 부분으로,
컴파일 시에 contional branch 명령어 (`Jcc`)가 생성되는 if / while 문을 사용하는 대신
`CMOVcc`나 `SETcc`와 같은 conditional move / set instruction
명령어가 생성되게끔 구현한 것을 확인할 수 있습니다. [^comparision]

[^comparision]: 단, 이는 값을 비교하는 함수가 그 자체로 branchless인
경우에만 효과를 볼 수 있습니다.

만약 위 그림을 if 문을 사용해서 구현한다면 아래와 같습니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-block-if.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=num_l%2520%253D%25200%253B%250Afor%2520%28i%2520%253D%25200%253B%2520i%2520%253C%2520block_size%253B%2520i%252B%252B%29%2520%257B%250A%2520%2520if%2520%28*%28l%2520%252B%2520i%29%2520%253E%253D%2520pivot%29%2520%257B%250A%2520%2520%2520%2520offsets_l%255Bnum_l%255D%2520%253D%2520i%253B%250A%2520%2520%2520%2520num_1%252B%252B%253B%250A%2520%2520%257D%250A%257D -->
</div>

이 경우는 if 문의 컴파일 하는 과정에서
contional branch 명령어가 생성되고 branch prediction이 발생합니다.

BlockQuicksort를 이용한 Branchless Prediction은
해당 논문에서 80%에 가까운 성능 향상을 보였다고 되어 있으며,
퀵 정렬에 적용된 가장 중요한 최적화 기법 중 하나로 꼽힙니다.

{{% admonition type="note" title="Note" %}}

BlockQuicksort는 본문에서 설명한 핵심 개념 외에도,
블록 단위 연산에서의 loop-unrolling을 통한 최적화,
swap 과정에서 data movement를 최적화하는 방법,
그리고 Block size와 L1 캐시 크기를 맞추는 것에 따른
캐싱 효과 최적화 등을 포함하고 있으니
관심이 있으시다면 원 논문을 읽어보시는 것을 추천드립니다.

{{% /admonition %}}

## Quick Sort Pivot selection

다음으로는 퀵 정렬에서 피벗을 선택하는 방법에 적용된 최적화 기법을 살펴보겠습니다.
앞서 퀵 정렬에서 피벗을 잘못 선택하여 파티셔닝이 제대로 이루어지지 않았을 때
퀵 정렬이 최악의 경우에 빠질 수 있다고 설명했습니다.
이는 반대로 얘기하면, 늘 좋은 피벗, 예를 들면 배열의 중간 값을 선택할 수 있다면 항상
최선의 성능을 낼 수 있다는 것을 의미하기도 합니다.

문제는 당연하게도 정렬되지 않은 배열에서 중간값을 찾는 것이
상수 시간에 불가능하다는 점인데요.
따라서 우리는 간단하면서도 효과적으로 피벗을 선택하는 방법이 필요합니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/quicksort-factor.png" />
<div>
    <span style="color:grey"><small><i>퀵 정렬의 파티셔팅 비율에 따른 slowdown 효과</i></small></span>
    <br/>
    <span style="color:grey"><small><i>(출처: https://arxiv.org/pdf/2106.05123.pdf)</i></small></span>
</div>
</div>

여기서 아주 흥미로운 사실은, 퀵 정렬에서 피벗을 어느정도 잘못 고르더라도
성능에 큰 영향을 미치지 않는다는 점입니다.
위 그래프는 파티셔닝 비율에 따른 퀵 정렬의 성능을 나타낸 것인데요.
90:10으로 아주 치우진 파티셔닝을 매번 반복한 경우에도
50:50으로 이상적인 파티셔닝이 이루어진 경우와 비교해서,
약 2배 정도의 시간이 소요되는 것을 확인할 수 있습니다.
즉, 이는 **적당히** 괜찮은 피벗만 고르더라도 퀵 정렬은
충분히 좋은 성능을 낼 수 있다는 것을 의미합니다.

이러한 특징을 바탕으로, 피벗을 선택하는 방법을 살펴보겠습니다.
일반적으로 잘 알려진 피벗 선택 방법은
**median-of-three**인데요.
이는 피벗을 선택하기 위해 배열의 첫 원소, 중간 원소, 마지막 원소를
비교하여 중간값을 피벗으로 선택하는 방법입니다.
이 방법은 피벗을 선택하는 데 드는 오버헤드가 아주 적고,
이미 정렬된 배열이나 역순으로 정렬된 배열과 같이
특정한 패턴을 갖고 있는 경우에도
적절한 피벗을 선택할 수 있다는 장점이 있습니다.

여기서 조금 더 나아간 방법은 **tukey's ninther**라고 알려진 방법인데요.
이는 median-of-three를 세 번 수행한 후, 그 결과를 다시 median-of-three로 선택하는 방법입니다.
이 방법은 피벗을 선택하는 데 드는 오버헤드가 조금 더 크지만,
median-of-three보다 더 좋은 피벗을 선택할 수 있다는 장점이 있습니다.

pdqsort에서는 이 두 방법을 혼합한 방법을 제시하는데요.
배열의 크기가 작은 경우는 tukey's ninther의 오버헤드를 줄이기 위해,
단순히 median-of-three를 사용하고,
배열의 크기가 특정 크기 이상인 경우(구현체에서는 *128*)에는
tukey's ninther를 사용합니다.
코드로 표현하면 다음과 같습니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/ninther.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=mid%2520%253D%2520size%2520%252F%25202%253B%250Aif%2520%28size%2520%253E%2520ninther_threshold%29%2520%257B%250A%2520%2520sort3%28st%252C%2520st%2520%252B%2520mid%252C%2520ed%2520-%25201%29%253B%250A%2520%2520sort3%28st%2520%252B%25201%252C%2520st%2520%252B%2520%28mid%2520-%25201%29%252C%2520ed%2520-%25202%29%253B%250A%2520%2520sort3%28st%2520%252B%25202%252C%2520st%2520%252B%2520%28mid%2520%252B%25201%29%252C%2520ed%2520-%25203%29%253B%250A%2520%2520%250A%2520%2520sort3%28st%2520%252B%2520%28mid%2520-%25201%29%252C%2520st%2520%252B%2520mid%252C%2520st%2520%252B%2520%28mid%2520%252B%25201%29%29%253B%250A%2520%2520swap%28st%252C%2520st%2520%252B%2520s2%29%253B%250A%257D%2520else%2520%257B%250A%2520%2520sort3%28st%252C%2520st%2520%252B%2520mid%252C%2520ed%2520-%25201%29%253B%250A%257D -->
</div>

별 것 아닌 휴리스틱이라고 생각할 수 있지만,
저자는 재귀적으로 호출되는 함수의 특성상 배열의 크기가 작은 경우의
호출이 아주 많이 발생하고,
이러한 케이스를 최적화하는 것이 중요하다고 얘기합니다.
결과적으로 이러한 최적화를 통해서 단순히 tukey's ninther를 사용하는 것보다
1.7% 정도의 성능 향상을 얻을 수 있었다고 합니다.

## Unguarded Insertion Sort

pdqsort에서 삽입 정렬을 최적화하는 방법으로는
Unguarded Insertion Sort라는 기법을 사용합니다. [^unguarded-insertion-sort]

[^unguarded-insertion-sort]: 해당 기법에 대한 공식적인 명칭이 있는 것 같지는 않고,
저자는 "전통적으로" 이런 이름으로 불린다고 논문에서 언급합니다.

이는 삽입 정렬에서 배열 끝 부분에 대한 검사(bound check)를 제거하는 방법인데요.
삽입 정렬이 수행되는 배열이 전체 배열이 아니라,
재귀 호출 과정에서의 부분 배열이라는 점을 이용합니다.

현재 삽입 정렬이 수행되는 부분 배열(chunk)이
전체 배열의 가장 왼쪽에 위치한 배열(leftmost chunk)가 아니라면,
현재 정렬하고자 하는 배열의 **왼쪽**에는 퀵 정렬의 파티셔닝 과정을 통해
현재 배열의 원소들보다는 작거나 같은 원소들로만 이루어진 배열이 존재함이 보장됩니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/insertion-bound-check.png" />
</div>

코드로 살펴보면, 일반적인 삽입 정렬의 삽입 과정은 위와 같은데요.
인덱스를 왼쪽으로 이동시켜가면서 값을 삽입할 수 있는 위치를 찾는 과정에서,
인덱스가 배열 범위를 넘어가지 않도록 검사하는 부분이 존재합니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/insertion-no-bound-check.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=while%28comp%28*idx%252C%2520val%29%29%2520%257B%2520%250A%2520%2520sift%28idx%29%253B%250A%2520%2520idx--%253B%250A%257D -->
</div>

그러나 Unguarded Insertion Sort에서는 인덱스 값이 배열 범위를 벗어나서
더 왼쪽으로 이동하더라도, 해당 위치이 더 작은 원소가 있다는 것이
보장되어 있으므로 해당 검사를 제거할 수 있습니다.


## Defeating Patterns

마지막으로는 이 정렬 기법에 pdqsort라는 이름이 붙은 이유에 해당하는,
특수한 **패턴**을 가진 데이터를 격파(?)하기 위해
적용된 최적화 기법에 대해서 살펴보겠습니다.

### Low cardinality

데이터의 유니크한 값의 종류(cardinality)가 적은 경우, 즉 많은 데이터가 중복된 값을 가지는 경우는
현실 세계에서 흔히 볼 수 있는 패턴입니다.

대표적인 예시로는 SQL에서 특정한 키를 기준으로 데이터를 정렬할 때가 있습니다.
이 경우, 데이터 자체는 매우 다양하더라도 정렬에 사용되는 키의 값의 종류는 한정적인 경우가 많습니다.

```
SELECT * FROM cars ORDER BY maker;
SELECT * FROM songs ORDER BY duration;
SELECT * FROM users ORDER BY age;
```

pdqsort는 이러한 특성을 갖는 데이터에 대해,
같은 값에 대한 불필요한 비교 과정을
최소화 하기 위해 다음과 같은 방법을 제시합니다.

1. 퀵 정렬의 파티셔닝 과정에서 정해진 피벗을 현재 배열의 바로 왼쪽에 위치한 값과 비교합니다.
2. [partition-left] **피벗이 현 배열의 왼쪽 값과 같다면,** 파티셔닝 과정에서 피벗과 같은 값을 피벗 왼쪽으로 보냅니다.
3. [partition-right] **피벗이 현 배열의 왼쪽 값보다 크다면**, 파티셔닝 과정에서 피벗과 같은 값을 피벗 오른쪽으로 보냅니다.
4. partition-left 가 이루어졌다면, 피벗 오른쪽에 대해서만 재귀를 수행합니다.
5. partition-right 가 이루어졌다면, 피벗 양쪽에 대해서 모두 재귀를 수행합니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/low-cardinality-partition.png" />
<div>
    <span style="color:grey"><small><i>출처: https://www.youtube.com/watch?v=jz-PBiWwNjc</i></small></span>
</div>
</div>

앞서 Unguarded Insertion Sort를 설명하면서, 현재 정렬 대상이 되는 부분 배열의 왼쪽에는
더 작거나 같은 값만이 존재한다는 것을 설명했습니다.

따라서, 피벗과 현 배열의 왼쪽에 있는 값이 같다면 (partition-left)
피벗이 현 배열에서 가장 작은 값이라는 것을 알 수 있습니다.
나아가서 파티셔닝 과정에서 피벗 왼쪽으로 보내지는 값들도 모두 피벗과 같은 값이라는 것을 알 수 있습니다.
즉, 파티셔닝 후에 피벗 왼쪽은 이미 정렬된 상태이므로 재귀를 수행할 필요가 없습니다.

글로 보면 이해하기 어려우니, 그림으로 살펴보겠습니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/low-cardinality-partition-step.png" />
<div>
    <span style="color:grey"><small><i>출처: https://www.youtube.com/watch?v=jz-PBiWwNjc</i></small></span>
</div>
</div>

위 그림은 두번의 파티셔닝을 수행하는 모습을 보여주고 있습니다.
핵심적인 부분은 아래 두 줄인데요.
partition-left가 수행된 후에,
피벗 왼쪽에는 피벗과 같은 값들만이 존재하고,
정렬이 완료된 상태임을 확인할 수 있습니다.
따라서 피벗 왼쪽 영역에 대해서는 재귀를 수행할 필요가 없다는 것을 알 수 있습니다.

이 방법은 얼마나 효과적일까요?

잘 생각해보면, 이 방법을 사용한 경우, 같은 값이 피벗이 되는 경우는 **최대 2번**이라는 것을 알 수 있습니다.
위 그림에서 살펴보면, 처음 7이 피벗으로 선택되면 partition-right을 통해 배열에 존재하는 남은 7들은
모두 피벗의 오른쪽으로 이동하게 됩니다. 이후에 오른쪽 부분 배열에서 다시 7이 피벗으로 선택되면
해당 부분 배열의 왼쪽에는 앞서 피벗으로 선택했던 7이 존재하고, partition-left를 통해 남은 모든 7들이
피벗의 왼쪽으로 이동하고 정렬이 완료되기 때문에 다시 피벗으로 선택되지 않습니다.

따라서, 데이터의 서로 다른 값의 개수가 K일 때 최대 2K번의 재귀가 수행되므로,
수행 시간의 upper bound는 `O(NK)`가 됩니다.

### Pre-sorted / Mostly sorted

또 다른 흔한 케이스로, 이미 대부분 정렬되어 있는 데이터를 다시 정렬하는 경우가 있습니다.
대표적으로는 이미 정렬된 데이터에 새로운 데이터가 추가되는 경우가 있습니다.

이러한 데이터 패턴에 대한 휴리스틱적인 해결책으로,
pdqsort에서는 llvm의 libc++에서 도입되었던
낙관적인 삽입 정렬(Optimistic Insertion Sort)이라는
아이디어를 사용합니다. [^optimistic-insertion-sort]

[^optimistic-insertion-sort]: 저자의 말로는 llvm에서는 사용되고 있었지만,
공식적으로 논문 등에 기록되어 있지는 않았다고 합니다.

이 아이디어는 굉장히 간단한데요.
이미 모든 원소 또는 대부분의 원소가 정렬된 케이스를 탐지하기 위해서,
퀵 정렬의 파티셔닝 과정에서 아무런 swap이 일어나지 않은 경우를 탐지하고,
이 경우, 이미 대부분의 데이터가 정렬되어있을 가능성을 고려해,
재귀적으로 퀵 정렬을 수행하기 전에 우선적으로 삽입 정렬을 수행해보는 것입니다.
이 과정에서 특정 횟수 이상 삽입이 이루어지면,
그 순간 중단하고 다시 퀵 정렬을 수행합니다.
논문에서는 *특정 횟수*로 8을 사용했다고 합니다.

굉장히 간단한 아이디어이지만, 한편으로는
삽입 정렬을 수행하다 다시 퀵 정렬로 돌아가는 것이
추가적인 오버헤드가 되지 않을까 하는 의문이 들 수 있는데요.
저자는 swap이 일어나지 않는 경우는
이미 데이터가 대부분 정렬된 특수한 경우를 제외하면
거의 발생하지 않는 경우이기 때문에 오버헤드가 매우 작다고 주장합니다.

## 결론

본 글에서는 Golang과 Rust에서 표준 정렬 알고리즘으로
채택된 pdqsort에 대해서 살펴보면서,
현대 정렬 알고리즘에 적용된 다양한 최적화 기법에 대해서 알아보았습니다.

참고로 pdqsort에는 본문에서는 따로 언급하지 않았지만,
퀵 정렬에서 삽입 정렬 또는 힙 정렬로 전환하는 기준 등
기타 몇 가지 최적화 기법들이 더 포함되어 있습니다.

어떻게 보면 굉장히 사소하다고 할 수 있는 많은 부분에서
많은 최적화가 이루어지고 있음을 알 수 있는데요.
앞으로 어떤 기법들이 추가되고 언어와 알고리즘이 발전해 나가는지
꾸준히 살펴보는 것도 흥미로울 것 같 습니다.



{{% youtube "gjSfhGdgVc0" %}}

<div style="text-align: center;">
<div>
    <span style="color:grey"><small><i>pdqsort 시각화</i></small></span>
</div>
</div>