---
date: "2022-06-31T00:01:00"
title: pqdsort - Pattern-defeating Quicksort
categories:
- Algorithm
description: pdqsort
summary: pqdsort
draft: true
---

최근 [Golang의 기본 정렬 알고리즘이 pdqsort로 변경된다는 소식](https://github.com/golang/go/issues/50154)이 전해졌습니다.

사실 정렬 알고리즘은 누구나 알고 있지만,
실제 언어 구현체에서 어떤 식으로 정렬 알고리즘을 최적화하고 있는지는
자세히 알지 못하는 경우가 많은데요.

이 글에서는 pqdsort를 소개하면서 현대 정렬 알고리즘의 최적화 기법에 대해서 소개하고자 합니다.

본 글은 다음의 자료를 참고하여 작성되었습니다.

> https://www.youtube.com/watch?v=jz-PBiWwNjc
> https://arxiv.org/abs/2106.05123

## 정렬 알고리즘의 계산 복잡도

정렬 알고리즘은 알고리즘과 계산 복잡도에 대해서 공부해본 사람이라면 누구나 처음으로 배우게 되는 주제입니다.

일반적으로 O(N^2)의 평균 계산 복잡도를 갖는 Bubble Sort와 Insertion Sort에서 시작해서,
O(NlogN)의 평균 계산 복잡도를 갖는 Heap Sort, Merge Sort, Quick Sort까지 배우게 됩니다.

조금 더 나아가서는, Quick Sort의 경우 Pivot을 잘 설정하지 못하는 경우 Worst Case 시간 복잡도가
O(N^2)이라는 점도 쉽게 알 수 있습니다.

## 정렬 알고리즘 최적화

여기까지가 일반적으로 정렬 알고리즘에 대해서 알고 있는 부분입니다.

비교 기반 정렬(Comparison Sort)의 경우 worst case 시간 복잡도의 lower bound가 O(NlogN)임이 증명되어 있으므로,
https://tildesites.bowdoin.edu/~ltoma/teaching/cs231/fall04/Lectures/sortLB.pdf

이론적으로 더 나은 시간 복잡도를 가지는 정렬 알고리즘은 존재하지 않습니다.

입력이 특수한 경우 radix sort 정도를 제외하면요.

그러므로 이후의 영역은 특수한 worst case를 최적화하기 위한 휴리스틱이 됩니다.

### Introsort

Introsort는 gcc에서 사용되는 기본 정렬 알고리즘이며, quicksort 를 베이스로 heap sort와 insertion sort가 더해진 형태입니다.

기본적으로 quicksort를 수행하되, quicksort의 worst case가 O(N^2)이 될 수 있음을 고려하여, 재귀 횟수가 일정 횟수를 넘어가면
worst case complexity를 O(NlogN)으로 보장하는 heapsort로 전환하는 방식을 사용합니다.
또한 N의 값이 충분히 작아졌을 때, 예를 들어 N의 값이 16 이하일 때는 상수가 큰 quicksort대신 insertion sort로 전환하여 최적화를 수행합니다.

### Quicksort pivot selection

### branchless prediction

### bounds check elimination

### Cache


