---
date: "2022-03-31T00:01:00"
title: 월간 기술 스크랩 22/03
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 3월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 3월)
draft: true
hiddenfromhomepage: true
---

## ✍️ 글

### [2021년 CTO 회고](https://jojoldu.tistory.com/626)

우아한형제들에서 시니어 개발자로 근무하던 분이
작은 스타트업(인프런)의 CTO로 이직하여 일 년 간 근무하면서 겪은 일을 작성한 회고록.

이미 어느 정도 체계가 갖추어진 팀에 높은 권한을 가진 입장으로 새롭게 들어가게 되었을 때
어떻게 접근하면 좋은 지를 배울 수 있는 좋은 글입니다.
자신의 지식과 경험을 무작정 탑다운으로 주입하기보다는,
기존의 문제점을 파악하고 천천히 또 신중하게 어떻게 접근해나갔는지를 알 수 있습니다.

### [Semantic Versioning은 당신을 구하지 못한다](https://hynek.me/articles/semver-will-not-save-you/)

작년 파이썬 암호화 라이브러리인 Cryptography가
C로 작성되어 있던 일부 코드를 Rust로 바꾸었습니다.

이 변화는 두 가지 측면에서 논란이 되었는데,
첫째는 Rust 컴파일러가 gcc보다 지원하는 플랫폼이 적어서
특정 플랫폼에서 문제가 될 수 있다는 점,
그리고 둘째는 이 정도의 큰 변화를 메이저 릴리즈가 아닌
마이너 릴리즈 (3.4 -> 3.5)에서 반영했다는 점입니다.

이 글은 글쓴이가 이 중 두번째 논란에 대한 자신의 의견을 밝힌 글인데요.
흔히 Semantic Versioning을 적용할 때에 "Breaking Change는 메이저 릴리즈에서만"
이라는 것이 규칙으로 되어있지만,
아무리 작은 변경사항이라도 누군가에게는 Breaking Change일 수 있고,
그렇기에 Semantic Versioning을 무작정 신뢰해서는 안된다는 점을 이야기합니다.
반대로 메인테이너 입장에서도 굳이 Semantic Versioning을 엄격하게 고수하는 것이
큰 의미가 없을 수 있다는 점을 이야기합니다.

### [Server-Sent Events: the alternative to WebSockets you should be using](https://germano.dev/sse-websockets/)

채팅 서버와 같이 서버와 클라이언트간 실시간 통신 기능이 필요할 때
가장 먼저 떠오르는 것이 웹소켓 기술인데요.
이 글에서는 웹소켓 대신 서버에서 메세지를 필요에 따라 스트리밍할 수 있는
Server-Sent Events (SSE)가 대안이 될 수 있다고 소개합니다.

웹소켓와 달리 SSE는 HTML 위에서 동작하기 때문에 압축, HTML/2 등
HTML의 고급 기능들을 고스란히 이용할 수 있다는 것이 장점인데요.
두 기술을 비교해보고 필요에 따라 선택하면 될 듯 싶습니다.

## 📌 북마크

### [How To Fit a Bigger Model and Train It Faster](https://mobile.twitter.com/lvwerra/status/1492199297525370887)

Transformer 구현체로 유명한 HuggingFace에서 공개한 거대 모델을 학습하기 위한 팁.

GPU 메모리 크기가 한정적일 때 다양한 방법을 통해서 메모리 사용량을 줄여서 학습을 하는 방법을 알려줍니다.

## 📰 기술 뉴스

### [Github Actions 부분 재시작 지원](https://github.blog/2022-03-16-save-time-partial-re-runs-github-actions/)

Github Actions에서 특정한 job만 재시작할 수 있게 해주는 기능을 지원하기 시작했습니다. (원래는 작년 4분기 예정이었는데, 조금 늦어졌네요.)

CI가 확률적으로 실패하는 경우가 잦고, CI 작업이 오래걸리는 경우 이러한 기능이 필수적이다보니,
다른 CI 서비스에서는 대부분 지원하는 기능이었는데요. Github Actions에서도 드디어 지원하기 시작했습니다.

## ⚙️ 소프트웨어 / 프로젝트

### [SingleFile](https://github.com/gildas-lormeau/SingleFile)

웹 브라우저에서 웹 페이지를 HTML로 저장하게 되면 HTML과 에셋(이미지, CSS, ...)이
따로 저장되는데, 이를 하나로 묶어 저장해주는 브라우저 확장 프로그램.

가끔 아카이빙 목적으로 HTML 페이지를 저장해야 하는 경우가 있는데,
그런 경우에 사용하면 유용할 듯 합니다.

## 📙 책 / 강의 / 영상

### [Git Internals](https://www.leshenko.net/p/ugit/#)

파이썬으로 미니멀한 Git 구현체를 만들어보면서 배우는 Git 내부 구조.
Git을 이미 사용하고 있는 사람을 대상으로, 그간 사용해오던 Git 명령어들이
어떻게 구현되어 있는 지를 알 수 있습니다.

생각보다 내용이 굉장히 많아서,
한 스텝씩 따라가려면 꽤나 시간이 오래걸리는데요.
Git 모델을 이해하는 데에 크게 도움이 되는 자료입니다.



