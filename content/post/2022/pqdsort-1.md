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

{{% admonition type="note" title="note" %}}

pdqsort는 unstable sort로, 동일한 원소에 대해서 정렬 후의 순서가 정렬 전과 동일함을 보장하지 않습니다.
stable sort 중에서 일반적으로 효율적이라고 알려진 정렬 알고리즘은 Python에서 표준 정렬 알고리즘으로 사용되는
[TimSort](https://en.wikipedia.org/wiki/Timsort)입니다.

{{% /admonition %}}

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

가장 먼저 소개할 것은 퀵 정렬의 파티셔닝(partitioning) 과정을 최적화하는 기법입니다.
이는 pdqsort에서 사용되었지만, 2016년에 발표된
[BlockQuicksort](https://arxiv.org/pdf/2106.05123.pdf) 논문에서 처음 소개된 기법입니다.

퀵 정렬의 partitioning의 한 가지 문제점은,
피벗을 기준으로 작은 값들과 큰 값들을 나누는 과정에서
많은 branch prediction이 발생한다는 점입니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/partition-normal.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=void%2520partition%28A%255B%255D%252C%2520pivot%252C%2520l%252C%2520r%29%2520%257B%2520%2520%250A%2520%2520while%28l%2520%253C%2520r%29%2520%257B%250A%2520%2520%2520%2520while%2520%28A%255Bl%255D%2520%253C%2520pivot%29%2520l%252B%252B%253B%250A%2520%2520%2520%2520while%2520%28A%255Br%255D%2520%253E%2520pivot%29%2520r--%253B%250A%2520%2520%2520%2520if%2520%28l%2520%253C%2520r%29%2520%257B%250A%2520%2520%2520%2520%2520%2520swap%28A%255Bl%255D%252C%2520A%255Br%255D%29%253B%250A%2520%2520%2520%2520%2520%2520l%252B%252B%253B%2520r--%253B%250A%2520%2520%2520%2520%257D%250A%2520%2520%257D%250A%257D -->
</div>

위 그림은 일반적인 퀵 정렬의 파티셔닝 과정을 보여주는데요.
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

위 그림은 블록 단위로 파티셔닝을 수행하는 과정을 보여주는데요.
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

### Quicksort Pivot selection

다음으로는 Quick Sort에서 피벗을 선택하는 방법에 적용된 기법을 살펴보겠습니다.
앞서 Quick Sort에서 피벗을 잘못 선택하여 partitioning이 제대로 이루어지지 않으면
worst case에 빠질 수 있다는 점을 얘기했었는데요.
반대로 얘기하면, 늘 좋은 피벗을 선택할 수 있다면, 예를 들어 피벗을 항상 중간값으로 선택할 수 있다면
worse case를 예방하는 것이 가능합니다.
문제는 당연하게도 정렬되지 않은 배열에서 중간값을 찾는 것이 상수 시간에 불가능하다는 점인데요.
따라서 우리는 간단하면서도 효과적으로 피벗을 선택하는 방법이 필요합니다.

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/quicksort-factor.png" />
<div>
    <span style="color:grey"><small><i>Quick Sort의 partition 비율에 따른 slowdown 효과</i></small></span>
    <br/>
    <span style="color:grey"><small><i>(출처: https://arxiv.org/pdf/2106.05123.pdf)</i></small></span>
</div>
</div>

여기서 아주 흥미로운 사실은, Quick Sort에서 피벗을 "적당히" 잘못 고르더라도
성능에 큰 영향을 미치지 않는다는 점입니다.
위의 그래프는 파티셔닝 비율에 따른 Quick Sort의 성능을 나타낸 것인데요.
흥미롭게도 정확하게 파티셔닝을 50:50으로 나눈 경우에 비해서 10:90으로
아주 치우진 파티셔닝을 "매번" 반복한 경우라도
약 2배 정도의 시간이 소요되는 것을 볼 수 있습니다.
즉, "적당히" 괜찮은 피벗만 고르더라도 Quick Sort는 충분히 좋은 성능을 낼 수 있다는 점을 의미합니다.

이러한 사실을 숙지한 상태에서, Quick Sort에서 피벗을 선택하는 방법을 살펴보겠습니다.
일반적으로 잘 알려진 피벗 선택 방법은
median-of-three인데요. 이는 피벗을 선택하기 위해 배열의 첫 원소, 중간 원소, 마지막 원소를
비교하여 중간값을 피벗으로 선택하는 방법입니다.
이 방법은 피벗을 선택하는 데 드는 오버헤드가 적고,
이미 정렬된 배열이나 역순으로 정렬된 배열처럼, 특정한 패턴을 갖고 있는 경우에도
적절한 피벗을 선택할 수 있다는 장점이 있습니다.

여기서 조금 더 나아간 방법은 tukey's ninther라고 알려진 방법인데요.
이는 median-of-three를 세 번 수행한 후, 그 결과를 다시 median-of-three로 선택하는 방법입니다.
이 방법은 피벗을 선택하는 데 드는 오버헤드가 조금 더 크지만,
median-of-three보다 더 좋은 피벗을 선택할 수 있다는 장점이 있습니다.

pdqsort에서는 이 두 방법을 혼합한 방법을 사용하는데요.
배열의 크기가 작은 경우는 median-of-three를 세번 수행하는 tukey's ninther의 오버헤드를 줄이기 위해,
단순히 median-of-three를 사용하고,
배열의 크기가 특정 크기 이상인 경우(논문에서는 128)에는 tukey's ninther를 사용합니다.

재귀적으로 호출되는 함수의 특성상 배열의 크기가 작은 경우 (leaf)가 많이 호출되기 때문에,
이러한 leave를 최적화하는 것이 아주 중요하다고 저자는 얘기합니다.

### Patterns

앞서 언급한 내용들은 사실 pdqsort의 독창적인 아이디어가 아닌, 기존의 최신 연구들의 기법을 적용한 것
그리고 이를 바탕으로 최적화를 한 것인데요.

이번 문단에서는 pdqsort (Pattern-Defeating) 의 이름에 맞는,
데이터의 패턴을 분석하고 이를 격파(?) 하는 pdqsort의 기법들을 소개하겠습니다.

#### Low cardinality

첫번째 기법이자 pdqsort의 유니크한 기법은 정렬 대상의 데이터가 low cardinality인 경우,
즉 데이터의 종류가 적은 경우를 분석하고 이를 최적화하는 것입니다.

이는 현실 세계에서 생각보다 많이 발생하는 경우인데요.
데이터 자체가 가진 정보는 다양하지만, 정렬의 기준이 되는 키는 적은 경우가 많습니다.
대표적으로는 SQL 에서 쿼리를 작성 할 때, order by 키워드를 사용하여 데이터를 정렬할 때,

```
SELECT * FROM cars ORDER BY maker;
SELECT * FROM songs ORDER BY duration;
SELECT * FROM users ORDER BY age;
```

이러한 경우는 정렬 대상이 되는 데이터 중 같은 값이 많이 발생하고 해당 케이스의 불필요한 비교 과정을
최소화 하는 것이 정렬 효율을 높일 수 있는데요.

pdqsort는 이를 다음과 같이 해결합니다.

1. Quick Sort의 Partition 과정에서 정해진 피벗을 현재의 subarray 바로 왼쪽(앞) 값과 비교합니다.
2. 만약 피벗이 왼쪽 값과 같다면, partition 과정에서 피벗과 같은 값을 피벗 왼쪽으로 보냅니다. (partition-left)
3. 피벗이 왼쪽 값보다 크다면, partition 과정에서 피벗과 같은 값을 피벗 오른쪽으로 보냅니다. (partition-right)

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/low-cardinality.png" />
<div>
    <span style="color:grey"><small><i>출처: https://www.youtube.com/watch?v=jz-PBiWwNjc</i></small></span>
</div>
</div>

굳이 경우를 나누는 연산을 추가해가면서까지 이런 과정을 하는 이유가 뭘까요?

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/low-cardinality-step.png" />
<div>
    <span style="color:grey"><small><i>출처: https://www.youtube.com/watch?v=jz-PBiWwNjc</i></small></span>
</div>
</div>

그림으로 과정을 뜯어보면 이해하기 쉬운데요. partition-left가 수행될 때를 보면,
피벗이 왼쪽 값과 같다면, 이미 피벗 왼쪽 subarray는
현재 정렬하고자 하는 subarray보다 작거나 같은 값들로만 이루어져 있음이 보장되므로,
partition 과정에서 피벗 왼쪽으로 간 데이터는 모두 피벗과 같은 값이라는 것을 알 수 있습니다.
즉, 이미 partition의 왼쪽은 정렬이 완료된 데이터임이 보장되므로, right recursion만 수행하면 되는 것입니다.

저자는 이와 같은 최적화를 한 경우에, 데이터의 cardinality가 k일 때, 시간 복잡도가 O(nk)임을 보였습니다.

#### Pre-sorted / mostly sorted

저자는 이미 대부분의 데이터가 정렬되어 있는 경우에 정렬을 수행하는 경우도 매우 흔하다고 말합니다.
특히 평소에 데이터를 정렬한 상태로 보관하고 있지만, 새로운 데이터가 동적으로 추가되는 경우에는
이미 정렬된 데이터에 새로운 데이터를 추가하고, 정렬을 수행하는 경우가 많습니다.

이러한 경우의 최적화에 대해서도 ...

이에 대한 휴리스틱으로 pdqsort에서는 llvm의 libc++에서 도입되었던 optimistic insertion sorting 이라는
아이디어를 사용하는데요. 저자의 말로는 llvm에서는 사용되고 있었지만, 공식적으로 문헌에 기록되어 있지는 않다고 합니다.

이 아이디어는 간단한데요. 이미 전부, 혹은 대부분이 정렬된 케이스를 탐지하기 위해서,
Quick Sort의 partition 과정에서 아무런 swap이 일어나지 않은 경우를 탐지하고,
이 경우 이미 대부분 정렬되어있을 가능성을 고려해, 우선적으로 insertion sort를 수행해보는 것입니다.
이 과정에서 insertion이 특정 횟수를 초과하면 그 순간 중단하고 quick sort를 수행합니다.
여기서 "특정 횟수"는 물론 하이퍼 파라미터인데요, 논문에서 저자는 8을 사용했다고 합니다.

swap이 일어나지 않을 때마다 insertion 을 수행하는 것이 overhead가 되지 않을까하는 의문이 들 수 있는데요.
저자는 실험적으로 swap이 일어나지 않는 경우는 앞서 언급한 이미 데이터가 대부분 정렬된 특수한 경우를 제외하면
거의 발생하지 않는 경우로 오버헤드가 작다고 주장합니다.

### 기타

그 외에 pqdsort에 적용된 몇 가지 최적화 기법을 간단히 언급하겠습니다.

- insertion sort 관련

Quick Sort의 정렬 대상이 충분히 작아졌을 때에 Insertion Sort로 전환해서 수행을 하는데,
이 "충분히 작은 값"을 어떻게 정하는 지를 생각해볼 수 있습니다.
pdqsort에서는 12 일때가 가장 적은 수의 "comparision"을 수행했다고 하는데요,
그러나 integer sort를 기준으로 24 또는 32가 더 좋은 수행 시간을 보였다고 합니다. 대신 비교 횟수는 증가.
따라서 element를 비교하는 행위가 얼마나 overhead가 큰지에 따라서 동적으로 적절한 값을 선택할 필요가 있으며,
실제로 libc의 구현체에서도 비교의 오버헤드가 작은 integer의 경우는 작은 값을, string과 같이 비교의 오버헤드가 큰 경우는 큰 값을 사용하고 있다고 합니다.

또한 insertion sort를 최적화하는 방법으로 pdqsort는 unguared_insertion_sort라는 방법을 사용하는데요.
이는, insertion sort에서의 bound check를 제거하는 방법으로, 현재 insertion sort를 수행하고자하는 chunk가
전체 배열의 leftmost chunk가 아니라면, leftmost chunk에는 현재 chunk보다 작은 원소들로만 구성되어있는 것이 보장되기 때문에
insertion을 수행할 때 bound check를 하지 않는 것.

insertion 에서 sift가 일어나는 부분을 일반적으로는 아래와 같이 작성하게 되는데,

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/insertion-bound-check.png" />
</div>

index를 줄여나가면서 bound를 넘어가지 않도록 체크하고 있는 한편

<div style="text-align: center;">
<image src="/assets/post_images/pdqsort/insertion-no-bound-check.png" />
<!-- https://carbon.now.sh/?bg=rgba%28255%2C255%2C255%2C1%29&t=seti&wt=none&l=text%2Fx-c%2B%2Bsrc&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=6px&ph=7px&ln=false&fl=1&fm=JetBrains+Mono&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=while%28comp%28*idx%252C%2520val%29%29%2520%257B%2520%250A%2520%2520sift%28idx%29%253B%250A%2520%2520idx--%253B%250A%257D -->
</div>

~ 이미 왼쪽에 더 작은 element가 있다는 것이 보장되어있으므로 bound check를 하지 않아도 된다.



{{% youtube "gjSfhGdgVc0" %}}

<div style="text-align: center;">
<div>
    <span style="color:grey"><small><i>pdqsort 시각화</i></small></span>
</div>
</div>