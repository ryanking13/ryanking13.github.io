---
date: "2022-01-25T00:00:01+09:00"
title: Pyodide를 소개합니다 - 2
description: Pyodide를 소개합니다 - 2
summary: 브라우저에서 파이썬을 구동하고자 하는 프로젝트인 Pyodide를 소개합니다.
draft: false
categories:
- Pyodide
---

> 이전 글: [Pyodide를 소개합니다 - 1]({{< ref "introducing-pyodide-1.md" >}})

## Pyodide를 구성하는 기술


![pyodide_logo](https://pyodide.org/en/stable/_static/pyodide-logo.png)

이전 글에서 Pyodide와 Pyodide를 이용한 프로젝트를 간략히 설명했습니다.
이어지는 이번 글에서는 Pyodide를 구성하는 기술에 대해서 이야기하고자 합니다.

> **Note**: 이 글의 필자는 Pyodide 프로젝트에 구성원으로 참여하고 있습니다. 따라서 다소 편향된 의견이 있을 수 있습니다.

### WebAssembly / Emscripten

Pyodide를 구성하는 가장 핵심적인 기술은 [WebAssembly](https://webassembly.org/)입니다.
WebAssembly는 바이너리 프로그램을 웹 브라우저에서 실행하기 위한 표준입니다.
기존에 웹 브라우저에서 실행될 수 있는 표준 언어는 JavaScript 밖에 없었는데요.
JavaScript 인터프리터의 성능이 매해 빠르게 발전하고 있기는 하지만,
동적 타입 인터프리터 언어라는 태생적 한계 때문에 성능이 매우 중요한 프로그램을
웹 상에서 실행하는 것에는 어려움이 따랐습니다.

이를 보완하기 위해 제안된 것이 WebAssembly입니다.
WebAssembly는 JavaScript와는 달리 바이너리 파일로 컴파일 되고,
정적 타입을 사용하여 웹 페이지에서 고성능 애플리케이션을 구동할 수 있도록 하는 것을 목표로 합니다.

WebAssembly는 2015년도에 처음 제안되어
2017년부터 주요한 브라우저에서 지원되기 시작했는데요.
상당히 복잡한 역사를 가지고 있어 이 글에서 따로 설명하지는 않겠습니다.
WebAssembly의 역사에 관해서 더 잘 알고 싶으시다면
[Naver D2에서 작성한 블로그 글](https://d2.naver.com/search?keyword=webassembly)을 읽어보시는 것을 추천합니다.


<div style="text-align: center;">
<img src="https://d2.naver.com/content/images/2017/04/helloworld-1570-1571-04.png" width="70%">
<div>
    <span style="color:grey"><small><i>C/C++ 소스 코드에서 컴파일되는 WebAssembly</i></small></span>
    <br/>
    <span style="color:grey"><small><i>(출처: https://d2.naver.com/helloworld/2809766)</i></small></span>
</div>
</div>

WebAssembly를 위한 컴파일러 툴체인인 [Emscripten](https://emscripten.org/)을 이용하면
C / C++로 구현된 코드를 WebAssembly 코드로 바꾸는 것이 가능한데요.
Pyodide는 Python의 레퍼런스 구현체인 CPython이 C로 구현되어 있다는 점에서 착안하여,
Emscripten을 이용해 CPython 인터프리터를 WebAssembly 모듈로 컴파일한 뒤
브라우저 상에서 실행시키는 방식을 사용합니다.
이 때 당연히 브라우저와 데스크톱의 환경 차이로 인해서 지원되지 않는 모듈,
수정이 필요한 코드 등이 존재하고,
Pyodide는 이러한 부분들을 찾아내고 패치하여 사용하고 있습니다.

> __Note:__ 최근 CPython 팀에서 자체적으로 Python 인터프리터를 Emscripten으로 빌드한 Proof-of-Concept를 [공개했는데요](https://twitter.com/sadhlife/status/1485336904342315009).
> 이와 관련해서 Pyodide 팀과 CPython 팀이 장기적인 방향성에 대해서 함께 고민하고 있습니다.

### JavaScript-Python 인터페이스

Python 인터프리터를 WebAssembly로 컴파일했다고 해서 그것만으로
유저가 Python을 편히 사용할 수 있는 것은 아닙니다.
컴파일된 Python 인터프리터를 일종의 JavaScript 오브젝트라고 생각하면,
웹 브라우저 환경에서 다른 JavaScript 오브젝트들과의 상호작용이 가능해야 합니다.
이를 위해서 Pyodide는 자바스크립트 오브젝트와 파이썬 오브젝트 간 상호 변환이 가능한
인터페이스를 구현합니다.

예를 들어, JavaScript Map과 Python dictionary, JavaScript Array와 Python List와 같이
서로 상호 대응이 가능한 클래스간의 변환을 유저가 직접 핸들링 하지 않고도
자연스럽게 변환이 이루어지도록하는 FFI(foreign function interface)를 Pyodide는 제공합니다.
또한 이러한 변환 사이에서 메모리 누수가 발생하지 않도록 하기 위한 조치들을 수행합니다.
아래는 Pyodide가 내부적으로 수행하는 변환 과정을 나타낸 일부입니다.

| Python                  | JavaScript           |
| ----------------------- | -------------------- |
| `str(proxy)`            | `x.toString()`       |
| `del proxy.foo`         | `delete x.foo`       |
| `hasattr(proxy, "foo")` | `"foo" in x`         |
| `proxy.new(...)`        | `new X(...)`         |
| `len(proxy)`            | `x.length or x.size` |
| `proxy[foo]`            | `x.get(foo)`         |

### Python C extension 패키지 지원

마지막으로 Pyodide의 중요한 특징은 C로 구현된 파이썬 패키지들을 지원한다는 점입니다.
Pyodide는 초기에 [데이터 연산과 시각화 라이브러리들을 브라우저 상에서 실행 가능하도록](https://github.com/iodide-project/iodide)
하는 것을 목표로 시작되었는데요.
이 때문에 Pyodide의 핵심적인 목표 중 하나는
데이터 과학에 필요한 다양한 Numpy, Scipy, Pandas, Matplitlib
같은 패키지들을 지원하는 것입니다.
이러한 데이터 과학 패키지들은 성능적인 문제로
많은 부분이 C 또는 C++를 이용해서 구현되어 있는데요.
Pyodide는 이러한 패키지들을 사전에 WebAssembly로 빌드하여
제공함으로써 Pyodide 환경 안에서 이러한 패키지들을 사용할 수 있도록 합니다.

> Pyodide에서 사용할 수 있는 C extension 패키지 목록은 [여기](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)서 볼 수 있습니다.

## Pyodide의 한계점

Pyodide는 현재 브라우저와 데스크톱 환경의 차이로 인한
문제를 극복하기 위해서 많은 노력을 하고 있습니다.

예를 들어, 소켓 통신을 지원하지 않고, 대부분의 연산이 비동기적으로
이루어지는 브라우저 환경의 특성상, `http`, `urllib`, `requests` 와 같은 Python 통신 라이브러리들을
지원하는 데에 어려움이 있고, `threading`, `multiprocessing`과 같은 라이브러리 역시 아직 지원하지 않습니다.
또한 CPython 인터프리터의 용량이 크기 때문에 웹 페이지의 초기 로딩 속도가 느린 문제가 존재하고,
데스크톱 환경 대비 떨어지는 성능 역시 극복해야 하는 요소입니다.

Pyodide는 이러한 문제들을 풀어내기 위해 지속적으로 노력하고 있습니다.
혹시 이 글을 읽고 관심이 생기셨다면 [Pyodide에 기여해보시는 것](https://github.com/pyodide/pyodide/issues)은 어떨까요?
