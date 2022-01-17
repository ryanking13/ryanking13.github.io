---
date: "2022-01-17T00:00:01+09:00"
title: Pyodide를 소개합니다 - 1
description: Pyodide를 소개합니다 - 1
summary: 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.
draft: false
categories:
- Pyodide
---

이 글에서는 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.

> **Note**: 이 글의 필자는 Pyodide 프로젝트에 구성원으로 참여하고 있습니다. 따라서 다소 편향된 의견이 있을 수 있습니다.

## Pyodide란?

![pyodide_logo](https://pyodide.org/en/stable/_static/pyodide-logo.png)

[Pyodide](https://pyodide.org)는 브라우저 상에서 파이썬을 구동하는 프로젝트로,
2018년 모질라의 소규모 프로젝트에서부터 시작되었습니다. [^iodide]
이 글을 작성하는 시점인 2022년 1월을 기준으로 Pyodide는 CPython 3.9.5 버전을 지원하고 있으며,
구글 크롬, 파이어폭스와 같은 대중적인 브라우저 환경에서 실행이 가능하고,
Node.js를 실험적으로 지원합니다.

[^iodide]: 정확하게는 Pyodide는 브라우저 상에서 데이터를 분석하고 시각화하고자 했던
[iodide](https://alpha.iodide.io/) 프로젝트의 일부였는데요.
2021년도에 모질라에서 iodide 프로젝트를 중단하면서,
Pyodide만 커뮤니티 기반의 오픈소스로 남게 되었습니다.


## Pyodide 사용해보기

Pyodide를 가장 쉽게 사용해 볼 수 있는 방법은 공식적으로 제공하는 [REPL](https://pyodide.org/en/stable/console.html)을 이용하는 것입니다.

> https://pyodide.org/en/stable/console.html

위 링크에 접속하면 로컬 환경의 터미널에서 파이썬 REPL을 실행한 것과 유사하게
브라우저 상에서 실행되는 Pyodide REPL을 사용할 수 있습니다.

[replit](https://replit.com/)과 같은 온라인 IDE의 REPL 써보셨다면
익숙한 느낌을 받으셨을 수도 있을텐데요.
일반적인 온라인 REPL은 뒷단에 위치한 서버에서 실제로 연산이 수행되는 것이라면,
Pyodide는 모든 과정이 브라우저에서 실행된다는 점이 큰 차이점입니다.
(다시 말해서, REPL 사이트에 접속한 상태에서 인터넷 연결을 끊어도 실행이 된다는 것을 의미합니다.)

여러분이 Jupyter Notebook에 익숙하시다면,
Pyodide를 이용하여 만들어진 Jupyter Notebook 환경인 Jupyterlite도 같이 체험해보시면 좋습니다.
브라우저 환경에서 NumPy, matplotlib과 같은 데이터 과학 라이브러리를 사용하여 시각화를 해볼 수 있습니다.

> https://jupyterlite.readthedocs.io/en/latest/_static/retro/notebooks/?path=python.ipynb


## Why Pyodide?

Pyodide를 사용해보셨다면 한편으로는
'굳이 왜 파이썬을 브라우저에서 실행해야하지?' 하는 의문이 드실 수 있습니다.
여러분이 가진 데스크톱이나 서버에서도
얼마든지 파이썬 REPL과 Jupyter Notebook을 실행시킬 수 있으니까요.

더군다나 브라우저 환경과 데스크톱 환경에는 큰 차이가 있고,
그러한 환경의 차이로 인해서 Pyodide에서는 사용할 수 없는 파이썬의 기능들이 있고,
성능 또한 Pyodide가 떨어지는 부분이 많습니다. (이에 대해서는 이어지는 글에서 설명합니다.)

그럼에도 불구하고 Pyodide를 사용함으로써 얻을 수 있는 이점은,
파이썬을 사용하는 애플리케이션을 서버 없이 Client-only 웹 애플리케이션으로 배포할 수 있다는 점입니다.
혹은 서버를 사용하더라도 파이썬을 실행하는 서버의 부하를 줄일 수 있습니다.

<br/>

<div style="text-align: center;">
<img src="/assets/post_images/pyodide/introduction/normal-application.jpg" width="100%">
<div>
    <span style="color:grey"><small><i>일반적인 웹 애플리케이션</i></small></span>
</div>
</div>

일반적으로 파이썬 웹 애플리케이션은 위와 같이 구성됩니다.
브라우저에서는 UI 로직을 처리하고,
실질적인 연산은 대부분 서버에서 이루어지게 됩니다.

<br/>

<div style="text-align: center;">
<img src="/assets/post_images/pyodide/introduction/pyodide-application.png" width="100%">
<div>
    <span style="color:grey"><small><i>Pyodide 웹 애플리케이션</i></small></span>
</div>
</div>

그러나 Pyodide를 사용하면 파이썬을 이용해서 수행하는 연산을 브라우저 영역으로 가져올 수 있습니다.
DB 엑세스와 같이 서버를 요구하는 특정한 연산만 서버에서 처리하고,
파이썬 연산을 대부분 클라이언트에서 처리할 수 있게 됩니다.

이와 같이 서버에서 파이썬을 구동하는 대신
Pyodide를 사용했을 때는 다음과 같은 장점이 있습니다.

-  __사용성(Usabillty)__

파이썬 애플리케이션을 실행하기 위해 파이썬을 직접 컴퓨터에 설치할 필요가 없습니다.
그냥 브라우저를 켜고 웹페이지에 접속하면 됩니다.

- __확장성(Scalability)__

서버에서 파이썬 애플리케이션을 구동하는 경우,
서버를 유지하는 비용이 발생하고, 트래픽 증가에 쉽게 대처하기 어렵습니다.
서버리스(Serverless) 플랫폼을 활용하면 이러한 확장성 측면을 개선할 수 있겠지만,
상태 정보를 저장하는데에 추가적인 비용이 발생합니다.

한편, Pyodide를 사용하면 기본적으로는 정적 파일을 서빙하는 서버만 존재하면 됩니다.
정적 파일을 서빙하는 것은 매우 값싸고, 쉽게 확장될 수 있습니다.
더욱이 정적 파일은 브라우저에 캐싱되기 때문에
한번 다운로드받으면 다시 다운로드 받을 필요도 없습니다.

- __개인정보보호(Privacy)__

모든 파이썬 연산이 브라우저 내에서 이루어지므로,
유저가 연산에 사용하는 데이터가 서버에 공유될 필요가 없습니다.

- __투명성(Transparency)__

모든 파이썬 연산이 클라이언트에서 이루어지므로
유저는 필요시 애플리케이션의 모든 동작을 검증할 수 있습니다.

### 예시

> Black Playground: https://black.vercel.app/

> Black Playground (pyodide): https://ryanking13.github.io/black-playground-pyodide/

위의 두 링크는 각각 파이썬 포맷터인 [black](https://github.com/psf/black)을 사용한 웹 애플리케이션입니다.
둘 모두 파이썬 코드를 입력하면 자동으로 포맷팅을 해주는 기능을 제공하는데요.

전자는 Black 공식 레포지토리에서 제공하는 것, 후자는 제가 Pyodide를 사용하여 만든 버전입니다.
전자를 사용해보시면 좌측에 코드를 입력하면 일정 시간이 지나서 포맷팅이 완료되는 것을 확인할 수 있는데요.
왜냐하면 코드를 서버에 보내고, 포맷팅된 코드를 받아오는 연산이 수행되고 있기 때문입니다. 
(개발자 도구의 Network 탭을 열어보시면 이러한 부분을 확인하실 수 있습니다.)

한편 후자는 실시간으로 포맷팅이 이루어지는 것을 확인할 수 있는데요.
처음 Pyodide 파이썬 인터프리터를 브라우저에 로딩하고나면
브라우저 내에서 모든 연산이 이루어지기에 네트워크 레이턴시 없이 매우 빠르게 반응하는 것을 확인할 수 있습니다.

## Pyodide를 활용한 프로젝트

앞서 언급한 Pyodide의 장점은 물론 모든 애플리케이션에 적용할 수 있는 것은 아닙니다.
반드시 서버에서 이루어져야만 하는 동작도 있고, 고성능 연산 장비가 필요한 경우도 있습니다.
그러나 특정한 경우에서 파이썬을 사용하여야 할 때, 분명 좋은 선택지가 될 수 있습니다.

아직 Pyodide는 초창기 단계이지만 다양한 프로젝트에서 활용되고 있습니다.
특히 브라우저로 웹페이지에 접속만 하면
아무런 설치 과정 없이도 바로 파이썬을 사용할 수 있다는 점에서,
프로그래밍 교육 분야에서 Pyodide를 활용하려는 시도가 많이 이루어지고 있습니다.
이 글에서는 대표적인 프로젝트 두 가지를 소개합니다.

### Baston

<br />
<div style="text-align: center;">
<img src="https://basthon.fr/theme/assets/img/basthon.svg" width="70%">
</div>

[Baston](https://basthon.fr/)은 Pyodide를 이용한 파이썬 Notebook 환경입니다.
현재 프랑스에서 10만명 이상의 중학교 학생들이 프로그래밍을 배우기 위해 매달 사용하는 것으로 알려져 있습니다.

### Jupyterlite

<br />
<div style="text-align: center;">
<img src="https://jupyterlite.readthedocs.io/en/latest/_static/wordmark.svg" width="70%">
</div>

[Jupyterlite](https://jupyterlite.readthedocs.io/en/latest/)는
Jupyter Notebook을 개발하는 Jupyter 재단에서 개발하고 있는 Jupyter Notebook의 브라우저 버전으로,
내장 파이썬 커널로 Pyodide를 사용합니다.

이외에도 [Starboard Notebook](https://starboard.gg/), [futurecoder](https://futurecoder.io/)와 같은
프로젝트들이 존재합니다.

### 결론

Pyodide는 다양한 가능성을 지닌 멋진 프로젝트입니다.
열정적인 메인테이너들의 주도로 현재까지도 매우 활발하게 개발되고 있는 프로젝트이며,
그럼에도 아직까지 풀어야 할 문제도 많습니다.
혹시 이 글을 읽고 Pyodide에 관심이 생기셨다면,
Pyodide 프로젝트에 기여해보시는 것은 어떨까요? Pyodide는 모든 방식의 컨트리뷰션을 환영합니다.

이어지는 글 (작성중) 에서는 Pyodide를 구성하는 기술과 한계점, 앞으로의 로드맵 등을 소개합니다.