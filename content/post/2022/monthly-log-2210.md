---
date: "2022-10-31T00:01:00"
title: 월간 기술 스크랩 22/10
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 10월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 10월)
draft: false
hiddenfromhomepage: true
---

## ✍️ 글

### [good-taste](https://felipec.github.io/good-taste/parts/1.html)

리누스 토르발즈의 유명한 TED 영상인 [The mind behind Linux](https://www.youtube.com/watch?v=o8NPllzkFhE&t=858s)에서
언급된 코드의 "Good Taste"에 관해서,
링크드 리스트의 삭제 함수를 예시로 설명하는 글입니다.

TED 영상에서는 간단하게 두 코드를 비교하고 넘어가는데요.
이 글에서는 "Bad Taste" 코드를 "Good Taste"으로 변환하는 과정을 포함해서,
실제로 유명한 오픈 소스 라이브러리의 링크드 리스트 구현체에서는 어떤 식으로 유사 함수가 구현되어 있는지를 살피고,
나아가서 LLVM의 코드에서는 C의 내부 동작을 활용해서 어떤 식으로 자료 구조를 최적화했는지를 보여줍니다.

### [BLAS 라이브러리 비교](https://kaldi-asr.org/doc/matrixwrap.html)

[kaldi](https://github.com/kaldi-asr/kaldi) 프로젝트 문서에서
선형대수 연산을 위한 라이브러리인 BLAS, LAPACK의 여러 구현체를 비교하고 설명한 글.

선형대수 관련 연산을 하드웨어에 맞추어 최적화 해주는 여러 라이브러리가 존재합니다.
일반 유저는 사실 잘 알지 못하고 알 필요도 없는 경우가 많은데요.
혹시 특정한 라이브러리를 사용해야 하는 상황이라면 이 글을 참고하면 좋을 것 같습니다.

### [그림으로 설명하는 Stable Diffusion](https://jalammar.github.io/illustrated-stable-diffusion/)

최근 [Mid Journey](http://midjourney.ai/), [Novel AI](https://novelai.net/) 등
다양한 프로젝트에 적용되면서 어마어마한 결과물을 보이고 있는 생성 모델인 Stable Diffusion에 대하여
전체적인 구조를 그림으로 설명한 글입니다.

딥러닝에 대한 기본적인 지식은 있지만, Generative Model에 대한 지식이 없는 사람들이
읽으면 적당한 정도의 내용을 담고 있습니다.

### [The State of AI & Art 2022](https://velog.io/@laeyoung/The-State-of-AI-Art-2022)

2022년의 핫한 토픽인 Text-to-Image AI에서
지난 1년 간의 주요한 프로젝트를 시간 순으로 정리한 글입니다.

### [How Wine works](https://werat.dev/blog/how-wine-works-101/)

리눅스 환경에서 윈도우 바이너리를 실행할 수 있게 해주는 Wine이 어떻게 동작하는 지를 설명하는 글.

많은 사람들이 Wine을 에뮬레이터로 오해하고 있지만, Wine은 동적 로더에 가깝다는 것을 애기하면서,
추가적으로 시스템 콜을 변환하는 중간 레이어 등을 가지고 있다고 설명합니다.

### [2018년, 내가 모르는 기술들](https://overreacted.io/ko/things-i-dont-know-as-of-2018/)

컴퓨터 공학 분야는 매년 수많은 새로운 기술들이 나오고,
"좋은 개발자"라면 이를 모두 알고 있어야 한다고 생각하기 쉽지만,
사실 시니어 엔지니어들도 이러한 내용들을 잘 모르는 경우가 많다는 것을 이야기합니다.

이 글은 React 코어 팀이자 Redux 라이브러리를 만든 개발자가,
2018년도에 핫한 기술들을 얘기하면서 사실 자신이 그러한 기술들을 잘
알 지 못한다는 것을 얘기하는데요.
임포스터 신드롬을 느끼고 있는 개발자라면 한 번쯤 읽어보면 좋을 듯 합니다.



<!-- ## 📌 북마크 -->

## 📰 기술 뉴스

### [Aalyria](https://www.tech42.co.kr/%ea%b5%ac%ea%b8%80-%eb%a3%ac-%ed%94%84%eb%a1%9c%ec%a0%9d%ed%8a%b8-%ec%9a%b0%ec%a3%bc-%ec%9d%b8%ed%84%b0%eb%84%b7%ec%9c%bc%eb%a1%9c-%ec%82%b4%ec%95%84%eb%82%98%eb%8b%a4-%e7%be%8e-%ec%9a%b0/)

구글에서 아프리카 등 통신 인프라가 갖추어지지 않은 곳에 통신망을 공급하기 위해
저고도에 통신 기능을 갖춘 풍선을 띄운다는 룬 프로젝트가 있었습니다.

아쉽게도 이 프로젝트는 최근 구글에서 사업을 정리하면서 구글이 버린 사업 중 하나로 남게 되었지만,
해당 기술을 개발했던 연구진들이 스핀 오프해서 알라리아(Aalyria)라는
기업을 설립하고 기술 이전을 받았다는 소식입니다.
알라리아는 룬 프로젝트를 수행할 당시에 개발되었던,
연결이 불안정한 풍선들과 위성 사이에서 정보를 교환하기 위한
레이저 기반 통신 기술과, 불안정한 네트워크를 조정하는 소프트웨어 플랫폼 기술을
기반으로 하고 있다고 하는데요.
최근 각광받고 있는 우주 사업에 이 기술들이 기여를 할 수 있을 지도 모르겠습니다.

구글은 [KilledByGoogle](https://killedbygoogle.com/) 이라는 사이트가 있을 정도로
많은 서비스를 런칭하고 없애기로 유명한데요.
룬 프로젝트에서 개발되었던 기술이 새로운 방식으로 사용될 수 있을 지 기대가 됩니다.

### [Meta Quest Pro](https://www.oculus.com/blog/meta-quest-pro-price-release-date/)

Meta에서 작년부터 프로젝트 캄브리아로 알려졌던, 하이엔드 VR 헤드셋인 메타 퀘스트 프로를 공개했습니다.

기존에 굉장히 저렴한 가격으로 출시해서 화제가 되었던 퀘스트 2와는 달리,
퀘스트 프로는 미국에서는 1500 달러, 한국에서는 200만원을 초과하는 가격으로
판매가가 책정되어 있어 아주 비싼 모델인데요.
현재까지 시장의 반응은 다소 차가운 편인 것 같습니다만,
남들이 쉽게 가지 못하는 길을 회사의 명운을 걸고 가고 있는
메타가 앞으로 VR 시장에 어떤 발전을 가져올 지가 궁금하네요.

## ⚙️ 소프트웨어 / 프로젝트

### [Python 3.11](https://discuss.python.org/t/python-3-11-0-final-is-now-available/20291)

Python 3.11이 릴리즈 되었습니다.

귀도 반 로썸이 은퇴를 번복하고 마이크로소프트에 합류해서 Faster CPython 이라는 프로젝트를
진행하면서, 파이썬의 성능 향상에 대한 기대가 많이 있었던 3.11 이번 릴리즈인데요.

그만큼 수많은 알파, 베타, RC 버전을 거쳐서 상당히 힙겹게(?) 릴리즈되었습니다.

성능 향상 외에도 에러 위치를 더 정확하게 표현해준다던가 하는 다양한 기능들이 추가되었으니,
기존에 파이썬을 사용하고 계신 분들은 빠른 업그레이드를 고려해보시는 것도 좋을 것 같습니다.

## 📙 책 / 강의 / 영상

### [Pycon KR 2022](https://m.youtube.com/watch?v=5NjMaxYQuIc&list=PLZPhyNeJvHRnlqQwMj-WNlrsac7yTiVhk)

Pycon Korea 2022 발표 영상이 유튜브에 업로드 되었습니다.