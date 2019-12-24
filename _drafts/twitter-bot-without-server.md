---
layout: post
title: 개인 서버 없이 트위터 봇 만들기 with Github
description: Github 기능을 활용한 개인 서버 없이 트위터 봇 만들기
tags: [Python, Github]
---

__TL;DR__

Github의 Issue와 Actions를 활용하여, 주기적 알림 트위터 봇을 개인 서버 없이 구축해보기

## 도입

약 2년 전부터 [랜덤 가사 봇](https://twitter.com/dailylyricbot) 이라는 이름의 트위터 봇을 운영하고 있다. 이름처럼 [네이버 뮤직](http://music.naver.com/)에서 랜덤한 가사를 긁어와 포스팅하는 봇이다.

<div style="width: 100%; display: flex; justify-content: center;">
<blockquote class="twitter-tweet" data-lang="ko"><p lang="ko" dir="ltr">잠시 눈 돌리면 모두 놓치겠구나<br>지금 내가 어디 있는지조차<br>잠시 쉬어가면 한참 뒤처지겠구나<br>아무도 날 기다려주지 않으니<br><br>나상현 - 고속도로</p>&mdash; 랜덤 가사 봇 (@dailylyricbot) <a href="https://twitter.com/dailylyricbot/status/1201277326262190080?ref_src=twsrc%5Etfw">2019년 12월 1일</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

이 봇의 기능은 크게 두 가지로 아래와 같다.

- 정기적으로 가사를 긁어와서 트위터에 포스팅하기
- 이 때, 중복되는 곡은 제외하여기

필자가 학생일 때에는 학교에서 제공해주는 서버가 있어서, 서버에 코드를 올려놓고,

- 파이썬의 [apscheduler](https://apscheduler.readthedocs.io/en/latest/)를 이용하여 주기적으로 트윗을 날리고
- 트윗한 곡 정보는 파일에 저장

위와 같은 방식으로 원하는 기능을 구현했다.

그렇게 잘 봇을 운영하다가, 시간이 지나니 몇 가지 문제가 발생하였는데,

- 첫째로, 가끔씩 학교 서버가 재부팅되는데, 이때 봇을 일일이 다시 켜주어야 했고
- 둘째로, 졸업을 해버려서 학교 서버의 리소스를 축내는 것이 예의가 아니라고 생각했다.

그러나 겨우 이 정도의 서비스를 위해서 아예 원격 서버를 사는 것은 낭비라고 생각했고,
AWS lambda나 Azure Functions와 같은 서버리스 기능을 이용하여 ~ 방법도 있지만,

아예 신경을 꺼도 되도록 무료로 이러한 봇을 운영하는 방법이 없을까 고민하게되었따.

## 전개

그러다 생각난 것이 Travis CI, Circle CI, Github Actions와 같은 CI 서비스들이다.
CI 서비스들은 일반적으로 푸시, 커밋, 풀 리퀘스트와 같은 액션이 발생했을 때
코드에 대한 테스트를 돌리는 용도로 많이 사용되지만,
cron처럼 정기적으로 테스트를 돌리는 용도로도 사용할 수 있다.

- Travis CI의 경우는 일 단위의 정기 프로세스를 지원하고
- Circle CI와 Github Actions는 분 단위의 ~ 지원.

이 봇은 하루에 여러 번 포스팅을 해야하므로 Circle CI나 Github Actions를 사용해야 함

그럼 정기적으로 포스팅하는 문제는 해결,

다음은 중복곡 제거, 즉 저장, 정기적인 업데이트가 가능한 저장소

Issue를 쓰자.

그렇다면,

코드는 Github에 올려서 관리하고,
주기적인 봇 포스팅은 Github Actions로 수행,
봇이 지속적으로 업데이트하는 정보는 Github Issue를 활용하면,

Github을 이용하여 통합적인 봇의 관리가 가능해진다.

## 구현

## 결론

어뷰징?


---

### Reference

> https://blogs.dropbox.com/tech/2019/09/our-journey-to-type-checking-4-million-lines-of-python/amp/