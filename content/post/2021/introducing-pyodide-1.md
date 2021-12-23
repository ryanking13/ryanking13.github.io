---
date: "2021-12-19T00:00:01+09:00"
title: Pyodide를 소개합니다 - 1
description: Pyodide를 소개합니다 - 1
summary: 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.
draft: true
categories:
- Pyodide
---

이 글에서는 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.

> **Note**: 이 글의 필자는 Pyodide 프로젝트에 구성원으로 참여하고 있습니다. 따라서 다소 편향된 의견이 있을 수 있습니다.

## Pyodide란?

[Pyodide](https://pyodide.org)는 브라우저 상에서 파이썬을 구동하는 프로젝트로,
2019년 모질라의 소규모 프로젝트에서부터 시작되었습니다. [^iodide]
이 글을 작성하는 시점인 2021년 12월을 기준으로 Pyodide는 CPython 3.9.5 버전을 지원하고 있으며,
구글 크롬, 파이어폭스와 같은 일반적인 브라우저 환경에서 실행이 가능하고,
Node.js를 실험적으로 지원합니다.

[^iodide]: 정확하게는 Pyodide는 브라우저 상에서 데이터를 분석하고 시각화하고자 했던
[iodide](https://alpha.iodide.io/) 프로젝트의 일부였는데요.
2021년도에 모질라에서 iodide 프로젝트를 중단하면서,
Pyodide만 커뮤니티 기반의 오픈소스로 남게 되었습니다.


## Pyodide 사용해보기

일단 직접 써보는 것이 Pyodide를 이해하기 가장 쉬운 방법이겠죠?
Pyodide를 가장 쉽게 사용해 볼 수 있는 방법은 공식적으로 제공하는 [REPL](https://pyodide.org/en/stable/console.html)을 이용하는 것입니다.

> https://pyodide.org/en/stable/console.html

위 링크에 접속하면 로컬 환경의 터미널에서 파이썬 REPL을 실행한 것과 유사하게
브라우저 상에서 실행되는 Pyodide REPL을 사용할 수 있습니다.

[replit](https://replit.com/)과 같은 온라인 IDE의 REPL 써보셨다면
익숙한 느낌을 받으셨을 수도 있을텐데요.
일반적인 온라인 REPL은 뒷단에 위치한 서버에서 실제로 연산이 수행되는 것이라면,
Pyodide는 모든 과정이 브라우저에서 실행된다는 점이 큰 차이점입니다.
(다시 말해서, REPL 사이트에 접속한 상태에서 인터넷 연결을 끊어도 실행이 된다는 것을 의미합니다.)

## Why Pyodide?

자, 여기까지 글을 읽으셨다면 '굳이 왜 파이썬을 브라우저에서 실행해야하지?' 하는 의문이 드실 수 있습니다.
분명 브라우저와 환경과 데스크톱 환경에는 큰 차이가 있고,
그러한 환경의 차이로 인해서 Pyodide에서는 사용할 수 없는 파이썬의 기능들이 있고,
성능 또한 Pyodide가 떨어지는 부분이 많습니다. (이에 대해서는 이어지는 글에서 설명합니다.)

<div style="text-align: center;">
<img src="/assets/post_images/pyodide/introduction/client-only-application.PNG" width="100%">
<div>
    <span style="color:grey"><small><i>Client-only web application</i></small></span>
    <br />
    <span style="color:grey"><small><i>(https://www.destroyallsoftware.com/talks/the-birth-and-death-of-javascript)</i></small></span>
</div>
</div>

그럼에도 불구하고 Pyodide를 사용함으로써 얻을 수 있는 이점은,
파이썬을 사용하는 애플리케이션을 서버 없이 Client-only 웹 애플리케이션으로 배포할 수 있다는 점입니다.
혹은 서버를 사용하더라도 파이썬을 실행하는 서버의 부하를 줄일 수 있습니다.

즉, Pyodide를 사용했을 때는 다음의 이점을 얻을 수 있습니다.

__Usabillty__

파이썬을 직접 컴퓨터에 설치할 필요가 없습니다. 그냥 브라우저를 켜면 끝입니다.

__Scalability__

Pyodide를 사용하기 위해서는 그냥 정적 파일을 다운로드 받으면 됩니다.
정적 파일을 서빙하는 것은 매우 값싸고, 쉽게 확장될 수 있습니다.
파이썬을 구동하는 서버를 유지하는 것은 비싸고, 확장성이 떨어지는 반면,
Pyodide는 정적 파일을 서빙하는 서버만 존재하면 됩니다.
심지어는 정적 파일은 브라우저에 캐싱되기 때문에 한번 다운로드받으면 다시 다운로드 받을 필요도 없습니다.

__Privacy__

유저가 하는 연산이 서버에 공유될 필요가 없습니다.
모든 파이썬 연산이 클라이언트 단에서 이루어지므로 중요한 데이터를 서버에 전송할 필요가 없습니다.

__Transparency__

모든 연산이 클라이언트 단에서 이루어지므로 유저는 모든 애플리케이션의 동작을 검증할 수 있습니다.

## Pyodide를 활용한 프로젝트

아직 Pyodide는 초창기 단계이지만 다양한 프로젝트에서 활용되고 있습니다.
특히 브라우저로 웹페이지에 접속만 하면
아무런 설치 과정 없이도 바로 파이썬을 사용할 수 있다는 점에서,
프로그래밍 교육 분야에서 Pyodide를 활용하려는 시도가 많이 이루어지고 있습니다.

### Baston

<br />
<div style="text-align: center;">
<img src="https://basthon.fr/theme/assets/img/basthon.svg" width="70%">
</div>

[Baston](https://basthon.fr/)은 프랑스에서 10만명 이상의 중학교 학생들이
프로그래밍을 배우기 위해 매달 사용하는 Pyodide를 이용한 파이썬 Notebook 환경입니다.

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

Pyodide는 현재까지도 매우 활발하게 개발되고 있는 프로젝트이며,
아직까지 풀어야 할 문제도 많습니다.

이어지는 글에서는 Pyodide를 구성하는 기술과 한계점, 앞으로의 로드맵 등을 소개합니다.