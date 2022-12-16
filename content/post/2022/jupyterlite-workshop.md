---
date: "2022-12-10T00:01:00"
title: Jupyter Community Workshop 2022 참가 후기
categories:
- Pyodide
description: Jupyter Community Workshop 2022 참가 후기
summary: " "
draft: false
---

<div style="text-align: center;">
<img src="https://miro.medium.com/max/640/1*Zayr-b0FjuEZGr-plrEl3Q.webp" width="70%">
</div>

2022년 12월 7일부터 9일까지 3일간 프랑스 파리에서 열린
[Jupyter Community Workshop: Jupyterlite](https://blog.jupyter.org/community-workshop-jupyterlite-e992c61f5d7f) 에 다녀왔습니다.

Jupyter Community Workshop은 Jupyter 커뮤니티의 다양한 분야의 사람들이 모여서
특정 주제에 대해 토론하고 협업하는 행사입니다. 이번에 열린 Jupyterlite 워크샵은
"브라우저 위의 파이썬"이라는 주제로, [Pyodide](https://pyodide.org), [Jupyterlite](https://jupyterlite.readthedocs.io),
[PyScript](https://pyscript.net) 등 WebAssembly를 기반으로 파이썬을 브라우저에서 실행하는 다양한 프로젝트의
사람들이 모여 각자의 상황과 경험을 공유하고,
앞으로 이를 어떻게 더 발전시킬 수 있을지,
또한 서로 협력이 가능한 부분은 무엇인지
이야기하는 자리였습니다.

저는 Pyodide 코어 개발자로서 이번 워크샵에 초청을 받아 참가했는데요.
이 글에서는 워크샵에서 논의된 내용을 큰 틀에서 정리하고,
개인적인 감상을 얘기해 보려고 합니다.

<div style="text-align: center;">
<img src="/assets/post_images/jupyterlite/members.jfif" width="70%">
<div>
    <span style="color:grey"><small><i>워크샵 참가 인원들의 모습</i></small></span>
</div>
</div>

## 소프트웨어 교육과 브라우저 위의 파이썬

얼마 전 CPython에서
[WebAssembly 플랫폼
지원을 공식화](https://discuss.python.org/t/wasm32-emscripten-and-wasm32-wasi-have-been-promoted-to-tier-3-platforms-for-cpython/17590)
했습니다. 이는 기존에는 브라우저 상에서 파이썬을 실행하는 것이 "흥미로운 실험"이었다면,
이제는 장기적으로 지원되는 플랫폼이 될 것이라는 것을 의미합니다.
과거 [Pyodide를 소개하는 글]({{< ref "introducing-pyodide-1.md" >}}) 에서 언급했듯이,
클라이언트 환경에서 파이썬을 설치 없이 실행할 수 있다는 것은 다양한 효용을 가집니다.
그러나 이미 로컬 환경 또는 서버에서 파이썬 개발을 하고 있는 사람들에게는
많은 경우 굳이 브라우저 위에서 파이썬을 실행할 필요가 없습니다.
 
특히 브라우저 위에서 파이썬을 실행하는 것은 적어도 아직까지는 성능 측면에서 많은 제약이 있고 [^performance],
따라서 성능이 중요한 데이터 과학 분야에서 브라우저 위의 파이썬이 정말로 유용한가에 대해서
의문도 합리적입니다.

[^performance]: 이 글을 작성하는 시점 기준으로 브라우저에서 실행되는 파이썬은 로컬 환경에 비해
약 2-3배 정도 느립니다. 또한 SIMD나 GPU를 통해 병렬 프로그래밍을 하는 데이터 과학 분야에서는 수십 배 이상의
성능 차이가 있을 수 있습니다.

그런 측면에서 현재 브라우저 위의 파이썬이 가장 널리 활용되고 있는 분야는
성능보다는 접근성과 확장성에 초점을 둔 소프트웨어 교육 분야입니다.

브라우저 위의 파이썬은 복잡한 설치 과정을 최소화할 수 있고, 브라우저만 설치되어 있다면
구형 컴퓨터, 심지어는 휴대폰으로도 얼마든지 파이썬을 실행할 수 있습니다.
한편, 교육 서비스 제공자 측면에서는 복잡한 서버 인프라를 구축하지 않고도
파이썬 교육을 할 수 있기 때문에 비용을 크게 절감할 수 있습니다.
또한 인터넷 연결이 느리거나 되어있지 않은 국가를 대상으로도
손쉽게 교육을 제공할 수 있습니다.

이번 워크샵에서 Jupyterlite를 만드는 QuantStack에서는
현재 인터넷 인프라가 원활하지 않은 아프리카 세네갈의
학생들에게 Jupyterlite를 통해 파이썬 교육 환경을 제공하는 것을 계획 중이라고 밝혔고,
이와 관련해서 처음 브라우저에서 파이썬 실행 환경을 다운로드받는 과정의 문제를 최소화하기 위해
아주 [작은 용량의 USB에 실행 환경을 모두 담아서 배포](https://discourse.jupyter.org/t/idea-jupyterlite-in-a-usb-stick/17177)
하는 것에 대한 논의 또한 있었습니다.

<div style="text-align: center;">
<img src="https://basthon.fr/theme/assets/img/basthon.svg" width="70%">
<div>
    <span style="color:grey"><small><i>Basthon logo</i></small></span>
</div>
</div>

한편, 프랑스의 작은 스타트업인 [Capytale](https://capytale2.ac-paris.fr/web/c-auth/list)에서
개발하고 있는 [Basthon](https://basthon.fr/) 프로젝트는 이미
코딩 교육이 필수로 채택된 프랑스의 5000 개 이상의 고등학교에서 솔루션으로 사용되고 있다고 밝혔으며,
현재는 매주 20만 명 이상의 사용자가 8만 개 이상의 코드를 생성하고 있다는 사실을 공유했습니다.
개인적으로 가장 놀라웠던 사실은 Basthon은 단 한 대의 서버만으로 이러한 환경을 제공하고 있다는 점이었습니다.

## 브라우저 위의 파이썬의 한계점과 해결책

이번 워크샵에서는 브라우저 위의 파이썬의 한계점과
이를 개선하기 위한 해결책에 대해서도 논의가 진행되었습니다.
기본적으로 브라우저 위에서 실행되는 파이썬은 당연하게도
브라우저의 제약에서 벗어나지 못합니다.
대표적으로 브라우저는 UI가 멈추거나 느려지는 것을 방지하기 위해,
메인 스레드에서는 동기적으로 코드를 실행하는 것에 큰 제약을 두고 있습니다.

이는 동기적인 코드 blocking을 요구하는 파이썬의 많은 기능들을
있는 그대로 사용하기 어렵다는 것을 의미합니다.

이와 관련된 대표적인 문제로는 사용자의 입력을 처리하는 것과
네트워크 요청을 처리하는 것이 있습니다. 간단히 예를 들면,
브라우저 메인 스레드에서는 `input()`을 이용해 동기적으로 사용자의 입력을 처리하는 것이 불가능합니다.
또한 socket 기반의 모든 동기적 통신 라이브러리인 `urllib`, `requests` 등을 사용할 수 없습니다.

이를 해결하기 위한 방법으로 다음과 같은 방법들에 대한 논의가 있었습니다.

1) Web Worker에 대한 지원 강화

동기적인 코드를 실행하는 것을 크게 제한하는 브라우저의 문제는 모두 메인 스레드에서만
해당하는 것으로, Web Worker를 이용하면 대부분의 문제가 해결됩니다.

다만, Web Worker에서는 웹 페이지 DOM에 대한 접근이 허용되지 않고, 따라서 직접적으로
페이지 UI를 변경하는 것이 불가능합니다. Pyodide와 PyScript에서는
파이썬 내에서 DOM에 접근하여 페이지 UI를 변경하는 기능이 꽤 널리 사용되고 있기 때문에,
이를 해결하기 위한 논의들이 있었습니다.

Web Worker에서 DOM에 접근할 수 있도록 하는 [via.js](https://ashleyscirra.github.io/via.js/)와
같은 도구를 살펴보았고, 비동기적인 브라우저 메인 스레드와 Web Worker 사이의 통신을
동기화하기 위한 Shared Array Buffer, Atomics 같은 기술에 대해서도 논의가 있었습니다.

2) JS promise integration, stack switching

한편, Web Worker를 사용하지 않고 메인 스레드에서 문제를 해결하고자 하는 아이디어도 있었습니다.
아직 Chromium V8 엔진 베타 버전에서만 실험적으로 지원되고 있는
[JS promise integration](https://github.com/WebAssembly/js-promise-integration/blob/main/proposals/js-promise-integration/Overview.md)
와 같은 기능, 또는 [WebAssembly Stack Switching Proposal](https://github.com/WebAssembly/stack-switching)
등에 대한 고려가 있었습니다. 다만, 아직 표준화되지 않았거나
브라우저 벤더들의 지원이 부족한 상황이기 때문에 당장 사용하기에는 어려움이 있습니다.

## CPython에서의 WASM의 미래

CPython에서 WebAssembly 플랫폼은 아직 실험적으로만 지원되고 있고,
관련하여 CPython 코어 개발자 중에서도 실질적으로는 두 명만이 개발에 참여하고 있습니다.

따라서 공식 빌드에서는 아직 지원되지 않는 라이브러리들이 많고,
Wheel 구현과 배포 등이 표준화되지 않아서 아직 에코시스템이 파편화된 상태입니다.
따라서 이를 CPython에서 WebAssembly 플랫폼 지원을 강화하고
패키징, 배포 등의 문제를 표준화하기 위해 어떠한 노력이 필요할지에 대한 논의가 있었습니다.

> 관련 논의: https://discuss.python.org/t/make-wasm-a-1st-class-platform-in-the-python-ecosystem/21798

## 개인적 후기

어쩌다 보니 좋은 기회를 얻어 오픈 소스 개발자 자격으로
파리에 초청 받아서 이번 워크샵에 참여를 하게 되었습니다.
자신이 만들거나 크게 기여한 오픈 소스가 다른 사람들에게 널리 사용되고,
또 자신과 비슷한 고민을 하는 다른 개발자들과 만나서
열정적으로 논의하고 교류할 수 있다는 점은
사실 굉장히 드물고도 희귀한 일입니다.

사실 업무가 아닌 개인적인 시간을 투자해서
오픈 소스 활동을 한다는 것은 굉장히 힘든 일입니다.
그렇기에 이번 워크샵은 오픈 소스 커뮤니티에 참가했기에 얻을 수 있었던
색다르고 가치 있는 경험이었고, 앞으로도 계속해서 오픈 소스 활동을
계속할 수 있는 작은 동기 부여가 될 것 같습니다.
