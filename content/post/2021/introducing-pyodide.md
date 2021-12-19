---
date: "2021-12-19T00:00:01+09:00"
title: Pyodide를 소개합니다
description: Pyodide를 소개합니다
summary: 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.
draft: true
categories:
- Pyodide
---

이 글에서는 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.

> **Note**: 이 글의 필자는 Pyodide 프로젝트에 구성원으로 참여하고 있습니다. 따라서 다소 편향된 의견이 있을 수 있습니다.

## Pyodide란?

[Pyodide](https://pyodide.org)는 브라우저 상에서 파이썬을 구동하는 프로젝트로,
2019년 모질라의 소규모 프로젝트로 시작되었습니다. 
정확하게는 Pyodide는 브라우저 상에서 데이터를 분석하고 시각화하고자 하는
프로젝트인 [iodide](https://alpha.iodide.io/)의 일부였는데요.
2021년도에 모질라에서 iodide 프로젝트를 중단하면서, Pyodide만 커뮤니티 기반의 오픈소스로 남게 되었습니다.

## Pyodide 사용해보기

Pyodide를 가장 쉽게 사용해 볼 수 있는 방법은 공식적으로 제공하는 [REPL]()을 이용하는 것입니다.
마치 로컬 환경에서 파이썬을 실행한 것과 같은 느낌을 받으실 수 있는데요. 실제로는 모든 과정이 브라우저 상에서 이루어지고 있습니다.

```

```

아래의 링크는 파이썬 포매터인 Black을 Pyodide를 이용하여 브라우저에서 구현한 서비스입니다. 코드는 [이곳]()에서 보실 수 있습니다.

## Pyodide의 원리

Pyodide에 흥미를 느끼셨나요? 이번 절에서는 Pyodide의 작동 원리를 소개합니다.

### WebAssembly

Pyodide의 작동 원리를 이해하기 위해서는 먼저 WebAssembly에 대해서 짚고 넘어가야합니다.
WebAssembly는 ~. (상세한 사항은 [이곳]을 참고하세요.)

Python의 레퍼런스 구현체인 CPython은 C로 구현되어 있는데요. Pyodide는 이를 Webassembly로 포팅하는 방법을 사용합니다.

WebAssembly로 포팅된 CPython 인터프리터에 파이썬 코드를 집어넣어서 실행하는 방식입니다.

> Note: 최근 CPython 팀에서 자체적으로 WebAssembly ~ 지원하려는 시도가 이루어지고 있습니다.

### js-python interface

파이썬 인터프리터를 ~. 그것만으로는 브라우저 상에서 충분히 유연하게 상호작용할 수 없습니다.
나머지 요소들이 전부 자바스크립트로 구성되어 있기 때문인데요.
이를 위해서 Pyodide는 자바스크립트 오브젝트와 파이썬 오브젝트 간 상호 변환이 가능한 인터페이스를 구현합니다.

```
```

### C Python packages

또 한가지 Pyodide의 중요한 특징은 C로 구현된 파이썬 패키지들을 지원한다는 점입니다.
앞서 Pyodide가 데이터 연산과 시각화~ 시작되었다고 말씀드렸는데요.
이 때문에 Pyodide의 핵심적인 목표 중 하나는 데이터 과학에 필요한 다양한 Numpy, Scipy, Pandas 같은 패키지들을 지원하는 것입니다.
이러한 데이터 과학 패키지들은 성능적인 문제로 많은 부분이 C또는 C++를 이용해서 구현되어 있는데요.
Pyodide는 이러한 패키지들을 사전에 WebAssembly로 빌드하여 제공함으로써
Pyodide 환경 안에서 이러한 패키지들을 사용할 수 있도록합니다.

## Pyodide를 활용한 프로젝트

아직 Pyodide는 초창기 단계이지만 다양한 프로젝트에서 활용되고 있습니다.
특히 브라우저로 특정 웹페이지에 접속만 하면 아무런 설치 없이도 바로 파이썬을 사용할 수 있다는 점에서,
파이썬을 가르치고자 하는 교육 분야에서 Pyodide를 활용하려는 시도가 많이 이루어지고 있습니다.

대표적으로, [Baston]은 프랑스 ~ 10만명의 학생들이 사용.

starboard notebook, ~.

Jupyter Notebook을 개발하는 Jupyter 재단에서도 Pyodide를 활용하여 브라우저에서 Jupyter Notebook을 구동하는
Jupyterllite 프로젝트가 활발하게 개발되고 있으며,

VSCode에서 Pyodide를 확장 프로그램으로 이용하고자 하는 ~.

## Pyodide의 미래

Pyodide는 현재까지도 매우 활발하게 개발되고 있는 프로젝트입니다.
아직까지 풀어야 할 문제도 많습니다.

Pyodide에 관심이 생기셨다면 언제든지 contribution을 환영.

### Other approches

파이썬을 브라우저상에서 구동하기 위한 방법으로는 ~ 만 있는 것은 아닙니다.

최근까지 활발하게 개발되고 있는 다른 방법으로는 파이썬 코드를 자바스크립트로 트랜스컴파일하는 [Brython]이 있으며,

그 외에도 과거, 자바스크립트로 구현된 파이썬 인터프리터 구현체인 [bra~], PyPy 인터프리터를 js로 트랜스컴파일한 [pypy.js] 등이 있었습니다.

### References

...