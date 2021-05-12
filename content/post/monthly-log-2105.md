---
date: "2021-05-31T01:01:00Z"
title: 월간 기술 스크랩 21/05
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 5월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 5월)
draft: true
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

### [My current HTML boilerplate](https://www.matuzo.at/blog/html-boilerplate/)

13년차 웹 개발자가 웹 프로젝트를 할 때 자신이 사용하는 HTML 보일러플레이트 코드를 소개한 글입니다.

HTML의 head에 들어가는 다양한 태그들의 역할을 소개하고 있어, 저같이 필요할 때마다 야매로 웹 개발을 하는 사람들이 참고하기 좋은 듯 합니다.
이 글을 소개한 [해커뉴스 스레드](https://news.ycombinator.com/item?id=26952557)에도 사람들이 다양한 팁을 소개하고 있습니다.

추가로, [htmlhead.dev](https://htmlhead.dev/)에서 이 글에서 소개하는 것 외에도 다양한 태그를 소개하고 있습니다.

## 📌 북마크
 
## 📰 기술 뉴스

### [NDTI로 알아보는 나의 맞춤 채용 제안](https://d2.naver.com/news/7591059)

기술 뉴스...는 아닌 것 같지만,
네이버에 이력서를 등록해 놓으면 맞춤 채용 공고를 보내주는 서비스.

최근 개발자에 대한 대우가 점점 높아지면서, 대기업들도 인재 채용에 열일인 모양입니다.

네이버에서는 월간 영입도 그렇고, 최근 직원들에게 주식을 나눠주는 것도 그렇고, 다양한 방식으로 인재를 모집하고 지키려는 모양새인데, 개발자로서 이런 풍토가 지속되었으면 하는 바람입니다😂

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

## 📙 책 / 강의

### [A Philosophy of Software Design](https://www.amazon.com/Philosophy-Software-Design-John-Ousterhout/dp/1732102201)

티클(Tcl) 언어를 개발한 것으로 알려져있는 John Ousterhout 스탠포드 교수가 쓴
소프트웨어 디자인 방법에 대한 책.

이 책의 핵심 키워드는 **복잡성(Complexity)** 으로,
다양한 선택들이 소프트웨어의 복잡성을 더하는 요소가 될 수 있으며,
이를 지양해야 한다고 말합니다.

책의 대부분은 공감가고 쉽게 이해할 수 있는 내용이지만,
몇 가지 생각해 볼만한 아이디어들이 있어서 소개합니다.

- 외부에 노출되는 것은 작은 모듈 여러개보다는 큰 모듈 하나가 낫다

처음 개발을 배울 때에,
한 모듈이나 함수가 크고 길어지면 잘못되었고
큰 함수를 여러 개로 나누는 것이 좋다는 얘기를 하는 경우가 많습니다.

그러나 이 책에서는 유저에게 자잘한 작고 많은 모듈을 노출시키는 것은 복잡성을 더하는 요소라고 말합니다.

대표적으로 소개하는 것이 Java의 I/O인데,

```java
InputStream inputStream = System.in;
Reader reader = new InputStreamReader(inputStream); 
BufferedReader bufferedReader = new BufferedReader(reader);
```

기초적인 I/O 클래스와 버퍼링을 지원해주는 I/O 클래스를 구분함으로써,
대부분의 경우 이 둘을 같이 사용해야 함에도 불구하고 복잡성을 늘린 케이스라고 지적합니다.

- 테스트는 중요하지만 테스트 주도 개발(TDD)은 좋아하지 않는다

테스트 주도 개발은 테스트의 단위가 되는 개별적인 기능을 개발하는 것에 집중하게 하고,
전체 소프트웨어의 최적의 디자인을 찾는 것은 뒷전으로 만들기 때문에 좋아하지 않는다고 말합니다.
