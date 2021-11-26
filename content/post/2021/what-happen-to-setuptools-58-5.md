---
date: "2021-11-04T00:00:01+09:00"
title: setuptools 58.5에 무슨 일이 있었나?
description: setuptools 58.5에 무슨 일이 있었나?
summary: 일시적으로 수많은 파이썬 패키지들의 오류를 야기한 setuptools 58.5 버전 사태에 대해 설명합니다.
draft: true
categories:
- Python
---

__TL; DR__

> setuptools는 58.5 ~

## 들어가며

2021년 11월 3일부터 5일까지, 일시적으로 수많은 파이썬 패키지들이 설치 시에 오류가 발생하는 문제가 발생했습니다.

구체적으로는 파이썬의 패키징 라이브러리인 `setuptools`에서 다음과 같은 에러가 나면서 설치 오류가 나는 증상이었죠.

```sh
# <전략>
  File "/tmp/testenv/lib/python3.9/site-packages/setuptools/command/egg_info.py", line 621, in _safe_data_files
    return build_py.get_data_files_without_manifest()
  File "/usr/lib/python3.9/distutils/cmd.py", line 103, in __getattr__
    raise AttributeError(attr)
AttributeError: get_data_files_without_manifest
```

이 문제를 처음 리포팅한 [setuptools의 이슈](https://github.com/pypa/setuptools/issues/2849)에는 수많은 프로젝트들이 같은 증상을 호소했습니다.

해당 이슈를 레퍼런스한, 많이 사용되는 프로젝트 몇 가지만 추려봐도,

- [numpy](https://github.com/numpy/numpy/pull/20299)
- [scipy](https://github.com/skirpichev/scipy/commit/721cf5431c1f1f1a3b9c632eba54905f95812462)
- [scikit-learn](https://github.com/jjerphan/scikit-learn/commit/346de7456b801c585ab03867852017e4fbb8e0bb)
- [scikit-image](https://github.com/scikit-image/scikit-image/pull/6007)
- [mercurial](https://foss.heptapod.net/mercurial/mercurial-devel/-/jobs/260776#L53)

## 어디서 문제가 발생했나

문제가 발생한 부분은 setuptools의 58.5 버전 업데이트와 함께 추가된 ~.

~ 한 상황에서 distutils로 ~ 처리 되면서 문제가 발생

모든 사람들이 사용하는 ~. 특히 CI 등에서 처음에 setuptools를 설치하고서 시작하는 경우가 많다보니~
최신 버전에서 문제가 발생하니 모든 데서 터짐

> 엥 setuptools는 빌트인 아니야? 하시는 분은 [파이썬 패키징의 ~] 글 참조 (self promotion ^^)

## 왜 이런 변화가 발생했나

문제 자체는 단순히 분기 처리를 실수해서 발생,
실수한 부분이 모든 파이썬 패키지를 빌드하는 ~ 였기에 다른 패키지들이 터진 것.

그래서 이것 자체는 실수로 인한 일종의 해프닝인데,
왜 문제가 되는 부분이 바뀌었는지를 살펴보면 조금 흥미로운 결론을 낼 수 있다.

파이썬 빌트인 패키징 도구인 distutils는 여러 가지 한계점으로 일찌감치 setuptools에 의해 대체됨.
distutils는 파이썬 최신 버전인 3.10에서는 deprecated되었고, 구 버전에서도 직접 사용을 권장하지 않는 상태.

(뇌피셜, 근거 필요) setuptools는 자체에 distutils를 내장하고 있고, distutils의 deprecated 상황에 맞추어 점점 덜어내는 상태.
그래서 ~

문제가 발생한 ~ 구문은 distutils 빌드 클래스에는 존재하지 않으나 setuptools 빌드 클래스에는 존재하는 메소드.
이는 다시 말하면 distutils를 빌드 과정에서 사용하지 않았다면 발생하지 않을 문제.

## 해프닝에서 얻어진 결론

그렇지만 수많은 패키지들, 그 중에서도 파이썬의 가장 크고 널리 쓰이는 패키지들에서 이러한 문제들이 발생했다는 것은,
여전히 distutils가 이들 패키지들의 빌드 과정 내부에 침투해 있다는 것을 의미.
distutils는 곧 없어질 것이므로, 해당 패키지들이 빌드 과정에서 distutils를 잘 덜어내지 않으면 이후의 릴리즈에서 문제가 발생할 수 있음.

이번 사태는 distutils가 deprecated된 지금까지도, 의식적이지는 않더라도, 널리 사용되고 있으며,
이를 사용하지 않아야 한다는 것을 더 널리 알려야만 한다는 것을 인식시켜주는 계기가 됨.



__References__

- https://github.com/pypa/setuptools/issues/2849

