---
date: "2023-01-31T00:01:00"
title: 월간 기술 스크랩 23/02
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2023년 2월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2023년 2월)
draft: false
hiddenfromhomepage: true
---

## ✍️ 글

### [Cyberpunk 2077에 나온 실시간 번역 구현해보기](https://news.hada.io/topic?id=8125)

사이버펑크 2077 게임에서 나오는 실시간 번역 효과를 현 시점의 다양한 머신 러닝 도구들을 사용해
쉽게 구현할 수 있을까? 라는 주제로 작성된 글입니다.

직접 모델을 학습하는 것 없이 다양한 도구들을 사용해서 영상 다운로드, 음성 분리
음성 인식과 번역, 얼굴 탐지까지 모든 것을 구현하는데요.
이제는 머신 러닝이 도구화되었다라는 것을 느낄 수 있는 글이었습니다.

### [mtime comparison considered harmful](https://apenwarr.ca/log/20181113)

대표적인 빌드 도구인 Make는 파일의 수정 시간(modification time, mtime)을
기준으로 파일이 최신 상태인지를 판단하는데요. 이 글에서는 mtime이 다양한 상황에서
잘못된 기준이 될 수 있다는 것을 설명합니다.

### [Introducing the WebAssembly JavaScript Promise Integration API](https://v8.dev/blog/jspi)

많은 네이티브 애플리케이션이 동기적으로 작동하는 반면,
브라우저 생태계는 모두 비동기적으로 동작합니다.

이 때문에 네이티브 애플리케이션을 웹어셈블리를 통해 브라우저 환경에 포팅하더라도,
브라우저의 웹 API를 사용하는데에 제약이 있었는데요. 크로미움 V8 엔진에서 실험적으로
도입되고 있는 JSPI(WebAssembly JavaScript Promise Integration API)는 자바스크립트 Promise가
resolve되기 전까지 동작을 중단시킴으로서 이러한 제약을 해결하는 방법을 제안합니다.


<!-- ## 📌 북마크 -->

<!-- ## 📰 기술 뉴스 -->

## ⚙️ 소프트웨어 / 프로젝트

### [carbonyl](https://github.com/fathyb/carbonyl)

터미널에서 동작하는 크로미움 브라우저.

<!-- ## 📙 책 / 강의 / 영상 -->
