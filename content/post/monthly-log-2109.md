---
date: "2021-09-30T01:01:00Z"
title: 월간 기술 스크랩 21/09
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 9월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 9월)
draft: true
---

## ✍️ 글

### [리멤버의 온보딩 과정을 소개합니다.](https://blog.dramancompany.com/2021/08/%EB%A6%AC%EB%A9%A4%EB%B2%84%EC%9D%98-%EC%98%A8%EB%B3%B4%EB%94%A9-%EA%B3%BC%EC%A0%95%EC%9D%84-%EC%86%8C%EA%B0%9C%ED%95%A9%EB%8B%88%EB%8B%A4/)

명함 관리 서비스인 리멤버를 만드는 드라마앤컴퍼니의 개발자 온보딩 프로세스를 설명한 글.

재택 근무가 확대되면서 실제로 얼굴을 마주 보지 않는 상황에서 온보딩을 어떻게 할 것인가가
이슈가 되고 있는 거 같은데요.
어느 방법 하나가 정답이라고 할 수는 없겠지만 여러 기업에서 자신들의 방식을 소개해주는 것은
온보딩 프로세스를 준비하는 다른 기업들에게나, 또는 새로 입사하는 입사자들에게나 도움이 되는 부분인 것 같습니다.

### [드디어 Internet Explorer가 은퇴를 합니다](https://teamdable.github.io/techblog/IE-Retirement)

22년 6월부로 IE 데스크톱 앱 지원이 종료되고, Windows 11에서 더이상 IE 실행을 지원하지 않기로 하면서,
이제는 정말로 IE의 은퇴가 다가오는 것 같습니다.

우리나라에서는 아직도 수많은 관공서가 IE로 접속하지 않으면 뻑나는 문제가 많아서,
내년에도 Edge 브라우저의 IE 모드로 접속하는 그림이 그려지기는 하는데... 그래도 차근차근 바뀌어나가겠죠.

이 글에서는 프론트엔드 개발자가 IE 크로스브라우징 지원을 하지 않아도 된다면 어떤 것들이 바뀌는 지를 소개합니다.

## 📌 북마크

### [git bisect](https://thoughtbot.com/blog/git-bisect)

이분 탐색을 이용하여 git 프로젝트에서 문제가 발생한 부분을 찾는 네이티브 도구 git bisect를 소개합니다.

## 📰 기술 뉴스

## ⚙️ 소프트웨어 / 프로젝트

## 📙 책 / 강의 / 영상

### [A cartoon intro to WebAssembly](https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/)

일러스트와 함께 살펴보는 WebAssembly 개념 강의

다소 오래된(2017년) 내용이지만, WebAssembly에 대한 기초 개념을 잡기에 좋은 강의입니다.

### [Python's Infamous GIL](https://m.youtube.com/watch?v=KVKufdTphKs)

PyCon 2015에서 파이썬 코어 개발자인 Larry Hastings이 파이썬의 악명높은(?) 글로벌 인터프리터 락(GIL)에 대해 설명하는 동영상.

GIL이 어떻게 등장했고, 스레딩과 멀티코어 기술의 발전으로 어떤 변화를 겪었으며, 현재에 이르러서는 어떤 문제가 발생하고 있는지 설명합니다.

인상적인 내용은, Larry가 생각하기에 외부에서 GIL에 대한 다양한 비판적인 의견들이 많지만,
지금까지의 파이썬이 이렇게 빠르게 발전하고 널리 쓰이는 데는 GIL의 공이 컸다고 말하는 부분이네요.
