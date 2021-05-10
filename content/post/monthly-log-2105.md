---
date: "2021-04-30T01:01:00Z"
title: 월간 기술 스크랩 21/05
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 5월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 5월)
---

## ✍️ 글

### [Branch predictor: How many "if"s are too many? Including x86 and M1 benchmarks!](https://blog.cloudflare.com/branch-predictor/)

절대로 실행되지 않는 if 구문이 실제로 프로그램 실행 성능에 어떤 영향을 줄까라는 의문에서 시작해서,
CPU의 Branch Prediction 기능을 실험해보는 글.

여러 종류의 CPU에서 Conditional jmp, Unconditional jmp, Never-taken jmp 등이 어떻게 성능에 영향을 주는 지를 실험합니다.

CPU 마다 BTB(Branch Target Buffer)의 구현이 다르고, 컴파일러 영향도 무시할 수 없으니 어디에나 적용될 수 있는 솔루션은 없긴 하지만,
아래와 같은 몇가지 인사이트는 얻을 수 있었다는 것이 결론입니다.

- 프로그램의 hot code는 CPU의 BTB entries 크기를 벗어나지 않게끔해야 효율적
- 절대 실행되지 않는 if 구문을 추가하는 것은 *대부분* 비용을 추가하지 않음

클라우드플레어는 예전부터 블로그에 굉장히 흥미로운 주제의 글들을 많이 올리고 있으니,
관심이 있다면 시간 날 때마다 들러서 확인해봐도 좋을 듯 싶습니다.

## 📌 북마크
 

## 📰 기술 뉴스

## ⚙️ 소프트웨어 / 프로젝트

### [AI Dungeon](https://play.aidungeon.io/main/landing)

GPT-3을 이용하여 만들어진 텍스트 어드벤쳐 게임.

자기가 하고자 하는 행동이나 말을 텍스트로 입력하면 그에 맞춰서 자동으로 스토리가 생성됩니다.

하다보면 가끔 이상한 문장들이 튀어나오기는 하지만, 전체적으로는 굉장히 자연스러워서 자연어 처리 기술의 발전을 느낄 수 있는 게임입니다.

다만 최근에는 [유저들이 성적인 발언을 학습시킨다던가, 그것을 검열한다던가](https://www.techspot.com/news/89571-machine-learning-text-adventure-ai-dungeon-now-censored.html)하는 이슈로 곤혹을 치르고 있는 듯 하빈다.

### [Coding Escape](https://escape.codingame.com/)

코딩으로 하는 방탈출 게임.

여러명이서 함께 플레이할 수 있습니다.

굳이 방탈출 게임을 코딩으로 해야하나 싶긴 합니다만😂