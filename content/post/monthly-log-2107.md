---
date: "2021-08-01T01:01:00Z"
title: 월간 기술 스크랩 21/07
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 7월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 7월)
draft: false
---

## ✍️ 글

### [Why I’m Not Excited About Windows 11](https://medium.com/pcmag-access/why-im-not-excited-about-windows-11-590199b2c0ca)

Windows 11이 Mac과 같은 다른 OS의 디자인 철학을 따라하기만 했을 뿐,
정작 필요했던 기능적인 측면에서는 발전이 없었다는 것을 지적하는 글.

개인적으로 Windows 11의 큰 방향성은 모바일과 PC를 통합하는 것이라고 생각하기 때문에,
이미 해당 영역에서 압도적인 UI/UX 경험을 제공하는 애플을 따라하는 것이 이상하다고 생각하지는 않습니다.
그럼에도 불구하고, 각 OS의 차별점이 없어지고 다들 비슷비슷해지는 것에 대해서는 분명 다소 우려스러운 점이 있습니다.

얼마 전 엣지 브라우저가 크로미움을 기반으로 하는 새 버전을 발표한 것도,
마이크로소프트의 결정을 이해하지 못하는 것은 아니지만,
사실상 크로미움이 독점적인 브라우저가 된다는 점에서 기술의 다양한 발전을 막는 요소가 되지 않을까 하는
우려의 목소리들이 존재했던 것처럼요.

### [Firecracker: Lightweight Virtualization for Serverless Applications](https://www.micahlerner.com/2021/06/17/firecracker-lightweight-virtualization-for-serverless-applications.html)

AWS 서버리스 플랫폼(Lambda)에서 사용되는 Firecracker "MicroVM"을 소개하는 글.

기존에는 유저 별로 EC2 인스턴스를 할당하고 그 위에서 Lambda Function을 돌렸는데,
이렇게 했을 때 EC2 VM의 유휴 자원이 낭비 되다보니, 여러 유저의 Lambda Function을 한 EC2 VM 위에 올리기 위한
Firecracker 기술을 개발하였다고 합니다.

Firecracker 기술에 대해서 더 자세히 알고 싶으신 분은 NSDI'20에 공개된 [원 논문](https://www.usenix.org/conference/nsdi20/presentation/agache)을 참고하시면 되겠습니다.

## 📌 북마크

### [CoRecursive](https://corecursive.com/)

개발자를 초청해서 기술에 대한 깊은 이야기를 전하는 팟캐스트.

얼마 전 이곳에서 진행한 [SQLite 탄생에 관한 뒷 얘기](https://corecursive.com/066-sqlite-with-richard-hipp/)가 화제가 되기도 했습니다.

## 📰 기술 뉴스

### [Goodbye, Fleets](https://blog.twitter.com/en_us/topics/product/2021/goodbye-fleets)

트위터가 작년 말에 런칭한, 일정 시간이 지나면 사라지는 트윗 기능인 Fleets를 중단한다고 발표했습니다.
인스타그램의 스토리 기능을 따라하고자 했지만, 좋은 결과를 얻지 못한 모습이네요.

아무래도 인스타그램보다는 트위터가 그 자체로 휘발성이 강한 미디어라서 그랬던 것일까요?
최근 틱톡같은 신흥 SNS 강자들이 등장하면서 기존의 대형 SNS 미디어들이 신흥 미디어의 여러 요소들을 벤치마킹하는 모습을 많이 보여주는데,
각자의 유저층이 원하는 기능이 무엇인지 정확한 니즈를 파악하는 것이 중요하다고 느껴지는 뉴스입니다.

### [2021년도 개발자 에코시스템 현황](https://blog.jetbrains.com/ko/blog/2021/07/16/the-state-of-developer-ecosystem-2021/)

JetBrains에서 매년 진행하는 개발자 에코시스템 설문조사의 2021년도 버전이 공개되었습니다.

언어의 인기도 측면에서 보면, JavaScript 천하는 여전하지만,
Python, Kotlin, TypeScript, 그리고 Go의 인기가 날로 증가하고 있습니다.
Rust는 인기는 많지만 실제 업무에서는 여전히 잘 활용되지 못하는 모습이네요.

우리나라에서 Java의 인기는 여전합니다. 세계적으로도 제일 Java를 선호하는 국가가 대한민국입니다.

Python이 데이터 사이언스 말고도 웹 개발 측면에서 꽤 많이 사용되고 있습니다. Flask와 Django가 웹 프레임워크의 1, 2위 자리를 다투는 중이고,
FastAPI의 약진도 돋보입니다.

또, 여성 개발자의 비중이 점차 늘어가고 있습니다. 아직도 전체 비중의 20%가 채 안되는 모습이지만요.
흥미로운 것은 국가별로 큰 차이는 없지만 대한민국이 여성 개발자 비중이 가장 높은 국가입니다.

급여 측면에서는, 미국이 정말 압도적으로 평균 급여가 높습니다.
2위인 캐나다, 영국에 비해서도 두배 가까이 높고, 대한민국보다는 네배 가까이 차이가 나네요.
(영국은 개발자 대우가 그리 좋지 않는 것으로 알고 있는데, 물가의 영향일까요?)


## ⚙️ 소프트웨어 / 프로젝트

### [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)

세계 최대 CDN 업체인 Akamai에서 엣지 컴퓨팅 기반 FaaS 서비스인 EdgeWorkers를 공개했습니다.

V8 엔진을 기반으로 동작한다는 점, 엣지 서버를 이용해서 사용자와 가까운 서버에서 동작한다는 점 등
Cloudflare의 Workers와 거의 동일한 서비스인 것으로 보입니다.

최근 CDN 업계에서 Cloudflare나 Fastly가 빠르게 성장하면서 많은 주목을 받고 있는 것에 비해
Akamai는 상대적으로 개인에게는 크게 인기가 없었다고 생각되는데요.
이번에 공개된 EdgeWorkers를 계기로 Akamai가 새로운 변화를 꾀할 수 있을 지 주목해보시는 것도 좋을 듯합니다.

### [NVIDIA Canvas](https://www.nvidia.com/en-gb/studio/canvas/)

NVIDIA에서 공개한 머신러닝 기반 배경 이미지 생성 도구.

5백만 개의 풍경 이미지로 학습된 GAN을 이용하여,
마우스 붓질 몇 번으로 쉽게 실제같은 풍경 이미지를 생성할 수 있습니다.

단순히 NVIDIA의 기술력을 보여주는 도구라기에는 psd 익스포트도 가능한 등 완성도가 꽤나 높은데요.
간단한 프로토타입 이미지 등을 만드는 데에 유용하게 사용할 수 있을 듯 싶습니다.

### [mobileConsole](https://www.hnldesign.nl/work/code/mobileconsole-javascript-console-for-mobile-devices/)

웹 페이지에 유사 개발자 도구 콘솔을 띄워주는 자바스크립트 코드.

PC 환경이라면 그냥 브라우저 개발자 도구를 켜면 되겠지만,
모바일 환경에서는 아무래도 브라우저의 기능에 제약이 많습니다.

최근에는 상황에 따라 태블릿을 이용해서 개발하는 것이 꽤 흔해졌고,
심지어는 안드로이드 데스크탑 또는 삼성 DeX를 이용해서 스마트폰으로 개발을 하는 경우도 종종 있다보니,
급할 때 이런 도구를 써먹을 수 있을 것 같네요.

### [WIFI Card](https://wificard.io/)

와이파이 연결 정보를 QR Code로 생성해주는 사이트.

카페 운영하시는 분들이 출력해서 쓰셔도 좋을 것 같고,
집에 하나 출력해서 붙여놓고 손님이 왔을 때 보여주기에도 좋을 것 같네요.


## 📙 책 / 강의 / 영상

### [Andrej Karpathy (Tesla): CVPR 2021 Workshop on Autonomous Vehicles](https://youtu.be/g6bOwQdCJrc)

테슬라의 AI 헤드인 안드레이 카파시가 CVPR 2021에서 진행한 자율주행에 관한 키노트.

테슬라가 다른 자율주행업체들 대비 가지고 있는 해자는
전세계에서 주행중인 테슬라 차량에서오는 압도적인 수의 데이터임을 누구도 부정할 수 없는데요.

이 키노트에서는 천문학적인 데이터를 테슬라가 잘 활용하기 위해서 어떠한 파이프라인을 구축하고 있는지를 알 수 있습니다.

근 1-2년간 테슬라의 주가가 워낙 많이 오르다보니 투자자의 입장에서 현재 테슬라의 가치가 고평가인지, 저평가인지는 논쟁의 여지가 있지만,
자신들만이 가진 데이터를 십분 활용해서 테슬라가 어렵고 흥미로운 일에 계속 도전하고 있음은 분명한 것 같습니다.

다른 건 몰라도 이 발표로 리쿠르팅 홍보 효과는 확실하겠네요.

### [스크래치부터 시작하는 컨테이너](https://m.youtube.com/watch?v=8fi7uSYlOdc)

컨테이너의 핵심 개념인 Namespace와 Cgroups를 직접 코딩하면서 배우기.

프로세스를 컨테이너화 하는 데에 필요한 기능을 하나씩 추가하면서
결과가 어떻게 변화하는 지를 직접 확인할 수 있어서 컨테이너와 관련된 개념을 이해하는 데 많은 도움이 되는 자료입니다.

### [Grokking Simplicity](https://www.amazon.com/Grokking-Simplicity-software-functional-thinking/dp/1617296201)

실제 상황에서 함수형 프로그래밍 아이디어들이 어떻게 적용되는지 차근차근 배울 수 있는 책.

함수형 패러다임을 배우다보면, 어떤 철학을 따르는 것인지도 알겠고, 그게 이론적으로 어떻게 좋은 것인지도 이해를 하겠는데,
막상 실제 상황에서 어떻게 적용하면 좋을지 와닿지 않는 경우가 많은데요.

이 책은 실제 개발 환경에서 발생할 수 있는 복잡한 문제를 함수형 패러다임을 적용하여 이해하고 확장하기 쉽게 변형하는 법을 다룹니다.

개인적으로 그간 읽어본 함수형 패러다임을 다루는 책 중에서 가장 실용적이라고 느껴지는 책입니다.

### [Global Maintainers Summit 2021](https://youtube.com/c/GitHub)

지난 6월 8-9일 이틀동안 진행된 깃헙의 [Global Maintainers Summit](https://globalmaintainersummit.github.com/) 발표 영상이 공개되었습니다.

Python, Node.js, Rails, Homebrew 등 굵직한 거대 오픈소스 프로젝트 개발자들의
경험담을 들을 수 있습니다.
수많은 사람들이 참여하는 프로젝트를 관리하는 측면에서,
프로젝트 참여를 어떻게 독려하고, 모티베이션을 주고, 다양한 문제들을 자동화했는지를 알 수 있는데요.

오픈소스 프로젝트를 운영하고 있거나, 운영할 계획이라면 도움이 될만한 영상들이 많습니다.

### [Effective Python: 90 Specific Ways to Write Better Python](https://www.amazon.com/Effective-Python-Specific-Software-Development/dp/0134853989)

파이썬을 "잘" 쓰기 위한 90가지 방법들.

파이썬은 알면 알수록 더 잘 쓸 수 있는 언어인데요 (어떤 언어든 안 그렇겠습니까만은).
기본적인 문법에서부터 테스트, 프로파일링에 이르기까지 파이썬의 Best Practive를 배우기에는 이 책이 가장 좋지 않을까 싶습니다.

취미삼아 파이썬을 배우는 분들이 읽어도 좋은 책이지만,
특정 프로젝트에 파이썬을 새로 도입하고자 하는 조직에서 읽어보시면 더 좋은 책이 아닐까 싶습니다.
