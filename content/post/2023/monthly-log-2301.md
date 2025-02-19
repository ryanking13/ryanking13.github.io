---
date: "2023-01-31T00:01:00"
title: 월간 기술 스크랩 23/01
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2023년 1월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2023년 1월)
draft: true
hiddenfromhomepage: true
---

## ✍️ 글

### [Stable Diffusion 2.0과 네거티브 프롬프트의 중요성](https://news.hada.io/topic?id=7931)

얼마 전 Stable Diffusion 2.0이 공개되었는데,
텍스트 인코더를 OpenCLIP으로 바꾸면서 네거티브 프롬프트를 잘 입력해주는 것이
생성 결과물 품질에 크게 영향을 미치게 되었다는 글.

### [The Inside Story On Shared Libraries and Dynamic Loading (2001)](https://www.scribd.com/document/68234210/The-Inside-Story-on-Shared-Libraries-and-Dynamic-Loading#)

리눅스 공유 라이브러리와 동적 로딩에 대해 전반적으로 설명하는 글.

2001년에 나온 오래된 글인데, 교과서와 블로그 아티클의 중간 정도되는 수준의 내용으로
공유 라이브러리에 관한 전반적인 내용을 요약한 좋은 글입니다.

### [The GPT-3 Architecture, on a Napkin](https://dugas.ch/artificial_curiosity/GPT_architecture.html)

GPT-3의 구조... 라기 보다는 트랜스포머 아키텍처를 설명하는 글.

이런 글을 읽다보면 참 트랜스포머가 간결하고 좋은 아키텍쳐라는 것이 느껴집니다.
물론 악마는 디테일에 있는 법이고, 실제 학습이 잘 되게 하기 위한 여러가지 트릭들이 거대 모델에서는
중요해지겠지만요.

## 📌 북마크

### [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts)

ChatGPT를 유용하게 사용하기 위한 여러가지 프롬프트 작성 방법들.
주로 "~ 처럼 행동하라 (Act as)"라는 프롬프트를 주고서 하는 방법들을 설명하고 있습니다.

<!-- ## 📰 기술 뉴스 -->

## ⚙️ 소프트웨어 / 프로젝트

### [Ruff](https://github.com/charliermarsh/ruff)

Rust로 구현된 파이썬 린터.

속도가 가장 큰 장점이고, 기존 파이썬 생태계에 있는 다양한 도구들 (flake8, isort, pyupgrade) 등을
하나의 도구로 통합해서 사용할 수 있다는 것도 큰 장점입니다.

## 📙 책 / 강의 / 영상

### [좋은 기술 문서를 작성하기 위한 10계명](https://www.youtube.com/watch?app=desktop&v=9WobKoE9OPI&feature=youtu.be)

PyconUS 2022 발표 영상. 좋은 기술 문서를 작성하기 위한 10계명을 다음과 같이 이야기합니다.

1. 첫 문단에 글의 목표를 명확하게 적기
2. 간결한 문장을 사용하기
3. 포용적인 단어를 사용하고, 청자의 수준을 평가하는 단어를 사용하지 않기 (간단한, 쉬운, 멍청이들을 위한 등의 단어 사용 지양하기)
4. 전문가들만 이해할 수 있는 단어 사용 지양하기
5. 약어를 사용한다면 정확하게 설명하기
6. 밈이나 특정 언어 사용자만 이해할 수 있는 단어 사용 지양하기
7. 코드 예제를 넣을 때는 유의미하고 실질적인 예제를 넣기
8. 글을 읽다가 독자를 떠나게 만드는 외부 링크 지양하기, 넣어야 한다면 글의 처음이나 맨 끝에 넣기
9. 글의 단계를 구분하고, 일관성있게 작성하기
10. 예제가 제대로 동작하는지 반드시 테스트하기

사실 뻔한 내용들이지만 놓치기 쉬운 부분이기도 해서, 글을 쓰기 전 후에 한번씩 점검해보기만 해도 도움이 될 듯 합니다.
