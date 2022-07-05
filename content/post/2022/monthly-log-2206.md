---
date: "2022-06-31T00:01:00"
title: 월간 기술 스크랩 22/06
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 6월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 6월)
draft: true
---

## ✍️ 글

### [The Go Programming Language and Environment](https://m-cacm.acm.org/magazines/2022/5/260357-the-go-programming-language-and-environment/fulltext)

Golang의 개발자 그룹이 이야기하는 Golang의 개발 목표와 철학.

Go는 쓰다보면 참 불편하기도 하고 특이하다고도 느껴지는 문법과 특징을 가지고 있는데요.
이 글에서는 Go가 어떤 철학으로 개발되었고 왜 특별한(?) 결정들을 내렸는지를 설명합니다.

### [Ryan Dahl이 생각하는 자바스크립트 컨테이너 (번역)](https://medium.com/@yujso66/%EB%B2%88%EC%97%AD-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-edb81226dc6)

Node.js를 만들었고, 지금은 Rust 기반 JS 컴파일러인 Deno를 만들고 있는 Ryan Dahl이 생각하는 자바스크립트 컨테이너.

브라우저 자바 스크립트 엔진은 높은 수준의 가상화 환경을 제공합니다.
이를 이용해서 Cloudflare는 [Workers](https://workers.cloudflare.com/), Deno는 [Deno Deploy](https://deno.com/deploy)라는
V8 엔진 기반의 서버리스 플랫폼을 만들었습니다.

또한 최근에는 WebAssembly가 떠오르면서 브라우저에서 실행될 수 있는 애플리케이션의 영역이 확연히 넓어지고 있습니다.
이 때문에 브라우저의 자바스크립트 가상 환경이 Docker와 비슷하지만 한 단계 높은 추상화 레벨의 컨테이너가 될 수 있지 않을까라는 의견들을
가끔 볼 수 있고, Ryan Dahl은 이에 대해서 자바스크립트가 현재의 쉘 스크립트와 같은 자리를 차지하고, WebAssembly 모듈이 애플리케이션이 되는
미래를 그리고 있네요.

앞으로 자바스크립트와 WebAssembly가 어떻게 발전할지는 모르겠지만 흥미롭게 지켜볼 수 있는 주제인 듯 합니다.

### [커스텀 커맨드 앞에 comma 붙이기](https://rhodesmill.org/brandon/2009/commands-with-comma/)

여러 가지 이유로 간단한 CLI 명령어를 직접 작성하게 되는 경우가 많은데요.
당연히 짧은 이름이 사용하기 편하지만, 시스템 상의 내장 커맨드와 이름이 겹쳤다가는 불상사가 발생할 수 있습니다.

이 글에서는 이에 대한 대안으로 커맨드 앞에 쉼표(comma)를 붙이는 것을 제안하는데요.
다른 기호들, 예를 들어 `.` `/` 등은 특수한 의미를 가지고 있어서 사용하기 어렵고,
언더스코어 같은 경우는 `_` shift 를 눌러야해서 사용하기 번거로운 부분이 있어,
쉼표가 제일 좋다고 제안합니다.

## 📌 북마크

### [2022 Python Language Summit](https://pyfound.blogspot.com/2022/05/the-2022-python-language-summit_01678898482.html)

2022 PyCon US에서 진행된, 파이썬 코어 개발자들간의 language summit에서 진행된 발표 목록.

다소 로우레벨의 주제들이긴 합니다만, 파이썬이 어떤 방향으로 나아가고자하는 지에 대해서 알 수 있습니다.
아마도 일반 파이썬 유저가 가장 흥미있어할 부분은 GIL(Global Interpreter Lock)에 대한 부분인데요.

이번 summit에서는 Sam Gross가 제시한, GIL을 완전이 제거하는 nogil과,
Eric Snow가 제시한 여러 개의 인터프리터가 각각의 GIL을 가지게끔 하는 발표가 뜨거운 감자였던 것 같습니다.

사실 저는 기존에 이 두 가지 발표가 비슷한 주제라고 생각하고 있었는데, 완전히 다른 방식을 제시하는 것이라는 점을 알게되어서 조금 놀랐네요.

## 📰 기술 뉴스

### [Sunsetting Atom](https://github.blog/2022-06-08-sunsetting-atom/)

Github에서 2014년 출시했던 Atom 에디터의 지원을 종료하기로 결정했습니다.
Microsoft가 Github을 인수하면서부터 Visual Studio Code라는 직접적인 경쟁자가 회사 내에 존재했고,
또 한편으로는 Github이 Github Codespaces와 같은 클라우드 기반 에디터를 장기적으로 비전이 있다고 생각했기에
내린 결정이라고 여겨지네요.

해당 글을 소개한 [HN 스레드](https://news.ycombinator.com/item?id=31668426)에서는 Atom의 원 개발자가
자신이 신규로 개발하고 있는 [Zed](https://zed.dev/) 에디터를 소개합니다. 관심이 있으시다면 살펴보시는 것도 좋겠네요.

## ⚙️ 소프트웨어 / 프로젝트

### [NVIDIA Broadcast](https://www.nvidia.com/ko-kr/geforce/broadcasting/broadcast-app/)

NVIDIA가 만든 비디오와 오디오를 보정해주는 소프트웨어.
주요 사용자로 방송을 하는 스트리머를 대상으로 하는 것 같지만, 일반적인 화상 회의 등에도 사용할 수 있을 것으로 보입니다.

## 📙 책 / 강의 / 영상
