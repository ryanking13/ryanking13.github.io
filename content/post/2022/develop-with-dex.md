---
date: "2022-09-05T00:01:00"
title: Dex를 이용한 모바일 원격 개발 후기
categories:
- Development
description: Dex를 이용한 모바일 원격 개발 후기
summary: " "
draft: true
---

<div style="text-align: center;">
	<div><img src="https://images.samsung.com/is/image/samsung/assets/us/business/solutions/samsung-dex/101221/DeX-WFH_S20_HD01_Home_KV_Carousel.jpg" style="width: 500px; max-width: 100%" /></div>
	<div>
		<span style="color:grey"><small><i>이미지 출처: https://www.samsung.com/us/business/solutions/samsung-dex/</i></small></span>
	</div>
</div>



올해 들어 몇 가지 이유로 [삼성 스마트폰의 Dex 기능](https://www.samsung.com/sec/apps/samsung-dex/)을
이용한 모바일 원격 개발을 자주 진행하고 있습니다. 비슷한 개발 환경 구축에 관심이 있는 분들을 위해
몇 달간 해당 환경에서 개발을 진행하면서 느낀 점과 개발 효율을 높이는 방법 등을 공유하려고 합니다.

## 개발 환경 

전체적인 개발 환경을 나타낸 그림은 위와 같습니다. Dex 기능이 활성화된 삼성 스마트폰을
HDMI 케이블과 USB Type-A 케이블 포트가 있는 도킹 스테이션에 연결하고, 도킹 스테이션에
모니터와 키보드, 마우스를 연결하여 작업하는 형태입니다.

### 1. 도킹 스테이션

<div style="text-align: center;">
	<div><img src="/assets/post_images/dex/vention-hub.png" style="width: 350px; max-width: 100%" /></div>
	<div>
		<span style="color:grey"><small><i>초창기에 사용하던 USB 허브</i></small></span>
	</div>
</div>

<br/>

<div style="text-align: center;">
	<div><img src="/assets/post_images/dex/baseus-dexstation.jpg" style="width: 350px; max-width: 100%" /></div>
	<div>
		<span style="color:grey"><small><i>현재 사용하는 Baseus Dex 스테이션</i></small></span>
	</div>
</div>

초창기에 휴대전화를 주변기기와 연결할 때는 
노트북 포트 확장을 위해 많이들 사용하는 USB 허브를 사용했는데요.
본래 사용 목적이 노트북의 포트를 확장하기 위한 것이어서 그런지
연결이 다소 불안정하다고 느꼈습니다. 또한 휴대전화의 안정적인 거치가
어려운 점이 있어, 몇주간 사용한 뒤 Dex를 위해서 따로 만들어진
Dex 스테이션을 구매해서 현재까지 사용하고 있습니다.

이를 위한 삼성 공식 Dex 악세서리가 존재하지만 가격이 상당한 (10만원 초반대) 관계로,
저는 Baseus에서 만든 Dex 스테이션 (3-4만원)을 구매해서 사용하고 있습니다.
USB 포트가 3개 달려있어 키보드 마우스를 연결할 수 있고, HDMI 포트로 모니터 연결이 가능합니다.

해당 기기의 단점으로는, 휴대전화를 세로로 꽃아 걸쳐두는 형태인데,
아주 안정적이지는 않아서, 휴대전화를 데스크 위에 놓아뒀을 때,
데스크가 크게 흔들릴 경우 연결이 잠깐씩 해제되는 문제가 있습니다.
또한 휴대전화를 터치패드로 사용하기에는 어려움이 있습니다.
이 두 가지 요소가 불편하다면 조금 가격이 나가더라도
[삼성 Dex Pad](https://www.samsung.com/sec/support/model/EE-M5100TBKGKR/)
를 구매해보시면 좋을 것 같네요.


### 2. 휴대전화

삼성 Dex 모드를 활용해야 하므로 삼성 휴대전화가 필요합니다.
갤럭시 S8 이후의 모델부터 Dex 모드를 지원하기 시작했는데요.
중저가형 보급기인 갤럭시 A 시리즈를 제외하면 최근 출시되는 갤럭시
플래그십 휴대전화에는 모두 Dex 기능이 탑재된 것으로 알고 있습니다.
저는 8GB RAM을 제공하는 삼성 S22+를 사용 중입니다.

Dex 연결 시 FHD 화질로 모니터에 화면이 출력되며, 휴대전화를 보조 모니터로 사용이 가능합니다.
다만 저는 작은 휴대전화 화면을 보조 모니터로 사용하는 것이 불편하고, 컴퓨터와 달리 같은 앱을
동시에 모니터와 휴대폰에 출력하는 것이 불가능해서 기본적으로는 모니터 화면만 사용하고 있습니다.

{{% admonition note "안드로이드 데스크톱 모드" false %}}

사실 안드로이드 OS 에는 버전 10부터 자체적으로 지원하는 데스크톱 모드가 있습니다.
저는 S22+로 기종 변경을 하기 전, LG G7 휴대전화로 잠깐 데스크톱 모드를 사용해본 적이 있는데요.

당시에는 굉장히 자주 연결이 끊기고, 불안정했던 경험이 있습니다.
최근에는 개선이 되었을지는 모르겠지만, 삼성 Dex 모드 수준의 완성도를
기대하기는 어려운 것 같습니다.

{{% /admonition %}}

### 3. 개발 환경 구축

휴대전화에서 개발을 하기 위해서 선택할 수 있는 몇 가지 방법들이 있습니다.

1. 휴대전화에 직접 개발 환경을 구축하는 방법
2. 서버에 개발 환경을 구축하고 원격 접속하는 방법
3. 온라인 IDE를 이용하는 방법

1번의 경우, 안드로이드에서만 사용할 수 있는 터미널 에뮬레이터인
[Termux](https://termux.com/)와 같은 도구를 활용하는 방법입니다.

<div style="text-align: center;">
	<div><img src="https://github.com/coder/code-server/raw/main/docs/assets/screenshot.png" style="width: 500px; max-width: 100%" /></div>
	<div>
		<span style="color:grey"><small><i>code-server</i></small></span>
	</div>
</div>

2번의 경우, 흔히 사용하는 방법으로는 [TeamViewer](https://www.teamviewer.com/ko/)나,
[Chrome Remote Desktop](https://remotedesktop.google.com/) 등을 이용해서
GUI 상에서 원격 접속하는 방법이 있습니다.
조금 더 나아가서, 굳이 GUI가 필요하지 않은 경우에는
[vscode-server](https://code.visualstudio.com/docs/remote/vscode-server)와 같이,
VSCode를 원격으로 실행하는 방법이 있습니다.

마지막으로 3번은 직접 서버를 구축하는 대신 [Github Codespaces](https://github.com/features/codespaces),
[Gitpod](https://www.gitpod.io/), [repl.it](https://replit.com/) 과 같은 온라인 IDE를 사용하는 방식입니다.

저는 소개한 세 가지 방법을 모두 사용해보았는데요.
현재는 온라인 IDE를 사용하는 방법에 정착했고, IDE로는 Github Codespaces를 사용하고 있습니다.

개인적으로 느낀 각 방식의 장단점은 다음과 같습니다.

- Termux
  - 장점: 설치가 간편...?
  - 단점: 간단한 스크립트 작성을 벗어난 수준의 개발이 사실상 불가능, 유사 리눅스 환경을
제공하는 터미널 에뮬레이터로, 기능적으로 제약이 아주 많음. 휴대전화의 성능이 PC 대비 떨어짐.

- code-server
  - 장점: 기본적인 지식만 있다면 세팅이 크게 어렵지 않음
  - 단점: 집에 서버를 구축할 경우 네트워크 설정 등이 다소 복잡, 항시 PC를 구동해야 함
클라우드 VPS를 구매하여 사용할 경우 비용이 발생

- 온라인 IDE
  - 장점: 설치가 필요 없으며 직접 서버를 관리할 필요도 없음, 서버를 삭제하고 다시 만드는 것이 매우 간편
  - 단점: 사용량에 비례한 비용이 발생.

## Dex + Online IDE의 장점

Github Codespaces의 경우, 최근 Teams와 Enterprise 계정에만 유료로 제공되는 것으로 정책이 바뀌었지만,
저는  과거 베타 버전에 지원했던 덕분에 현재까지 무료로 사용하고 있고,
4-core 8GB RAM, 32GB 디스크 공간이 주어지는 머신을 제공합니다.

따라서 여기서 "장점"이란, Dex 개발이 강제되는 상황에서, Github Codespaces와 같은 Online IDE를
로컬 개발환경을 구축하기 어려운 휴대전화 및 태블릿 개발환경에서는
원격 서버 등에 개발 환경을 구축하고 개발하는 것이 일반적인데,

Online IDE를 사용하면 이러한 설정 과정을 크게 단축할 수 있다.
굳이 자체적인 컨테이너를 만들기 귀찮다면 Github Codespaces 에서 제공해주는 기본 컨테이너를 그대로
사용해도 큰 무리가 없는 수준.

가격은 장점이라고 하기에는 좀 애매한 부분인데,
또한 집에 베어메탈 서버가 있는 것이 아니라 클라우드에서 VPS를 구매해서 사용하는 경우를 가정하면,
Github Codespaces에서 제공하는 수준의 4-core 8GB ram 을 제공하는 VPS의 가격대가 AWS lightsail 기준
월 40$ 언저리인데, Github Codespaces는 시간당 0.36 달러를 징수하고, 하루 6시간, 월 20일을 개발한다고 가정하면,
대충 월 40$ 가 나오게 된다.
유사 서비스인 gitpod의 경우 훨씬 저렴한데, 사용해보지 못해서 정확하게 얘기하기는 어렵다.

그 외에도 포트포워딩등을 알아서 해준다던가 하는 편리성


## 단점

- 듀얼 모니터
- 화면 리프레시
- 개발자 도구
- 휴대폰 특유의 불편함, 컴퓨터처럼 못 씀
- 웹에서 지원되지 않는 extension
- ...

## 추천할만한가?

### Dex를 이용한 태블릿 개발

컴퓨터가 있다면 굳이 Dex를 사용해서 개발을 할 이유는 없다.
그러나 특정 상황에서 개발이 필요하다면 충분히 개봄직하다고 생각.

### 온라인 IDE

Github Codespaces를 기준으로 굉장히 만족하면서 사용 중.

... ~ .devcontainer 를 이용한 최적화 등
다양한 레포지토리에 맞춰서 필요한 도구들을 알아서 잘 설치해줌.

특히 리모트 저장소로 Github을 사용한다고 했을 때 integration이 굉장히 잘 됨.

가격 문제? 필자는 현재 무료로 사용하고 있는데, 사실 가격으로만 생각하면 꽤나 비싼편,
업무 환경에서는 지원을 받을 수 있으면 좋겠고, 개인 개발용으로 사용하기에는 조금 부담되는 가격으로 생각.


대체재로는 Gitpod이 있는데, 사실 아직 사용은 해보지 못함.
한달에 시간제한이 빡빡하게 있기는 하지만 프리 티어가 있고,
프리티어를 넘어서는 부분에 대해서도 Github Codespaces보다는 저렴한 가격대를 형성하고 있어서,
대체제로 사용해볼 수 있다고 생각.

