---
date: "2021-06-10T00:00:01+09:00"
title: 알아두면 쓸데없는 파이썬 내장 커맨드라인 스크립트
description: 알아두면 쓸데없는 파이썬 내장 커맨드라인 스크립트
summary: 파이썬 기본 모듈에 내장된 스크립트를 소개합니다.
draft: false
categories:
- Python
---

파이썬의 대표적인 특징 중 하나는 기본 모듈(라이브러리)이 아주 방대하다는 점입니다.

커뮤니티 기반 언어인 파이썬은 누구나 PEP(Python Enhancement Proposal)를 통해 새로운 기능을 파이썬에 제안할 수 있고,
이 덕분에 파이썬은 다양한 써드파티 모듈을 기본 모듈로 받아들이게 되었습니다.

> 써드파티 모듈이 기본 모듈에 포함된 대표적인 예로 [PEP 428: pathlib](https://www.python.org/dev/peps/pep-0428/), [PEP-506: secrets](https://www.python.org/dev/peps/pep-0506/)가 있습니다.

그렇다보니 파이썬은 추가 모듈을 전혀 설치하지 않고,
기본 모듈만 가지고도 꽤나 다양한 작업을 손쉽게 할 수 있는데요.

이 글에서는 파이썬 기본 모듈을 활용하여,
코딩을 하지 않고 간단한 리눅스 커맨드를 사용하듯이 쓸 수 있는 파이썬 커맨드라인 스크립트들을 몇 가지 소개하고자 합니다.

> **DISCLAIMER**: 이 글에서 소개하는 도구들은 대부분 파이썬 공식 문서에 적혀있지 않고, 언제든지 deprecated 될 수 있습니다.

## 🤔 이 글을 읽으면 어디다 써먹을 수 있나요?

1. 파이썬만 설치되어 있다면 OS를 가리지 않고 어디서나 쓸 수 있는 커맨드를 배울 수 있습니다.
2. ~~주변 사람들한테 아는 척 할 수 있습니다.~~
3. ~~재밌습니다.~~

## 파이썬 커맨드라인 스크립트 동작 원리

파이썬 모듈은 `import <module>` 구문을 통해서 임포트하여 사용되는 것이 일반적이지만,
`-m` 옵션을 통해서 `python -m <module>`과 같이 특정 모듈을 스크립트처럼 실행시키는 것이 가능합니다.

대부분의 모듈은 실행시켜도 아무런 기능을 하지 않지만,
일부 모듈은 임포트되지 않고 실행되었을 때만 특정한 기능을 하게끔 코드가 구성되어 있는 경우가 있습니다.

```python
# 아래 부분은 모듈이 import 되었을 때는 실행되지 않습니다.
if __name__ == "__main__":
    print("I'm not printed if this module is imported!")
```

보통은 모듈을 간단히 테스트하기 위해 이런 코드를 삽입하곤 합니다.
이 글에서 소개하는 도구들은 모두 이처럼 `-m` 옵션을 이용해 모듈을 실행하는 식으로 사용하는 도구들입니다.

## ⚒️ 알아두면 쓸모있는 도구

### 웹 서버 실행

- `python -m http.server <port>`

현재 폴더를 웹으로 서빙합니다. 간단하게 웹페이지를 실행하거나 작은 파일을 주고받을 때 사용할 수 있습니다.
`-d` 옵션으로 디렉토리를 지정할 수 있습니다.

```sh
$ python -m http.server 8080
```

### JSON 포맷팅

- `python -m json.tool <json_file>`

JSON 파일을 검증하고 포맷팅합니다.

```sh
$ echo '{"a": 1}' | python -m json.tool
{
    "a": 1
}
```

## 🧯 비상시에 쓸 수 있는 도구

> 대부분의 상황에서는 대체 도구가 있어 쓸모 없으나,
> 비상시(?) 에 쓸 수 있을 지도 모르는 도구들입니다.

> 예시) Linux에서는 잘 알려진 내장 도구들로 대체가 가능하나,
> Windows에서는 대체 도구가 없거나 잘 알려지지 않은 경우

### 인코딩 / 디코딩

- `python -m base64`

BASE64 인코딩 / 디코딩을 수행합니다. Linux에서는 `base64` 커맨드로 대체 가능합니다.

```sh
$ echo dGVzdAo= | python -m base64 -d
test
```

### 파일 타입 분석

- `python -m imghdr`

이미지 파일의 헤더를 보고 파일 타입을 유추합니다. Linux에서는 `file` 커맨드로 대체 가능합니다.

```sh
$ python -m imghdr image.png
image.png: png
```

<br/>

- `python -m sndhdr`

음성 파일 헤더를 보고 파일 타입을 유추합니다. Linux에서는 `file` 커맨드로 대체 가능합니다.

```sh
$ python -m sndhdr sound.wav
soun.wav: SndHeaders(filetype='wav', ...)
```
### 압축

- `python -m tarfile`

TAR 파일을 압축, 압축 해체합니다. Linux에서는 `tar` 커맨드로 대체 가능합니다.

```sh
$ python -m tarfile a.tar
...(extract)...
```

<br/>

- `python -m gzip`

GZIP 파일을 압축, 압축 해제합니다. Linux에서는 `gzip` 커맨드로 대체 가능합니다.

```sh
$ python -m gzip -d a.tar.gz
...(decompress)...
```

<br/>

- `python -m zipfile`

ZIP 파일을 압축, 압축 해제합니다. Linux에서는 `zip, unzip` 커맨드로 대체 가능합니다.

```sh
$ python -m zipfile -e a.zip dir
...(extracted to dir)...
```

### 시스템 정보

- `python -m locale`

현재 시스템 로캐일 정보를 출력합니다. Linux에서는 `locale` 커맨드로 대체 가능합니다.

<br/>

- `python -m platform`

현재 실행중인 OS/플랫폼 정보를 출력합니다. Linux에서는 `uname` 커맨드로 대체 가능합니다.

## 🐍 파이썬 한정 도구

> 파이썬 디버깅, 테스트 등에 쓸 수 있는 도구들입니다.

- `python -m inspect`

특정 파이썬 모듈의 내용물을 보고싶거나, 모듈의 위치를 확인할 수 있습니다.

```sh
# os 모듈 코드를 볼 수 있습니다
$ python -m inspect os

# os 모듈의 위치를 볼 수 있습니다.
$ python -m inspect -d json
```

<br/>

- `python -m py_compile`

파이썬 파일을 컴파일한 pyc 파일을 생성합니다.

```
$ python -m py_compile a.py && ls
a.py a.pyc
```

<br/>

- `python -m sysconfig`

파이썬을 빌드할 때 사용한 환경 변수 등을 볼 수 있습니다.

```
$ python -m sysconfig
Platform: "win-amd64"
Python version: "3.8"
...
```

<br/>

- `python -m timeit`

특정 파이썬 코드가 실행되는 시간을 측정합니다.

Jupyter Notebook을 써보신 분이라면 익숙한 커맨드실 것 같네요.

```
$ python -m timeit "str(1)"
2000000 loops, best of 5: 107 nsec per loop
```

<br/>

- `python -m venv <virtual environment path>`

가상 환경을 생성합니다. 기존의 `virtualenv` 가 했던 기능을 대체합니다.

```
$ python -m venv venv && ls venv
Include  Lib  Scripts  pyvenv.cfg
```

<br/>

- `python -m pydoc`

파이썬 레퍼런스 문서를 생성합니다.

```sh
# 특정 모듈에 대한 레퍼런스를 콘솔에서 보거나
$ python -m pydoc os
Help on module os:

NAME
    os - OS routines for NT or Posix depending on what system we're on.
...
# 전체 레퍼런스 문서를 웹 페이지에서 보는 것도 가능합니다.
$ python -m pydoc -b
```

<br/>

- `python -m profile`

파이썬 코드를 프로파일링합니다. 각 함수가 몇번이나 실행되었고, 얼마나 시간이 걸렸는지를 측정할 수 있습니다.

```sh
$ python -m profile test.py
         39721 function calls (38908 primitive calls) in 0.141 seconds

   Ordered by: standard name

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
  215/214    0.000    0.000    0.047    0.000 :0(__build_class__)
       84    0.000    0.000    0.000    0.000 :0(__contains__)
        1    0.000    0.000    0.000    0.000 :0(__enter__)
...
```

<br/>

- `python -m trace`

파이썬 호출 스택을 트레이싱합니다. 코드 실행 경로를 파악할 수 있습니다.

```
$ python -m trace --trace test.py
 --- modulename: test, funcname: <module>
test.py(1): import asyncio
 --- modulename: _bootstrap, funcname: _find_and_load
<frozen importlib._bootstrap>(988):  --- modulename: _bootstrap, funcname: __init__
...
```

### 마무리

이 글에서 소개하는 스크립트들의 기능은 당연히 해당 모듈을 직접 임포트해서 쉽게 구현할 수 있습니다.
그 편이 더 복잡한 로직을 구현하기도 수월할 테구요. 😂

반쯤은 재미로, 반쯤은 특수한 상황에서 한번쯤 써먹어볼 법한 기술(?)로 기억 한 구석에 남겨두시면 좋을 것 같습니다.

### References

- https://github.com/python/cpython/tree/main/Lib
