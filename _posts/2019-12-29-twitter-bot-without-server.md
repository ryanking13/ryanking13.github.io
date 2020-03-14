---
layout: post
title: Github Actions를 이용하여 서버 없이 알림 봇 만들기
description: Github Actions를 이용하여 서버 없이 알림 봇 만들기
tags: [Python, Cloud]
---

__TL;DR__

Github의 Issue와 Actions를 활용하여, 주기적 알림 트위터 봇을 개인 서버 없이 구축해보기

## 도입

약 2년 전부터 [랜덤 가사 봇](https://twitter.com/dailylyricbot) 이라는 이름의 트위터 봇을 운영하고 있다. 이름처럼 [네이버 뮤직](http://music.naver.com/)에서 랜덤한 가사를 긁어와 포스팅하는 봇이다.

<div style="width: 100%; display: flex; justify-content: center;">
<blockquote class="twitter-tweet" data-lang="ko"><p lang="ko" dir="ltr">잠시 눈 돌리면 모두 놓치겠구나<br>지금 내가 어디 있는지조차<br>잠시 쉬어가면 한참 뒤처지겠구나<br>아무도 날 기다려주지 않으니<br><br>나상현 - 고속도로</p>&mdash; 랜덤 가사 봇 (@dailylyricbot) <a href="https://twitter.com/dailylyricbot/status/1201277326262190080?ref_src=twsrc%5Etfw">2019년 12월 1일</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

이 봇의 기능은 크게 두 가지다.

- 정기적으로 네이버 뮤직에서 가사를 긁어와서 트위터에 포스팅하기
- 이 때, 중복되는 곡은 제외하기

필자가 학생일 때에는 학교에서 제공해주는 서버가 있어서, 서버에 코드를 올려놓고

- 파이썬의 [apscheduler](https://apscheduler.readthedocs.io/en/latest/)를 이용하여 정해진 시간에 트윗을 올리기
- 트윗한 곡 정보는 파일에 저장하여 중복 처리

위와 같은 방식으로 봇의 기능을 구현했다.

그렇게 봇을 1년 넘게 운영하다보니, 몇 가지 문제가 발생하였다.

- 첫째로, 종종 학교 서버가 재부팅되는데, 이때 죽은 봇을 수동으로 다시 켜주어야 했다
- 둘째로, 졸업을 한 뒤 학교 서버의 리소스를 계속 축내는(?) 것이 예의가 아니라고 생각했다

위와 같은 이유로, 학교 서버에서 지속적으로 봇을 운영하는 것이 어려워졌다.

## 🤖 봇을 어디에 올려야 할까?

그렇다면 학교 서버를 대신하여 봇을 운영할 곳을 찾아야 한다.
우선적으로 고려해본 선택지는 다음과 같다.

__1. 클라우드 서비스에서 가상 서버 인스턴스 구매__

AWS, Azure와 같은 클라우드 서비스에서 가상 서버를 구매하는 방식.

그러나 하루에 겨우 2-3회 트윗을 올리는 서비스를 위해서 VM 인스턴스를 구매하는 것은 과도한 낭비라고 생각되므로 __기각__.

__2. 집에 개인 서버를 구축__

집에 남는 노트북을 활용하여 24시간 돌아가는 개인 서버를 구축하는 방식.

당장 트위터 봇을 돌리기 위해서 서버를 구축하는 것은 배보다 배꼽이 큰 격이므로 __기각__.

__3. 서버리스 활용__

[AWS lambda](https://aws.amazon.com/ko/lambda/)나 [Azure Functions](https://azure.microsoft.com/ko-kr/services/functions/)와 같은 서버리스 기능을 이용하는 방법.

서버리스 환경에 트윗을 포스팅하는 코드를 올리고, 정기적으로 코드가 실행되도록 한다.

그리고 중복되는 곡을 처리하기 위해서는 곡 리스트를 저장하여야 하므로,
[Amazon S3](https://aws.amazon.com/ko/s3/)와 같은 스토리지 서비스를 연계하여 곡 리스트를 저장하고 업데이트하면 된다.

...현실적으로 괜찮은 방법이기는 한데, 어느정도의 마이그레이션 과정이 필요하고,
소량이기는 하지만 지속적으로 비용이 발생한다.

## 💡 CI 서비스를 활용해보자

그러다가 생각난 것이 Travis CI, Circle CI, Github Actions와 같은 CI(continuous integration) 서비스들이다.

CI 서비스는 일반적으로 푸시, PR와 같은 액션이 발생했을 때 정해진 동작을 수행하게끔 사용되지만,
특정 액션이 발생했을 때가 아니라 주기적으로도(Cron Jobs) 코드가 실행되도록 할 수 있다.

- [Travis CI](https://docs.travis-ci.com/user/cron-jobs/)는 일 단위의 Cron Job을 지원하고
- [Circle CI](https://circleci.com/docs/2.0/workflows/#nightly-example)와 [Github Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#onschedule)는 일반 리눅스 cron과 유사한 문법으로 분 단위의 Cron Job을 지원한다.

이 봇은 하루에 여러 번 포스팅을 해야하므로 Circle CI나 Github Actions를 사용하면 된다.
Circle CI의 Cron Job 기능은 이 글을 작성하는 시점 기준으로 Nightly 기능이므로, Github Actions를 활용하도록 하자.

그럼 이것으로 정기적으로 코드를 실행하는 문제는 해결되었다.

## 📝 곡 저장은 어떻게?

그러나 CI 서비스만으로는 곡 리스트를 저장하는 문제를 해결할 수 없다.

이 봇 운영을 위해서는 곡 ID 리스트를 저장할 수 있는 기능이 필요한데,
 업데이트 가능한 텍스트 파일 하나만 있으면 된다.

코드는 Github에 올려서 관리할 것이고, Github Actions를 이용하여 주기적으로 코드를 실행시켜 트윗을 포스팅할 것이다.
그렇다면 마찬가지로 Github에서 곡 저장까지 할 수 있다면 관리가 아주 편하지 않을까?

Github에서 원하는 대로 텍스트를 올릴 수 있는 곳. 그렇다, __Issue__ 에 곡 리스트를 저장하자[^1].

## 구현

> 구현한 전체 코드는 [여기](https://github.com/ryanking13/twitter-lyric-bot)에서 볼 수 있다

트위터 API를 사용하여 트윗을 포스팅하는 파이썬 코드는 이미 작성되어 있다.

그러므로, Github Actions로 주기적으로 해당 코드를 실행하도록 만들자.

`.github/workflows/tweet.yml` 파일을 생성하고 아래와 같이 작성하였다.

{% raw %}
```yaml
# https://github.com/ryanking13/twitter-lyric-bot/blob/master/.github/workflows/tweet.yml
name: Post tweet

on:
  schedule:
  - cron: "0 6,13,23 * * *"

jobs:
  run:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v1
    - name: Set up Python 3.7
      uses: actions/setup-python@v1
      with:
        python-version: 3.7
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Tweet
      env:
        GITHUB_ACCESS_KEY: ${{ secrets.GITHUB_ACCESS_KEY }}
        TWITTER_ACCESS_TOKEN_KEY: ${{ secrets.TWITTER_ACCESS_TOKEN_KEY }}
        TWITTER_ACCESS_TOKEN_SECRET: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}
        TWITTER_CONSUMER_KEY: ${{ secrets.TWITTER_CONSUMER_KEY }}
        TWITTER_CONSUMER_SECRET: ${{ secrets.TWITTER_CONSUMER_SECRET }}
      run: |
        python run.py
```
{% endraw %}

- Github Actions는 UTC를 기준으로 하므로 9시간을 빼서 계산한다. 위 코드는 매일 8시, 15시, 22시에 실행된다.
- 파이썬 환경 세팅은 Github에서 제공하는 [setup-python](https://github.com/actions/setup-python) action을 이용하면 된다.
- 파이썬 환경 세팅 후 `run.py`가 실행되도록 하였다. `run.py`는 환경변수로 제공된 트위터, Github API 키를 사용하여 트윗을 포스팅한다.
- API 키를 노출시키지 않기 위해서 secrets 환경변수 기능을 활용한다. Github의 아래 화면에서 환경변수를 등록할 수 있다.

![secrets](../../../assets/post_images/github_secrets.PNG)


이제 주기적으로 코드를 실행하는 부분은 완성하였다. 다음으로 Issue에 곡 정보를 업데이트하는 기능을 구현하자.

```python
# https://github.com/ryanking13/twitter-lyric-bot/blob/master/issue.py
from github import Github
import config

g = Github(config.GITHUB_ACCESS_KEY)


def get_issue(repo_url, issue_no):
    issue = g.get_repo(repo_url).get_issue(number=issue_no)
    return issue.body


def update_issue(repo_url, issue_no, content):
    issue = g.get_repo(repo_url).get_issue(number=issue_no)
    issue.edit(body=issue.body + "\n" + content)
```

이 부분의 구현은 아주 간단하다. 이미 만들어져 있는 [PyGithub](https://github.com/PyGithub/PyGithub) 패키지를 활용하여,
곡 리스트가 적힌 이슈를 읽어오고, 곡 포스팅 후 [이슈](https://github.com/ryanking13/twitter-lyric-bot/issues/1)를 업데이트한다.

이제 Github에 코드를 올려놓기만 하면 전혀 신경쓰지 않아도 주기적으로 트윗을 포스팅하게 된다!

![action](../../../assets/post_images/tweet_actions.PNG)

정해진 시간마다 실행되고 있는 Github Actions의 모습

![issue](../../../assets/post_images/issue_songlist.PNG)

현재까지도 잘 업데이트 되고 있는 이슈의 모습



## 결론

- 코드는 Github에 올려서 관리
- 주기적인 트윗 포스팅은 Github Actions로 수행
- 지속적으로 업데이트하는 곡 리스트는 Issue를 활용

위와 같이 Github에서 제공하는 기능을 활용하여 주기적으로 트윗을 포스팅하는 봇을 완성하였다.

이렇게 봇의 운영을 바꾸면서 얻은 장점은 다음과 같다.

- Github Actions 서버에서 문제가 발생하지 않는 한은 안정적이고 또한 무료로 봇을 운영할 수 있다
- 하나의 Github 레포지토리에서 통합적인 봇의 관리가 가능해졌다


### 🛑 잠깐! 끝내기 전 생각해볼 거리

사실 나는 본 글을 포함해 Github Actions를 [서버리스 애플리케이션이 Cold Start하지 않도록 Health Check하는 용도](https://github.com/ryanking13/burgerqueen-webhook/blob/master/.github/workflows/defreeze.yml), [주가 알림용](https://github.com/ryanking13/noti-bot/blob/master/.github/workflows/cron.yaml) 등, CI 서비스의 기본적인 활용 용도와는 다르게 많이 사용하고 있다.

CI 서비스는 코드의 테스트 또는 배포를 위해서 사용하는 일반적이므로,
본 글과 같은 목적으로 CI 서비스를 활용하는 것은 좋게 생각하면 참신한 활용법이지만, 나쁘게 생각하면 일종의 어뷰징(Abusing)이다.

이렇게 사용하나 저렇게 사용하나 CI 서버의 리소스를 사용하는 것은 똑같으니 상관없다고 생각할 수도 있겠으나,
우리가 지금 이렇게 좋은 서비스를 무료로 사용할 수 있는 것이 사람들이 긴 시간 동안 만들어온 오픈 소스 문화의 결과물이라는 점에서,
서비스를 활용하기에 앞서 한번쯤 이런 문제를 고민 해보는 것도 좋지 않을까 생각한다.

---

### Reference

> https://github.com/ryanking13/twitter-lyric-bot

[^1]: 다른 방법으로 Github Gist에 파일을 만들어 사용하는 것도 가능하다. 이슈의 본래 용도을 생각하면 gist를 사용하는 것이 더 적절이라고 생각될 수도 있는데, 필자는 하나의 레포지토리에서 모든 걸 관리하는 것이 더 편리하다는 생각으로 이슈를 사용하였다.