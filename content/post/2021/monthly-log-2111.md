---
date: "2021-11-30T00:01:00"
title: 월간 기술 스크랩 21/11
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 11월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 11월)
draft: false
---

## ✍️ 글

<!-- ## 📌 북마크 -->

## 📰 기술 뉴스

### [Thank you, Github](https://news.ycombinator.com/item?id=29095747)

Microsoft가 Github을 인수하고서부터 3년간 Github의 CEO로 일해왔던 Nat Friedman이 CEO직에서 사임했습니다.

Github이 인수되고서부터 엄청난 변화들이 있었는데요.
Actions, Codespaces, Copilot, Sponsors 같은 굵직한 변화들만 헤아려봐도 상당한 숫자입니다.
그 모든 것을 꽤나 잘하고 있다는 것도 특징이구요.
새로운 CEO는 어떤 방식으로 Github을 이끌어나갈지도 기대되는 부분입니다.

또 Github의 기능적인 발전과는 별개로, [Hacker News](https://news.ycombinator.com/item?id=29095747)를 보면
많은 사람들이 Nat이 Github에 미친 긍정적인 영향들을 얘기하고 있는데요.
대표적으로는 [이란 개발자들이 Github을 사용할 수 있도록 노력한 부분](https://github.blog/2021-01-05-advancing-developer-freedom-github-is-fully-available-in-iran/)이나,
[youtube-dl의 저작권 사태](https://mobile.twitter.com/natfriedman/status/1328365679473426432)와 같은 부분을 잘 해결한 것을
긍정적으로 평가하고 있는 것을 확인할 수 있습니다.

### [Python GIL Removal](https://lukasz.langa.pl/5d044f91-49c1-4170-aed1-62b6763e6ad0/)

얼마 전 파이썬 코어 개발자들이 모이는 Python Language Summit에서
파이썬의 GIL(Global Interpreter Lock)을 제거하는 것에 대한 발전된 논의가 있었습니다.

파이썬에서 GIL을 제거하는 것은 기존에도 수없이 논의되었던 논제이지만,
대부분 큰 성능 저하 없이는 불가능해서 아이디어에 그쳤다고 알려져 있는데요.
최근 페이스북의 개발자인 Sam Gross가 [nogil](https://github.com/colesbury/nogil)이라는
이름의 GIL을 제거한 파이썬 구현체를 공개했고,
이를 바탕으로 한 GIL 제거 논의가 긍정적으로 검토되었다고 합니다.

파이썬에서 GIL이 필요한 주된 이유는 파이썬이
레퍼런스 카운팅 방식의 가비지 컬렉션 기법을 사용하고 있고,
이 때문에 서로 다른 스레드에서 같은 오브젝트를 동시에 사용할 때
레퍼런스 카운트에 문제가 생기는 것을 방지하기 위함인데요.

Sam Gross의 구현체에서는 서로 다른 스레드가 각각의 인터프리터를 가지는 식으로 이를 해결했다고 합니다.
사실 상세한 내용은 이해하지 못했는데, 나중에 공식적인 PEP가 나오면 제대로 살펴보려고 합니다.

이와 관련해서 [CPython 커미터인 나동희 개발자님 인터뷰](https://www.youtube.com/watch?app=desktop&v=V18ceQO_JkM&feature=youtu.be)를
살펴보시면 이해에 도움이 될 듯 합니다.


## ⚙️ 소프트웨어 / 프로젝트

## 📙 책 / 강의 / 영상

### [파이썬 오픈소스 커미터가 되는 방법](https://m.youtube.com/watch?v=1goockl3wPs&feature=youtu.be)

CPython 커미터이자 현재 LINE에서 일하고 계신 나동희 개발자님 인터뷰.

얼마 전 파이썬 릴리즈 뉴스를 보다가 한국인 이름이 있어서 신기하게 봤던 기억이 있었는데,
한국에서 유이하게 존재하는 파이썬 커미터라고 합니다. (다른 한 분은 서울대 장혜식 교수님)
장혜식 교수님은 2000년도 초반에 활동을 하신 것 같으니 현재는 유일하다고 할 수 있겠네요.

