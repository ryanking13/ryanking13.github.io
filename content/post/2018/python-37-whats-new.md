---
date: "2018-07-12T00:00:00Z"
categories:
- Python
title: 파이썬 3.7의 새로운 기능들
summary: " "
draft: true
---
<div style="width: 100%; display: flex; justify-content: center;">
<blockquote class="twitter-tweet" data-lang="ko"><p lang="en" dir="ltr">Python 3.7.0 is released! Bring out the celebratory libations. Thanks <a href="https://twitter.com/baybryj?ref_src=twsrc%5Etfw">@baybryj</a> and a cast of thousands on python-dev and GitHub. <a href="https://t.co/wEG4vO76Rd">https://t.co/wEG4vO76Rd</a></p>&mdash; Guido van Rossum (@gvanrossum) <a href="https://twitter.com/gvanrossum/status/1012144089452535809?ref_src=twsrc%5Etfw">2018년 6월 28일</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>


파이썬 3.7이 2018년 6월 27일에 [정식 릴리즈](https://www.python.org/downloads/release/python-370/) 되었습니다.
이 글은 그 중 몇 가지 흥미로운 변경사항을 소개합니다.
전체 changelog를 보려면 [이곳](https://docs.python.org/3.7/whatsnew/3.7.html)을 참고해주세요.

순서는 주관적인 흥미도 순입니다 :)

## typing의 발전

> PEP 560: Core support for typing module and generic types

> PEP 563: Postponed Evaluation of Annotations

파이썬에서 정적 타입 검사를 하려는 노력은 꽤나 오래 전부터 있었습니다.
파이썬 3.0의 등장과 함께 `Type Annotation` 문법이 탄생해 파이썬 코드 상에 타입을 명시할 수 있게 되었지만,
당시에는 실질적인 기능은 없었습니다. PyCharm과 같은 IDE에서는 해당 문법을 파싱해서 정적 타입 검사를 해주었지만,
그러한 IDE를 사용하지 않는 유저들은 혜택을 볼 수 없었습니다.

```python
# type annotation
def greeting(name: str) -> str:
    return 'Hello ' + name
```

 이후 파이썬 3.5 버전에서 [typing](https://docs.python.org/3/library/typing.html) 모듈이 등장하면서
 복잡한 타입( Dict, List )을 명시할 수 있게 되었고,
 파이썬의 창시자인 Guido van Rossum이 [mypy](https://github.com/python/mypy)를
 내놓으면서 IDE 없이도 실질적인 정적 타입 검사가 가능해졌습니다.
 파이썬 3.6에서는 typing 모듈이 Dict[int, Tuple] 와 같이 아주 복잡한 타입까지도 지원할 수 있게 되는 발전이 이루어졌습니다.

 그리고 대망의 이번 파이썬 3.7에서 typing 모듈은 그 동안 가지고있던 두 가지 큰 문제를 해결하였습니다.

1. __import / generic class 생성 시간 문제__

> "The typing module is one of the heaviest and slowest modules in the standard library even with all the optimizations made." - PEP560

typing 모듈은 원래 import가 아주 오래 걸리는 모듈이었습니다.
이는 typing이 각 타입을 클래스로 표현하는 것과 관련이 깊었는데,
특히 generic class를 생성할 때에 아주 오랜 시간이 걸렸다고 합니다.
([관련 Github issue](https://github.com/python/typing/issues/432), [Generic class](https://docs.python.org/3/library/typing.html#user-defined-generic-types))

이번 파이썬 3.7에서는 typing 모듈이 속도 부분에서 괄목할만한 발전을 이루었습니다.

- import 7x faster
- user-defined generic class creation 4x faster
- generic class instantiation 5x faster

generic class와 관련하여 많은 발전을 이루었다고 하는데,
기술적인 부분에 대해 더 자세히 알고 싶으신 분은 [PEP560](https://www.python.org/dev/peps/pep-0560/)을 읽어보시면 도움이 될 것 같습니다.


2. __forward reference 불가능__

```python
class A:
    def foo(self, source: B) -> int:
        pass

class B:
    pass
# NameError: name 'B' is not defined
```

기존 typing에서는 forward reference가 불가능하여 코드 순서상 정의되지 않은 클래스 타입을 참조할 수가 없었습니다.
이는 자기 참조나 순환 참조를 하게 되는 클래스에서는 해결할 수가 없는 문제였고,

```python
class A:
    def foo(self, source: 'B') -> int:
        pass

class B:
    pass
# No error
```

그래서 위와 같이 문자열을 사용하는 상당히 어색한 방식으로 에러를 피하고 있었습니다.

이러한 forward referencing 문제를 해결하기 위하여 파이썬 4.0부터는 함수나 변수의
type annotation을 판정(evaluation)을 정의 시점이 아니라 뒤로 미룰 것이라고 합니다.
아마 인터프리터 레벨에서 많은 수준의 변경이 필요한 모양입니다.

파이썬 3.7에서는 실험적으로 forward referencing을 적용할 수 있습니다.

```python
from __future__ import annotations

class A:
    def foo(self, source: B) -> int:
        pass

class B:
    pass
# No error
```

\_\_future__ 모듈에서 `annotations`를 import하면 파이썬 3.7에서 forward referencing이 이루어지도록 할 수 있습니다.

## dataclasses

> PEP 557: Data classes

파이썬의 특징 중 하나는 [duck typing](https://nesoy.github.io/articles/2018-02/Duck-Typing)을
적극적으로 활용하여 클래스에 필요한 속성을 정의해주기만 하면 클래스를 원하는 대로
set, dictionary, iterable인 것처럼 쓸 수 있다는 점입니다.
이번 파이썬 3.7에서 추가된 [dataclasses](https://docs.python.org/3/library/dataclasses.html)
모듈은 클래스를 데이터로서 다루기 위해 필요한 속성들을 쉽게 추가할 수 있도록 해주는 모듈입니다.

클래스를 데이터로 다루기 위해서 필요한 속성에는 아래와 같은 것이 있습니다.

- 데이터 초기화 ~ `__init__()`
- 데이터 표현 ~ `__repr__()`
- 데이터 비교 ~ `__eq__() __lt__() __gt__()`

예를 들어 국가를 클래스로 표현한다면 아래와 같이 나타낼 수 있습니다.

```python
# code adapted from https://realpython.com/python37-new-features
class Country:

    def __init__(self, name, population, area, coastline=0):
        self.name = name
        self.population = population
        self.area = area
        self.coastline = coastline

    def __repr__(self):
        return (
            f"Country(name={self.name!r}, population={self.population!r},"
            f" coastline={self.coastline!r})"
        )

    def __eq__(self, other):
        if other.__class__ is self.__class__:
            return (
                (self.name, self.population, self.coastline)
                == (other.name, other.population, other.coastline)
            )
        return NotImplemented

    def __gt__(self, other):
      if other.__class__ is self.__class__:
          return ((self.name, self.population, self.coastline) > (
              other.name, other.population, other.coastline
          ))
      return NotImplemented

    def __lt__(self, other):
    def __le__(self, other):
    def __ge__(self, other):
        ...생략...
```

국가를 추상화한 데이터들을 묶어놓은 클래스인데,
상당히 자주 작성하게 되는 형태의 클래스이기도 합니다.
이런 클래스를 작성하다 보면 반복적으로 나타나는 것이 있는데요.
단순히 setter 역할을 하는 `__init__()`과,
거의 비슷하게 생긴 `__eq__()` `__gt__()`와 같은 메소드들이 있습니다.

dataclasses는 이러한 반복 작업을 아주 간단하게 만들어 줍니다.

아래 클래스는 위의 클래스와 동일한 기능을 합니다.

```python
# code adapted from https://realpython.com/python37-new-features
from dataclasses import dataclass, field

@dataclass(init=True, repr=True, eq=True, order=True)
class Country:
    name: str
    population: int
    area: float = field(repr=False, compare=False)
    coastline: float = 0
```

클래스에 type annotation 문법을 이용하여 필드들을 정의해놓고,
`@dataclass` 데코레이터를 붙여주면 자동으로 필요한 속성들이 생성됩니다.

- dataclass 파라미터와 추가되는 속성
  - init: `__init__()`
  - repr: `__repr__()`
  - eq: `__eq__()`
  - order: `__gt__() __ge__() __lt__() __le__()`

필드에 `field()` 를 붙여주어서 repr이나 order에서 사용하지 않게끔 제외하는 것도 가능합니다.

## asyncio / contextvars

파이썬에서 효율적인 비동기 연산을 수행하기 위해서
`threading`, `multiprocessing`부터 `concurrent.futures` 까지 여러 시도와 발전이 있었습니다.
그러나 GIL을 사용하는 파이썬의 근본적인 한계 때문에 스레딩이 제 힘을 발휘하기가 힘들었습니다.

그러한 상황에서 파이썬 3.4에서 등장한 coroutine 기반의 asyncio가 새롭고 강력한 대안이 되었고,
매 버전마다 상당한 발전을 이루었습니다.
이번 파이썬 3.7에서 asyncio와 관련된 주목할만한 변화는 크게 두 가지 입니다.

1. __asyncio.run() 의 추가__

사실 asyncio와 관련한 수많은 메소드들이 파이썬 3.7에서 추가되었는데요.
그 중에서도 눈에 띄는것이 `asyncio.run()` 함수 입니다.

이 함수는 단순히 coroutine 실행시키고, 완료될 때까지 대기하는 함수입니다.

이를 풀어서 설명하면,

- event loop를 생성하고
- event loop에 coroutine을 등록하고
- coroutine이 완료될 때까지 대기하고
- event loop을 제거하는

일을 수행하는 함수입니다.

새롭게 추가된 다른 많은 함수를 놔두고 이 함수만을 따로 언급하는 이유는,
이 함수가 asyncio의 접근성을 높여줄 것이라고 생각하기 때문입니다.

asyncio가 사용하는 event loop 개념은 Node.js 등을 접해보지 않은 초보 개발자에게 있어서는 대체로 낯선 개념일 것이라고 생각합니다. (_아주 주관적인 생각입니다_)

저의 경우는 event loop 개념을 asyncio에서 처음 접했는데요. 그런 저에게 있어서 event loop을 생성하고 그것에 task(future)를 등록하는 asyncio의 문법은 바로 직관적으로 다가오지 않았습니다.

```python
import asyncio
import requests

async def arequest(url):
    response = requests.get(url)
    return response

urls = [
    'https://www.google.com',
    'https://www.apple.com',
    'https://www.facebook.com',
]

# python <= 3.6
future = [arequest(url) for url in urls]
loop = asyncio.get_event_loop()
loop.run_until_complete(asyncio.wait(future))

# python 3.7 with asyncio.run()
future = [arequest(url) for url in urls]
print(asyncio.run(asyncio.wait(future)))
```

asyncio.run()은 event loop에 대한 부분을 신경쓰지 않고도 사용할 수 있다는 점에서 처음 asyncio와 event loop를 접하는 초보 개발자의 접근성을 높여줄 수 있다고 생각합니다.

2. __contextvars의 등장__

> PEP567: Context Variables

`contextvars` 모듈은 여러 개의 context를 만들고 각 context 마다 변수가 서로 다른 값을 가질 수 있도록 하는 기능을 지원하는 모듈입니다.

```python
import contextvars

def show():
    print('value is', val.get())

# context variable인 'val'을 생성
val = contextvars.ContextVar("val", default=0)
contexts = list()

for _ in range(5):
    # 현재 context의 복사본을 받아서
    ctx = contextvars.copy_context()

    # 해당 context에서의 val 값을 업데이트
    ctx.run(val.set, val.get()+1)

    contexts.append(ctx)

for ctx in contexts:
    ctx.run(show)

'''
value is 1
value is 1
value is 1
value is 1
value is 1
'''
```

context마다 다른 값을 가지는 변수인 `val`을 생성하고, for-loop을 돌면서 현재 context를 복사해서 새 context를 생성한 뒤 해당 context에서의 val값을 증가시키는 코드입니다.

언뜻 보면 `val`의 값이 1, 2, 3, 4, 5가 될 것 같지만, val을 증가시킨 context와 for loop이 실행되는 context는 서로 다르기 때문에 실제 출력값은 1, 1, 1, 1, 1이 됩니다.

이는 스레드마다 로컬 변수의 값이 달라지는 [Thread-Local Storage](https://en.wikipedia.org/wiki/Thread-local_storage) 개념과 유사한데요. asyncio에서는 한 스레드에서 여러 비동기 I/O 연산이 수행되는 방식이기 때문에 thread-local storage 방식으로는 독립된 공간을 만들 수 없습니다. 이에 대한 해결책으로서 등장한 것이 contextvars라고 볼 수 있습니다.

그 외에도 asyncio와 관련하여 아래와 같은 변경점이 있습니다.

- [await, async의 키워드(keyword)화](https://www.python.org/dev/peps/pep-0492/)
- [퍼포먼스 개선](https://docs.python.org/3.7/whatsnew/3.7.html#whatsnew37-asyncio-perf)






## dict 순서 고정

파이썬 `dict` 타입은 원래 입력한 대로 엘리먼트들의 순서를 보장하지 않아, 특정한 순서를 유지할 필요가 있을 때는 [OrderedDict](https://docs.python.org/3/library/collections.html#collections.OrderedDict) 모듈을 활용했었습니다.

파이썬 3.6 버전을 주로 쓰는 개발자라면 dict가 입력한 대로 순서를 보장한다고 알고 있을 수도 있는데, 이는 CPython 3.6 버전의 dict의 구현이 그렇게 되어 있을 뿐, 파이썬 스펙 상에는 순서에 대한 부분은 명시되어 있지 않았습니다. 즉 PyPy나 Jython에서도 dict가 동일하게 동작하는 것이 보장되어 있지 않았습니다.

```python
>>> {"one": 1, "two": 2, "three": 3}  # Python <= 3.5
{'three': 3, 'one': 1, 'two': 2}

>>> {"one": 1, "two": 2, "three": 3}  # Python >= 3.6
{'one': 1, 'two': 2, 'three': 3}
```

파이썬 3.7에서는 이것이 공식 [파이썬 스펙](https://docs.python.org/3.7/library/stdtypes.html#mapping-types-dict)에 명시되었습니다. 3.7 이후로는 어떠한 파이썬 구현체를 쓰던 dict가 입력한 순서를 그대로 유지할 것이라는 것을 전제로 개발할 수 있게된 것입니다.

## 새로운 time 모듈 함수들

> PEP 564: New Time Functions With Nanosecond Resolution

`time` 모듈에 아래의 6개 함수가 추가되었습니다.

- time.clock_gettime_ns()
- time.clock_settime_ns()
- time.monotonic_ns()
- time.perf_counter_ns()
- time.process_time_ns()
- time.time_ns()

모두 기존에 존재하던 함수에 `_ns`를 붙인 것인데, 기존 함수들이 float 타입의 초 단위로 값을 리턴하던 것을 대신 integer타입의 나노초(nanosecond) 단위로 리턴합니다.

`_ns` 함수들을 사용하는 것이 권장되는 이유는 크게 두 가지가 있는데요.

```python
>>> 0.1 + 0.2
0.30000000000000004 # :(
```

먼저 정확성 측면에서, float 타입은 근본적으로 오차가 발생할 수 밖에 없는 반면, int 타입은 오차가 발생하지 않습니다.

> The resolution of time.time_ns() vs time.time()
  - 84 ns vs 239 ns on Linux (2.8x better)
  - 318 us vs 894 us on Windows (2.8x better)

또한 속도 면에서도 time_ns() 가 time() 보다 3배나 빠르다고 합니다. [(출처)](https://www.python.org/dev/peps/pep-0564/#analysis)


## breakpoint 함수

> PEP 553: Built-in breakpoint()

개발자들의 편리를 위해서 추가된 기능들도 있습니다.

파이썬 코드 디버깅을 위해서 `pdb` 모듈을 주로 아래와 같이 사용하게 되는데요.

```python
import pdb; pdb.set_trace()
```

위의 코드와 동일한 기능을 하는 `breakpoint()` 함수가 빌트인(built-in)으로 추가되었습니다.

```python
breakpoint() # == import pdb; pdb.set_trace()
```

또 breakpoint()는 `PYTHONBREAKPOINT` 환경 변수를 이용해서 더 유연하게 사용할 수 있습니다.

```bash
$ PYTHONBREAKPOINT=0 python3.7 error_code.py
# Error!

$ PYTHONBREAKPOINT=pudb.set_trace python3.7 bugs.py
# pudb.set_trace() is called, instead of pdb.set_trace()
```

해당 환경 변수의 값을 0으로 주면 breakpoint()가 실행되지 않게도 할 수 있고, 디폴트인 pdb가 아닌 다른 디버거를 사용할 수도 있습니다.

## (+) Other Awesome Things in Python 3.7

이 글은 제가 흥미롭게 본 것들 위주로 적다보니, 평소에 제가 잘 사용하지 않는 기능들은 언급하지 않았습니다. 이 글에 언급되지 않은 것들 중에 따로 살펴볼만한 기능들의 리스트를 아래에 적어둡니다.

- [PEP 562: Customization of Access to Module Attributes](https://www.python.org/dev/peps/pep-0562/)
  - 클래스가 아닌 모듈에 `__getattr__()`, `__dir__()` 함수 추가 가능
- [importlib.resources](http://importlib-resources.readthedocs.io/en/latest/using.html#example)
  - 패키징 할 때에 `__file__` 대신 사용할 수 있는 리소스 접근법

- [new -X options](https://docs.python.org/3.7/using/cmdline.html#id5)
  - importtime : 모듈 임포트에 걸리는 시간 측정
  - utf8 : locale 고정
  - dev : development mode로 실행
- [PEP 545: Python Documentation Translations](https://docs.python.org/3.7/whatsnew/3.7.html#whatsnew37-pep545)
  - 파이썬 문서의 공식 한국어화 진행중 :)


## References

> https://docs.python.org/3.7/whatsnew/3.7.html

> https://realpython.com/python37-new-features/

> https://www.python.org/dev/peps/pep-0537/
