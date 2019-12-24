---
layout: post
title: 개인 서버 없이 트위터 봇 만들기 with Github
description: Github 기능을 활용한 개인 서버 없이 트위터 봇 만들기
tags: [Python, Github]
---

__TL;DR__

Github의 Issue와 Actions를 활용하여, 개인 서버에서 실행시키던 트위터 봇을
~.

## 도입

필자는 약 2년 전부터 [랜덤 가사 봇](https://twitter.com/dailylyricbot) 이라는 이름의 트위터 봇을 운영하고 있다. 이름처럼 [네이버 뮤직](http://music.naver.com/)에서 랜덤한 가사를 긁어와 포스팅하는 봇이다.

tweet embedded

필자가 학생일 때에는 학교에서 제공해주는 서버가 있어서, 해당 서버에 코드를 올려놓고,
파이썬의 [apscheduler]()를 이용하여 주기적으로 트윗을 날리게끔 ~.

그러다 졸업 ~. 졸업생 신분으로 학교 서버의 리소스를 축내는 것은 예의가 아니라는 생각을 했고,
한편으로는 겨우 이정도의 서비스를 위하여 원격 서버를 구축하는 것은 낭비.

AWS lambda나 Azure Functions와 같은 서버리스 기능을 이용하여 ~ 방법도 있지만,
아예 무료로 이를 구축 ~.



---

### Reference

> https://blogs.dropbox.com/tech/2019/09/our-journey-to-type-checking-4-million-lines-of-python/amp/