---
date: "2021-04-30T09:01:00Z"
title: 월간 기술 스크랩 21/04
categories:
- Newsletter
description: 한 달간 재밌게 읽은 글이나 흥미로운 기술 등을 소개합니다. (2021년 4월)
summary: 한 달간 재밌게 읽은 글이나 흥미로운 기술 등을 소개합니다. (2021년 4월)
---

## 좋은 글

### [퇴사 부검](https://woowabros.github.io/experience/2021/04/18/autopsy.html)

전 우아한형제들 현 인프런 소속의 서버 개발자이신 [이동욱](https://github.com/jojoldu)님[^1]께서 우아한형제들을 퇴사하면서 남긴 포스트모템 글.

[^1]: 이동욱님은 [주니어 개발자 취업 정보](https://github.com/jojoldu/junior-recruit-scheduler) 깃헙 레포지토리로도 유명하다.

넷플릭스의 퇴사 문화에 맞추어,

- 왜 떠나는지
- 회사에서 배운 것
- 회사에서 아쉬운 점
- 앞으로의 계획

을 차례로 적은 글.

이제 시니어의 직급으로 넘어가고 있는 7년차 개발자가
그간 일해오면서 어떤 것들을 해왔고 또 어떤 생각을 가지고 있었는지,
한편으로는 앞으로 어떤 것을 하고싶어하는 지에 대한 생각을 읽을 수 있다. 

아직 개발자 커리어 초창기에 있는 입장에서 읽어보기에 좋은 글 이라고 느껴진다.

한편으로는, 2016년 당시 배달의 민족이 어땠는 지에 대해서도 부분적으로 알 수 있는데,
이미 국민적인 앱이 되어가고 있었던 당시에도 워낙 로켓처럼 성장한 스타트업이 내부적으로 많은 레거시를 안고 있었구나 하는 것을 알 수 있었다.

### [Using PyTorch + NumPy? You're making a mistake.](https://tanelp.github.io/posts/a-bug-that-plagues-thousands-of-open-source-ml-projects/)

파이토치에서 DataLoader로 데이터셋을 읽어올 때 각 로더가 `fork` 콜을 이용해서 생성되는데,
그렇다보니 Numpy 의 random seed를 제대로 사용하지 않으면 모든 로더가 똑같은 데이터를 읽어오게 되는 버그가 발생한다.

이게 생각보다 엄청 흔하게 발생해서 파이토치 공식 튜토리얼이나 OpenAI의 튜토리얼 등에서도 해당 버그를 발견할 수 있었다는 글.

ML은 워낙 폭발적으로 빠르게 발전하고 있다보니 제대로 정립되지 않은 것이 너무 많아서 알게 모르게 수많은 버그가 양상되는 듯 싶다.
무엇보다 어려운 것은 ML 분야는 그러한 버그들이 에러로 나타나는 것이 아니라 성능 저하로 나타난다는 점.

### [Rainbow Tables (probably) aren’t what you think](https://rsheasby.medium.com/rainbow-tables-probably-arent-what-you-think-30f8a61ba6a5)

해시 값을 대량으로 저장해두어 해싱된 비밀번호를 추출할 때 쓰이는 레인보우 테이블의 원리를 설명한 글.

단순히 생각하면 그냥 사전처럼 값을 다 저장해두면 되지 않을까 싶은데,
용량적인 측면에서 그게 불가능하고, 해시 체인의 시작과 끝만 저장해둠을 알려준다.

time/space trade-off를 볼 수 있는 현실 세계의 대표적인 예시 중 하나.

## 북마크

### [Shell Field Guide](https://raimonster.com/scripting-field-guide/)

쉘 스크립팅을 하는 데에 있어서의 다양한 트릭을 알려주는 페이지.

쉘 스크립팅은 해도해도 익숙해지지가 않아서, 스크립트를 짜야할 때면 기본적으로 [Bash Cheatsheet](https://devhints.io/bash)를 켜놓고 작업을 하는데,
좀 더 심화된 테크닉(?)이 필요할 때 살펴보기 좋은 페이지.

사실 어느정도 스크립트의 복잡성이 올라가면 파이썬이나 펄 같은 언어로 넘어가는 것이 좋다고 보긴 하는데,
그게 불가능한 상황도 분명 존재할테니, 그런 경우에 살펴보면 되지 않을까 싶다.
 

## 기술 뉴스

- [CUDA Python](https://developer.nvidia.com/cuda-python)

NVIDIA에서 CUDA의 파이썬 wrapper를 공개했다.

지금까지 머신 러닝 학습/추론 속도를 부스팅하기 위해서 일부 레이어를 CUDA로 작성하는 등의 작업을 한 라이브러리를 종종 봐왔는데,
직접 CUDA 코드를 (잘) 짜는 것이 상당히 까다로운 만큼 개인이 이러한 작업을 하기에는 어려운 부분이 있었다.

나와봐야 알겠지만 이제 개인이 파이썬만 이용해서 CUDA를 통한 학습 속도 부스팅을 할 수 있을 지도?

- [Rust for Linux](https://lkml.org/lkml/2021/4/14/1023)

리눅스 커널에 Rust를 사용하고자 하는 의견들이 꽤나 커지고 있는 것으로 보인다.
리누스 토르발즈도 이런 아이디어들을 [hate](https://lkml.org/lkml/2021/4/14/1099)하지는 않는다고.

중단기적으로는 리눅스 커널의 일부 leaf 모듈들을 러스트로 작성하는 방식이 될 듯한데, 미래에는 러스트가 리눅스 커널의 핵심적인 부분들을 차지하게 될지도 모르겠다.

## 소프트웨어/프로젝트

### [focalboard](https://github.com/mattermost/focalboard)

Slack의 설치형 대체재인 Mattermost로 유명한 Mattermost 사에서 이번엔 Trello를 대체할 수 있는 프로젝트 관리 소프트웨어인 Focalboard를 공개했다.

아직은 베타 단계인데, 폐쇄적인 환경에서 작업을 해야 한다면 고려해볼 수 있는 선택지가 될 듯.

도커 기반의 설치 스크립트가 제공되어 있어서, 빌드를 해봤는데 쉽게 설치해서 사용 할 수 있다.

### [up](https://github.com/akavel/up)

리눅스 환경에서 pipe operator `|`를 이용해서 여러 유틸리티의 결과를 조합해야할 때가 많은데,
이를 interactive하게 작업할 수 있게 도와주는 도구.

모르고 살았다면 미묘하게 불편한데 꼭 이런 도구가 있어야 한다고는 생각을 안 했을 것 같은데,
막상 알고나니 왜 지금까지 안 썼을까 하는 도구가 있다면 이런 것이 아닐까.

[up을 소개하는 해커 뉴스의 스레드](https://news.ycombinator.com/item?id=26644110)를 보면,
굳이 up을 쓰지 않더라도 비슷한 기능을 할 수 있는 트릭이 몇가지 소개되어 있으니 이 쪽을 참고해보는 것도 좋을 듯.


- awesome-korean-newsletters (https://github.com/ryanking13/awesome-korean-newsletters)
- disquiet (https://disquiet.io/)
- git-worktree