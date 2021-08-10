---
date: "2021-08-30T01:01:00Z"
title: 월간 기술 스크랩 21/08
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 8월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 8월)
draft: true
---

## ✍️ 글

### [페이스북은 이제 메타버스 기업](https://c-rocket.net/facebook_mark_zuckerberg_metaverse_the_verge/)

The Verge에서 마크 주커버그 페이스북 CEO와 진행한 인터뷰의 한국어 번역본.

페이스북에서 VR/AR 관련 사업을 하는 직원의 수가 30% 가까이 된다는 글을 얼핏 본적이 있는데,
페이스북이 무엇보다 메타버스와 VR 사업에 진심임을 알 수 있는 주커버그의 인터뷰입니다.

2010년대가 스마트폰의 시대였다면, 2020년대, 혹은 2030년대는 VR의 시대가 될까요?

### [70만번 다운로드 된 NPM 패키지: `-`](https://www.bleepingcomputer.com/news/software/empty-npm-package-has-over-700-000-downloads-heres-why/)

NPM에서 `-`라는 이름의 내용 없는 패키지가 70만번이나 다운로드 되었는데,
그 원인을 살펴보는 아티클.

원인은 단순히 사람들이 패키지를 설치하는 과정에서
플래그를 지정하다가 실수로 띄어쓰기를 삽입해서 (`-P` --> `- P`) 발생했을 것이라고 하는데요.
해당 패키지의 개발자는 NPM의 패키지 명명 규칙을 확인하는 차원에서 `-` 패키지를 업로드했었다고 합니다.

누구나 자유롭게 패키지 업로드가 가능한 NPM이나 PyPI에서 악성코드가 발견되는 경우가 심심찮게 발생하고 있는 상황에서,
사람들의 실수로 발생할 수 있는 이번 경우와 같은 케이스를 예방하는 기능이 필요하지 않을까 싶기도 하네요.

## 📌 북마크

## 📰 기술 뉴스

### [스택 오버플로우 2021년 개발자 설문조사](https://stackoverflow.blog/2021/08/02/2021-stack-overflow-developer-survey-results/)

매년 진행하는 스택 오버플로우 개발자 설문조사.

코로나의 여파로 온라인을 이용하여 개발을 배우는 사람이 많이 늘어난듯한 모습이네요.

한가지 흥미로운 건 웹 프레임워크에서 Svelte와 FastAPI의 인기가 굉장히 높았다는 점인데요.
실제 업무에 많이 사용되는지와는 별개로 "힙"한 프레임워크를 사람들이 많이 좋아하는 현상이라고 볼 수 있지 않을까 싶습니다.

## ⚙️ 소프트웨어 / 프로젝트

### [Brython](https://github.com/brython-dev/brython)

Browser Python. 파이썬을 브라우저 환경에서 실행시키는 프로젝트.

비슷한 프로젝트로 이전에 [pyodide](https://github.com/pyodide/pyodide)를 소개 한 적이 있는데요.
두 프로젝트의 목표는 비슷하지만 방식은 다릅니다.

pyodide는 CPython 인터프리터를 Wasm으로 컴파일해서 파이썬 코드를 실행하는 방식이라면,
brython은 파이썬 코드를 js로 트랜스컴파일하는 방식을 사용합니다.

스타 수로 봤을 때 두 프로젝트의 인기도는 비슷한데,
확장성 측면에서는 pyodide의 손을 들어주고 싶네요.

### [StackOverflow Importer](https://github.com/drathier/stack-overflow-import)

파이썬 import 시스템을 오버라이딩하여, 스택 오버플로우에서 코드를 검색해서 임포트 해주는 파이썬 라이브러리.
당연히 실사용 용도는 아니고, 재미로 만든 프로젝트.

import 시스템을 이런 식으로 변형할 수 있다는 점도 흥미롭고, 아이디어가 참 재밌습니다.


## 📙 책 / 강의 / 영상
