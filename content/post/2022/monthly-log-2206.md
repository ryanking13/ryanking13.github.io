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

## 📌 북마크

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
