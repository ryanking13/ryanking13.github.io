---
date: "2021-01-20T09:00:01Z"
title: Self-Supervised Learning vs Semi-Supervised Learning
categories:
- Machine Learning
description: Self-Supervised Learning vs Semi-Supervised Learning
summary: Self-Supervised Learning, Semi-Supervised Learning, Self-Training 등 헷갈리는 용어를 정리하는 글입니다.
draft: true
---

최근 머신 러닝 관련 아티클을 보다보면 `Self-Supervised Learning`, `Semi-Supervised Learning`, `Self-Training`
등 언뜻 보기에 비슷한 용어가 많이 등장합니다.

대충 뉘앙스로 받아들이고 넘어갔다가 전혀 글을 잘못 이해하게 되는 경우가 있어서 이 글을 통해 정리해보려고 합니다.

## Supervised / Unsupervised Learning

먼저, 이 글을 보는 분들이라면 이미 알고 계시겠지만 `Supervised Learning(지도 학습)`과 `Unsupervised Learning(비지도 학습)`부터
정의하겠습니다.

- Supervised Learning: 레이블이 주어진 데이터를 사용해서 학습하는 것
- Unsupervised Learning: 레이블이 주어지지 않은 데이터를 사용해서 학습하는 것

## Self-Supervised Learning

`Self-Supervised Learning(자기지도 학습)`은 Unsupervised Learning의 한 종류로,
얀 르쿤(Yann LeCun) 교수님이 최근 굉장히 푸시(?)하고 있는 기법이기도 합니다.

Self-Supervised Learning은 이름처럼, 레이블이 없는 데이터가 주어졌을 때, 이 데이터에서 스스로(self) supervision을 만들어내는 학습 방법을 가리킵니다.

조금 풀어서 표현하면,

- 우리가 최종적으로 풀고 싶은 것 = downstream task = unlabeled 데이터만 주어진 downstream task(e.g. 이미지 분류) 대신,
label을 데이터로부터 만들어낼 수 있는 intermediate task(a.k.a self-supervised task, pretext task)를 정의하여, 


> Self-Supervised Learning에 대한 자세한 설명과 예시는 [여기](https://lilianweng.github.io/lil-log/2019/11/10/self-supervised-learning.html)를 참고하세요.

## Semi-Supervised Learning

`Semi-Supervised Learning(준지도 학습)`은 이름처럼 Supervised Learning과 Unsupervised Learning의 중간 형태로,
레이블이 주어진 데이터와 레이블이 주어지지 않은 데이터를 함께 사용해서 학습하는 것을 의미합니다.

우리가 풀고 싶은 대부분의 문제에서, 레이블이 있는 데이터는 적고, 레이블이 없는 데이터는 많습니다.

이때 레이블이 없는 데이터도 학습에 활용해볼 수 있지 않을까? 하는 아이디어가 Semi-Supervised Learning 입니다. 


## Self-Training

## 기타

- `Weakly-Supervised Learning`

Classification 레이블만 주어진 데이터를 사용하여 Semantic Segmentation 문제를 푸는 것처럼,
불충분한(weak) 레이블을 사용하여 정확한 레이블을 얻는 것을 목표로하는 학습 방법입니다.

- `Self-Supervised Training`

없는 용어입니다. 주로 Self-Supervised Learning의 오타입니다.

- `Self-Learning`

간혹 보이는 용어인데, 특별한 학습 방법을 지칭하지는 않습니다.

번역하면 자기주도적 학습인데, 뉴스 등에서 혼자서도 잘하는(?) 똑똑한 AI라는 의미의 마케팅 용어 정도로 사용되는 것 같습니다.

물론, Self-Training을 Self-Learning이라고 쓰면 잘못된 표현입니다.

간혹 Self-Supervised Learning와 같은 의미로 사용한 경우도 보았지만, 정확한 용법은 아닌 것으로 보입니다.


### References

> https://hoya012.github.io/blog/Self-Supervised-Learning-Overview/

> https://greeksharifa.github.io/self-supervised%20learning/2020/11/01/Self-Supervised-Learning/

> http://ailab.jbnu.ac.kr/seminar_board/pds1_files/sslicml07.pdf