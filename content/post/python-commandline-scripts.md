---
date: "2021-05-30T00:00:01+09:00"
title: 알아두면 쓸데없는 파이썬 내장 커맨드라인 스크립트
description: 알아두면 쓸데없는 파이썬 내장 커맨드라인 스크립트
summary: 파이썬 기본 라이브러리에 내장된 스크립트를 소개합니다.
draft: true
categories:
- Python
---

## 들어가며

파이썬의 특징 중 하나는 굉장히 방대한 기본 라이브러리를 가지고 있다는 점입니다.
파이썬은 커뮤니티 기반 언어라는 특징에 따라 누구나 PEP(Python Enhancement Proposals)를 제안할 수 있고,
다양한 써드파티 라이브러리들을 PEP를 통해서 기본 라이브러리로 받아들이고 있죠.

> 예시) [PEP 428: pathlib](https://www.python.org/dev/peps/pep-0428/), [PEP-506: secrets](https://www.python.org/dev/peps/pep-0506/)

그러다보니 파이썬은 추가 라이브러리를 전혀 설치하지 않고도 꽤나 다양한 작업을 손쉽게 할 수 있는데,
이 글에서는 그 중에서도 코딩 없이 간단한 리눅스 커맨드를 사용하듯이 쓸 수 있는 파이썬 커맨드라인 스크립트들을 소개하고자 합니다.

> **DISCLAIMER**: 이 글에서 소개하는 도구들은 대부분 파이썬 공식 문서에 적혀있지 않고, 언제든지 deprecated 될 수 있습니다.

### 이 글을 읽으면 어디다 써먹을 수 있나요?

1. 파이썬만 설치되어 있다면 OS와 무관하게 공통적으로 쓸 수 있는 커맨드를 알게됩니다.
1. 주변 사람들한테 아는 척 할 수 있습니다.
1. ~~재밌습니다.~~

## 파이썬 커맨드라인 스크립트 동작 원리

파이썬 모듈은 일반적으로 `import <module>`을 통해서 임포트하여 사용되지만,
`python -m <module>`과 같이 `-m` 옵션을 통해서 특정 모듈을 스크립트처럼 실행시키는 것이 가능합니다.

이 때, 해당 모듈이 임포트가 아닌 실행되었을 때만 특정한 기능을 하게끔 코드가 구성되어 있는 경우가 있는데요.

```python
# 이 부분은 import 되었을 때는 실행되지 않습니다.
if __name__ == "__main__":
    print("I'm not printed if this module is imported!")
```

보통은 모듈을 간단히 테스트하기 위해 이런 코드를 삽입합니다.

파이썬 기본 모듈에도 종종 테스트 목적 등으로 실행할 수 있는 코드가 삽입되어 있는 경우가 있는데요.
이 글에서는 그 중 몇가지를 소개합니다.

## 알아두면 쓸모있는 도구

**웹 서버 실행**

- `python -m http.server`

현재 폴더를 웹으로 서빙합니다. 간단하게 웹페이지를 실행하거나 작은 파일을 주고받을 때 사용할 수 있습니다.

`-p` 옵션으로 포트를 지정하거나, `-d` 옵션으로 디렉토리를 지정할 수 있습니다.

**JSON 파일 포맷팅**

- `python -m json.tool <json_file>`

JSON 파일을 검증하고 포맷팅해서 출력합니다.

```sh
$ echo '{"a": 1}' | python -m json.tool
{
    "a": 1
}
```

## 비상시에 쓸 수 있는 도구

대부분의 경우 더 나은 대체재가 있으나,
비상시(?) 에 쓸 수 있을 지도 모르는 도구들입니다.

보통 Linux에서는 잘 알려진 내장 도구들로 대체가 가능하나,
Windows에서는 대체 도구가 없거나 잘 알려지지 않은 경우입니다.

**인코딩/디코딩**

- `python -m base64`
  - 대체 도구 (Linux): `base64`

BASE64 인코딩 디코딩을 수행합니다.

```sh
$ echo dGVzdAo= | python -m base64 -d
test
```

**파일 분석**

- `python -m imghdr`
  - 대체 도구 (Linux): `file`

이미지 파일의 헤더를 보고 파일 타입을 유추합니다.

```sh
$ python -m imghdr image.png
image.png: png
```

- `python -m sndhdr`
  - 대체 도구 (Linux): `file`

음성 파일 헤더를 보고 파일 타입을 유추합니다.

```sh
$ python -m sndhdr sound.mp3
...
```

**압축**

- `python -m tarfile`
  - 대체 도구 (Linux): `tar`

TAR 파일을 압축, 압축 해체합니다.

```sh
$ python -m tarfile a.tar
...(extract)...
```

- `python -m gzip`
  - 대체 도구 (Linux): `gunzip`

GUNZIP 파일을 압축, 압축 해제합니다.

```sh
$ python -m gzip -d a.tar.gz
...(decompress)...
```

- `python -m zipfile`
  - 대체 도구 (Linux): `zip, unzip`

ZIP 파일을 압축, 압축 해제합니다.

```sh
$ python -m zipfile -e a.zip dir
...(extracted to dir)...
```

- `python -m zipapp`

**시스템**

- `python -m locale`
  - 대체 도구 (Linux): `locale`

현재 시스템 로캐일 정보를 출력합니다.

- `python -m platform`
  - 대체 도구 (Linux): `uname`

현재 실행중인 OS/플랫폼 정보를 출력합니다.

## 파이썬 한정 도구

파이썬 내부 디버깅, 테스트 등에 쓸 수 있는 도구들입니다.

- `python -m inspect`

특정 모듈의 내용물을 보고싶거나, 모듈의 위치를 확인할 수 있습니다.

```sh
$ python -m inspect json
$ python -m inspect -d json
...
```

- `python -m py_compile`

파이썬 파일을 컴파일한 pyc 파일을 생성합니다.

```
$ python -m py_compile a.py && ls
a.py a.pyc
```

- `python -m sysconfig`

파이썬을 빌드할 때 사용한 환경 변수 등을 볼 수 있습니다.

```
```

- `python -m timeit`

특정 파이썬 코드가 실행되는 시간을 측정합니다.

```
```

- `python -m venv`

가상 환경을 생성합니다. 기존의 `virtualenv` 가 했던 기능을 대체합니다.

```
```

- `python -m pydoc`

레퍼런스 문서를 생성합니다.

- `python -m profile`

파이썬 코드를 프로파일링합니다.

```

```

- `python -m  pyclbr`

파이썬 모듈을 브라우징합니다.

```
```

- `python -m webbrowser`

웹브라우저를 제어합니다.

```
```

- `python -m trace`

파이썬 호출 스택을 트레이싱합니다.

```
```

### References

- https://github.com/python/cpython/tree/main/Lib
