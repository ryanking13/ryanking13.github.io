---
layout: post
title: (번역) 4백만 줄의 파이썬 타이핑을 위한 여정
description: Our journey to type checking 4 million lines of Python
tags: [Python]
---

> 원문 : [Our journey to type checking 4 million lines of Python](https://blogs.dropbox.com/tech/2019/09/our-journey-to-type-checking-4-million-lines-of-python/amp/)

파이썬 정적 타입 체커인 [mypy](http://mypy-lang.org/)의 개발자이자 현재는 드롭박스 소속인 [Jukka Lehtosalo](https://github.com/JukkaL)가 mypy의 개발 과정을 담은 글입니다.

---

![dropbox annotated line count](https://dropboxtechblog.files.wordpress.com/2019/09/4m-lloc-highlight402x.png)

드롭박스는 파이썬의 헤비 유저입니다. 드롭박스의 백엔드 서비스와 데스크톱 클라이언트 앱에서 가장 많이 사용되고 있는 언어가 파이썬입니다 (Go, Typescript, 그리고 Rust 역시도 많이 사용하고 있습니다). 그러나 수백만 줄의 파이썬 코드로 구성된 드롭박스 서비스의 거대한 크기를 고려하면, 파이썬의 동적 타이핑 방식은 코드를 이해하기 어렵게 만들고, 이는 생산성에 지대한 영향을 줍니다. 이러한 문제를 해결하기 위해여, 드롭박스는 가장 널리 알려진 파이썬 타입 체커인 mypy를 사용하여, 점진적으로 정적 타입 검사를 도입하기 시작했습니다. (mypy는 오픈소스 프로젝트이며, 핵심 개발팀이 드롭박스에 고용되어 있습니다.)

이 정도로 거대한 규모에서 파이썬에 정적 타입 검사를 도입한 것은 드롭박스가 거의 최초였습니다. 지금에서야 수천 개의 프로젝트들이 mypy를 사용하고 있으며, 충분히 실환경에서 검증된 상태입니다. 그러나 현재의 수준에 이르기까지는 수많은 문제와 실패가 있었습니다. 이 글은 제 대학 연구 프로젝트에서 시작한 파이썬 정적 타입 검사가, 이제는 파이썬 커뮤니티의 수많은 개발자들이 사용하는 자연스러운 일이 될 때까지의 여정을 다룹니다. 현재는 다양한 IDE 및 코드 분석 도구에서 파이썬 정적 타입 검사 기능을 지원하고 있습니다.

## 왜 타입 검사를 해야하는가?

만약 지금까지 동적 타이핑 방식으로만 파이썬을 이용해 온 분들이라면, 대체 정적 타이핑과 mypy에 대해서 왜 이렇게 야단을 떠는지 납득하지 못하실 수도 있습니다. 혹은 당신이 파이썬을 좋아하는 이유가 바로 동적 타이핑 때문일 수도 있고, 이러한 상황을 아예 이해하지 못하실 수도 있습니다.
정적 타이핑의 필요성은 프로젝트가 커짐에 따라서 발생합니다. 프로젝트가 커질수록, 당신은 정적 타이핑을 원하고, 결과적으로 필요로하게 됩니다.

당신의 프로젝트가 수만 줄의 코드가 되고, 여러 명의 엔지니어들이 작업을 하게 되면, 코드를 이해하는 것이 개발 생산성을 유지하기 위한 핵심적인 필요조건이라는 것을 우리는 경험적으로 알고 있습니다.
만약 타입 어노테이션이 없다면, 코드를 이해하는 데에 가장 기본적인 부분인, 함수에 넘어가는 적절한 파라미터를 알아내는 것이나, 함수가 리턴하는 반환값의 타입마저도 어려운 문제가 됩니다. 아래는 타입 어노테이션을 사용하지 않을때 하게되는 아주 흔한 질문들입니다.

- 이 함수가 `None`을 리턴하는 경우가 있는가?
- 이 `items`라는 파라미터는 대체 뭐여야 하지?
- 이 `id` 속성의 타입이 뭐지? `int`, `str`, 아니면 다른 유저 정의 타입인가?
- 이 파라미터는 반드시 `list`여야할까? `tuple`이나 `set`을 넘겨주면 어떻게 되지?

아래의 타입 어노테이션을 적용하면, 위와 같은 질문들은 아주 간단한 문제가 됩니다.

```python
class Resource:
    id: bytes
    ...
    def read_metadata(self, 
                      items: Sequence[str]) -> Dict[str, MetadataItem]:
        ...
```

- `read_metadata`의 리턴 타입이 `Optional[…]`이 아니기 때문에 `None`을 리턴할 일은 없습니다
- `items` 파라미터는 문자열 시퀀스여야 하니까, 아무 이터러블이나 넘겨줄 수 없습니다
- `id` 속성은 바이트 문자열입니다

당신은 이러한 부분들이 docstring 형태로 문서화되어있을 것이라고 기대할지도 모르지만, 이는 너무 이상적인 생각입니다. 경험적으로 당신은 그렇지 않은 경우가 더 많다는 것을 알고 있을 것입니다. 설령 문서화가 되어 있더라도, 그것이 정확할 것이라고 확신할 수가 없습니다. 혹은 docstring이 있더라도, 모호하거나 부정확한 경우가 많고, 이는 잘못된 이해를 야기합니다. 이러한 문제는 거대한 팀이나 코드베이스에서는 치명적인 문제로 작용할 수 가 있습니다.

비록 파이썬이 프로젝트의 초중기에 사용하기에 매우 좋은 언어라 할지라도, 특정 지점을 넘어서면 파이썬을 사용하는 프로젝트와 기업에서는 필연적으로 중요한 결정을 해야할 시기가 발생합니다, "우리가 전체 프로젝트를 정적 타입 언어로 다시 작성해야 할까?"

mypy와 같은 타입 체커는 타입을 정의하는 문법을 제공하고, 실제 타입이 이러한 정의에 부합하는 지를 검사함으로써 이러한 문제를 해결합니다. 간단히 말하면, mypy는 검증된 문서화를 제공합니다.

이외에도 다양한 이점들이 있습니다, 예를 들면,

- 타입 체커는 사소한 (또는 사소하지 않은) 버그들을 미리 잡아낼 수 있게 해줍니다. 대표적인 예로는 `None` 값이나 이외의 특수한 환경에서의 핸들링
- 리팩토링이 쉬워집니다. 타입 체커가 어느 부분이 수정되어야 하는지 알려주기 때문입니다. 더이상 비효율적인 100% 테스트 커버리지에 목매지 않아도 됩니다. 문제의 원인을 찾기 위해서 긴 stacktrace를 따라가야 할 필요도 없습니다.
- 거대한 프로젝트 에서도, mypy는 몇초안에 전체 프로젝트를 검사하는 것이 가능합니다. 테스트를 수행하는 것이 수십초 내지 몇분이 걸리는 것과는 달리 말이죠. 타입 검사는 빠른 피드백을 제공하고 이는 개발 사이클을 더욱 빠르게 합니다. 더 이상 부정확하고 유지보수하기 힘든 유닛 테스트에 의존할 필요가 없습니다.
- PyCharm이나 VSCode 같은 IDE와 에디터들이 타입 어노테이션을 이용하여 코드 자동완성, 하이라이팅의 기능을 향상시키고, 이외에도 다양한 도움이 되는 기능을 만들어낼 수 있습니다. 일부 프로그래머들에게는 이것이 가장 핵심적인 기능~. 이러한 기능은 mypy와 같은 별도의 타입 체커를 필요로 하지도 않습니다. mypy가 타입 어노테이션이 실제 코드와 잘 맞는지를 검사하는 용도로는 쓰일 수 있겠지만요.

## mypy가 탄생하기까지

mypy는 제가 드롭박스에 들어오기 몇년 전, 영국 캠브릿지 대학에서 시작되었습니다. 저는 박사과정에서 정적 타입 언어와 동적 타입 언어를 합치는 연구를 하고 있었습니다. Siek과 Taha의 [gradual typing](http://homes.sice.indiana.edu/jsiek/what-is-gradual-typing/)과 [Typed Racket](https://docs.racket-lang.org/ts-guide/)의 영향을 받아, 하나의 프로그래밍 언어를 아주 작은 스크립트를 작성하는 데에도 쓸 수 있고, 수백만 줄의 코드베이스에서도 쓸 수 있도록 하고자 했죠. 이 아이디어의 핵심적인 부분은 초기에는 타입이 명확하지 않은 프로토타입에서 시작하여, 점차 실제 환경에서 사용할 수 있는 정적 타입의 결과물을 만들어낼 수 있도록 하는 것이었습니다. 현재에 와서는 이러한 아이디어가 꽤 널리 받아들여지고 있지만, 2010년 당시에만 해도 이는 활발하게 연구되는 주제가 아니었습니다.

타입 검사에 대한 제 초기 연구는 파이썬을 타겟으로 한 것이 아니었습니다. 대신 제가 직접 만든 `Alore`라는 언어를 사용했습니다. 아래는 Alore가 어떻게 생긴 언어인지 보여주는 예시입니다 (타입 어노테이면 문법은 선택적입니다.)

```
def Fib(n as Int) as Int
  if n <= 1
    return n
  else
    return Fib(n - 1) + Fib(n - 2)
  end
end
```

단순화된 커스텀 언어를 사용하는 것은 빠르게 실험을 수행하고, 중요하지 않은 (문제점)을 무시하기 위해 연구에서 흔히 사용하는 방식입니다. 
현업에서 사용되는 언어들은 굉장히 크고 복잡한 구현체이기 때문에, 실험이 slow.
그러나 주류 언어가 아닌 언어를 통해서 나온 결과에는 bit suspect, 왜냐하면 실용성을 sacrificed.

저는 Alore를 사용하여 만든 타입 체커에서 큰 가능성을 보았고, 이를 실제 환경에서 돌아가는 코드에서 실험하고 싶었습니다.
운이 좋게도, Alore는 파이썬에 큰 영향을 받은 언어였습니다. 그래서 체커를 파이썬 문법에 맞추어 수정함으로써 오픈 소스 파이썬 코드를 검사하도록 하는 것은 어려운 일이 아니었습니다.
또한 저는 Alore 코드를 파이썬 코드로 변환하는 도구를 만들었고, 이를 통해서 타입 체커를 Alore 코드에서 파이썬 코드로 변환했습니다. 이를 통해 파이썬 코드를 검사할 수 있는 파이썬으로 만들어진 타입 체커가 완성되었습니다!
(Alore에서 사용한 일부 디자인은 파이썬에는 잘 맞지 않았습니다, 이는 mypy 코드베이스에서 지금도 확인이 가능합니다.)

솔직하게 말하면, 아직 이 언어는 파이썬이라고 부를 수 있는 상태는 아니었습니다. 파이썬 3의 타입 어노테이션 문법의 한계로 인해서, 자바와 파이썬의 융합체같아 보이는 형태였죠.

```
int fib(int n):
    if n <= 1:
        return n
    else:
        return fib(n - 1) + fib(n - 2)
```

당시 제가 가지고 있던 아이디어 중 한 가지는, 타입 어노테이션 문법을 사용하여 파이썬 코드를 C나 JVM 바이트코드로 컴파일할 수 있게 하여 성능을 향상시키는 것이었습니다. 그러나 그 아이디어는 곧 포기했는데, 타입 검사 자체로도 충분히 의미가 있다고 판단하였기 때문입니다.

이러한 프로젝트 결과를 산타클라라에서 열린 파이콘 2013에서 발표를 했고, 파이썬의 BDFL인 Guido와 대화를 나눌 기회가 있었습니다. 그는 제게 독자적인 문법을 버리고 파이썬 3의 문법에 충실할 것을 설득했습니다.
파이썬 3은 함수 어노테이션을 제공하므로, 아래와 같은 식으로 파이썬 프로그램을 작성할 수 있습니다.

```python
def fib(n: int) -> int:
    if n <= 1:
        return n
    else:
        return fib(n - 1) + fib(n - 2)
```

일부 기능은 포기해야만 했습니다 (제가 독자적인 문법을 사용한 이유가 이 때문이었습니다.).
구체적으로, 당시 최신 버전이었던 파이썬 3.3에서는 변수 어노테이션 문법이 없었습니다.
저는 Guido와 이메일로 여러 가능성이 있는 문법들에 대해서 논의했습니다. 우리는 변수에 대해서는 타입 코멘트를 다는 방식을 사용하기로 결정했습니다.
기능적으로는 충분했지만, 다소 보기에 어정쩡해보이는 방식이었죠. (파이썬 3.6에서는 훨씬 더 좋은 문법이 만들어졌습니다.)

```python
products = []  # type: List[str]  # Eww
```

타입 코멘트는 별도의 타입 어노테이션 문법이 없는 파이썬 2에서 사용하기에는 적합한 방식이었습니다.

```python
def fib(n):
    # type: (int) -> int
    if n <= 1:
        return n
    else:
        return fib(n - 1) + fib(n - 2)
```

결과적으로는 이러한 compromise들이 정적 타이핑을 통해서 얻는 이점에 비해서 굉장히 사소한 문제라고 여겨지고, 유저들은 썩 이상적이지 않은 문법들을 개의치 않게 되었습니다.
파이썬 타입 체킹을 위해서 추가적인 문법이 사용되지 않으므로, 기존에 사용하던 모든 파이썬 도구나 워크플로우가 그대로 사용될 수 있고, 이는 타입 검사를 도입하는 것을 쉽게 만들었습니다.

또한 Guido는 제게 박사 졸업 후 드롭박스로 오라고 말했습니다. 여기서 이 이야기의 핵심적인 부분이 시작됩니다.

## 표준으로 인정받은 타이핑 (PEP 484)

mypy를 본격적으로 실험한 것은 드롭박스 Hack Week 2014에서 였습니다. Hack Week는 드롭박스에서 일주일동안 아무 일이나 하고싶은 것을 할 수 있도록 하는 주간입니다. 드롭박스의 많은 멋진 기능들의 역사를 따라가보면 Hack Week에서 시작된 경우가 많습니다. Hack Week에서의 실험 결과, 우리는 mypy의 가능성을 높게봤지만, 아직 널리 쓰이기에는 부족한 부분이 있다고 판단했습니다.

이 아이디어는 파이썬의 타입 힌트 문법이 표준화되기까지 표류했습니다. 위에서 언급한 것처럼, 파이썬 3.0부터 함수 타입 어노테이션이 가능했습니다, 그러나 이들은 단순히 임의의 expression이었고, 명확하게 정해진 문법이 없었습니다. 런타임에는 대부분 무시되었죠.
Hack Week가 끝난 이후, 우리는 문법을 표준화하는 작업을 시작했고, 그 결과 PEP 484가 탄생했습니다(Guido, Łukasz Langa, 그리고 제가 함께 작성했습니다).
PEP 484의 목적은 두 가지였습니다.
첫째, 모든 파이썬 생태계가 각기 다르고 호환되지 않는 방식 대신 공통된 타입 힌트(파이썬에서의 표현으로는 타입 어노테이션) 문법을 사용하는 것.
둘째, 우리만의 주장으로 이를 ~ 아니라 더 많은 파이썬 커뮤니티와 타입 힌트를 어떻게 활용할 지 논의하고 ~.
파이썬은 "덕 타이핑(duck typing)"으로 유명한 동적 타이핑 언어이기 때문에, 적정 타이핑을 도입하는 것에 대해서 커뮤니티의 다양한 의심 ~, 그러나 이러한 의견들은 타입 힌트가 선택적인 기능으로 남을 것이라는 것이 명확해진 뒤로는 사그라들었습니다. (물론 사람들이 이 타입 힌트가 유할 것이라는 점을 이해하기도 했구요.) 

결과적으로 완성된 타입 힌트 문법은 mypy가 최초에 지원했던 것과 상당히 유사한 형태가 되었습니다.
PEP 484는 2015년에 파이썬 3.5와 함게 배포되었고, 파이썬은 이제 동적 타이핑 언어 이상의 것이 되었습니다.
저는 이것이 파이썬의 큰 마일스톤이라고 생각합니다.

## 마이그레이션 시작

2015년 말에 드롭박스에서는 mypy 개발을 위하여 Guido, Greg Price, 그리고 David Fisher의 3명으로 구성된 팀을 만들었습니다.
그 이후로 모든 것이 굉장히 빠르게 움직였습니다. mypy의 시급한 걸림돌은 성능이었습니다.
초기의 목표는 mypy 구현체를 C로 컴파일 하는 것이었는데, 이 아이디어는 포기되었습니다(적어도 지금은요).
CPython 인터프리터의 성능은 mypy를 돌리기에는 만족스럽지 않았습니다. (PyPy의 경우도 도움이 되지 않았습니다.)

다행히도, 알고리즘적인 개선이 이루어졌습니다. 처음으로 만든 메이저한 성능 향상은 점진적인 검사를 도입한 것이었습니다. 아이디어는 간단합니다. 만약 모듈의 모든 디펜던시가 이전의 mypy 실행시와 똑같다면, 이미 캐싱된 데이터를 그대로 사용할 수 있으므로 수정된 파일과 해당 파일의 디펜던시만 검사하면 되는 것입니다.
mypy는 거기서 한발짝 더 나아갔는데요. 만약 모듈의 외부 인터페이스가 바뀌지 않았다면, mypy는 이 모듈을 임포트하는 다른 모듈도 다시 검사하지 않습니다.

점직전인 검사 방식은 거대한 코드 프로젝트를 검사할 때에 매우 많은 도움이 되었습니다. 이러한 프로젝트는 수많은 mypy run이 이루어지고, 타입이 점진적으로 추가되고 바뀌기 때문이죠.
그렇지만 여전히 최초의 mypy 실행은 여전히 많은 디펜던시를 검사하는 데에 오랜 시간이 걸립니다.
이를 개선하기 위해, 우리는 remote 캐싱을 구현했습니다. mypy는 local cache가 만료되면, 중앙 레포지토리에서 최근의 캐시 스냅샷을 다운로드 합니다. 그리고 다운로드된 캐시 위에서 다시 점진적인 빌드를 수행합니다.
이를 통해 또 한번 큰 성능 향상을 이룰 수 있었습니다.

이 시점부터 드롭박스에서 mypy를 적극적으로 도입하기 시작했습니다. 2016년 말에는, 42만 줄의 파이썬 코드에 타입이 명시되었습니다. 많은 유저들은 타입 체킹에 굉장한 만족감을 나타냈고, 드롭박스 내에서도 mypy를 사용하는 팀이 빠르게 늘어가고 있었습니다.

많은 것들이 잘 되어가고 있었지만, 여전히 해야할 일이 많았습니다.
우리는 정기적으로 내부 서베이를 수행하여, 불편한 부분이나 우전적으로 개발되어야 할 부분을 조사했습니다.
(이러한 방식은 현재까지도 지속되고 있습니다.)
크게 두 가지 핵심적인 요구사항이 있었습니다. 더 많은 타입 지원과, 더 빠른 실행 속도였죠.
아직 더 개선할 사항이 있다는게 명백해졌으므로, 우리는 일에 더 박차를 가했습니다.

## 더 빠른 성능!

점진적인 빌드 방식은 mypy를 빠르게 만들었지만, 여전히 충분히 빠르지는 않았습니다. 여전히 한 번의 실행이 1분 가량 소모되었습니다. 이것의 원인은 거대한 파이썬 코드베이스를 다뤄본 사람이라면 익숙한 문제일 것인데요, 바로 순환참조입니다.
수백개의 모듈이 서로를 직간접적으로 참조하는 상황. 이러한 사이클에서 단 하나의 파일만 바뀌어도, mypy는 전체 사이클에 있는 모든 파일을 검사하여야 하고, 이 사이클에 있는 모듈을 import하는 다른 모듈도 검사하여야 했습니다.

이러한 사이클 중의 하나는 드롭박스의 수많은 사람들을 눈물나게 한 악명높은 "꼬임"도 있었습니다.
어느 한 시점에는 수백개의 모듈이 서로를 임포트하고 다시 이를 임포트하는 테스트 함수와 제품 코드가 섞인 상태였습니다.

우리는 이렇게 꼬인 의존성을 풀려고 시도해보았습니다만, 그럴만한 충분한 시간과 능력이 없었습니다.
익숙하지 않은 코드도 너무나 많았구요.
대신 우리는 다른 방식의 접근을 시도했습니다. 그러한 꼬임이 존재하더라도 괜찮게끔 mypy를 빠르게 만들자는 것이었습니다.
이를 우리는 mypy 데몬을 통해서 달성했습니다. mypy 데몬은 두 가지 흥미로운 작업을 하는 서버 프로세스입니다.
첫째로, 전체 코드베이스에 대한 정보를 메모리에 저장하고 있고, 이를 통해 각 mypy 실행시에 수천개의 전체 디펜던시를 다 로드하지 않아도 되도록 합니다.
둘째로, 함수와 기타 구조에 대한 find-grained 디펜던시를 추적합니다.
예를 들어, foo 함수가 bar 함수를 호출한다면, bar에서 foo로의 의존성이 있습니다.
만약 파일이 수정되면, 데몬은 먼저 수정된 파일을 검사하고, 그 후 해당 파일의 변화를 확인할 수 있는 외부 파일을 검사합니다, 예를 들면 파일 시그니쳐가 바뀌었던가 하는 것 말이죠. 데몬은 fine-grained 디펜던시를 사용해서 변화된 함수를 사용하는 함수들만 다시 검사합니다. 이는 대체로 적은 수의 함수입니다.

기존의 구현은 한 파일 전체를 검사하는 방식으로 이루어졌기 때문에, 이러한 새로운 기능을 구현하는 것은 굉장히 도전적인 일이었습니다. 우리는 수많은 어떤 함수들이 검사되어야 하는지 수 많은 edge case와 싸워야했죠.
수많은 땀과 노력 끝에 우리는 대부분의 점진적 실행을 단 몇초안에 끝낼 수 있도록 만드는데에 성공했습니다.

## 더욱 너 나은 성능!

앞서 언급한 원격 캐싱을 도입한 결과, mypy 데몬은 몇개 되지 않는 파일만 변경된 점진적 사용 시에 만족스러운 성능을 보였습니다.
그러나 여전히 최악의 경우에서의 성능은 갈 길이 멀었습니다. 제일 처음 실행하는 mypy 빌드는 15분 가량 걸렸고, 이는 우리가 만족할 수 있는 속도가 아니었습니다.
더욱이 이는 매주 엔지니어들이 코드에 타입을 추가하면서 점점 악화되었습니다.
여전히 드롭박스의 사용자들은 성능 향상을 원하고 있었습니다. 우리는 그 기대에 부합해야했습니다.

우리는 mypy를 파이썬에서 C로 컴파일하는 초기의 아이디어로 돌아갔습니다. 기존에 존재하는 파이썬 to C 컴파일러인 Cython을 이용하는 것은 뚜렷한 속도 향상을 보이지 않았고, 따라서 우리는 자체적인 컴파일러를 개발하기로 했습니다. 파이썬으로 작성된 mypy 코드베이스는 이미 전체 코드에 타입 어노테이션이 작성된 상태였기 때문에, 이 타입 어노테이션을 이용해서 속도를 향상시켜보기로 했습니다.
저는 간단한 POC 프로토타입을 만들어서 여러 마이크로 벤치마크에서 10배 이상의 성능 향상을 보이는 것을 확인했습니다.
아이디어는 파이썬 모듈을 CPython의 C 익스텐션 모듈로 컴파일하고, 런타임에 타입 어노테이션을 검사하는 것이었습니다 (일반적으로 타입 어노테이션은 런타임에는 무시되고 타입 체커에 의해서만 사용됩니다.).
우리는 

proof-of-concept prototype that gave performance improvement of over 10x in various micro-benchmarks. The idea was to compile Python modules to CPython C extension modules, and to turn type annotations into runtime type checks (normally type annotations are ignored at runtime and only used by type checkers). We effectively were planning to migrate the mypy implementation from Python to a bona fide statically typed language, which just happens to look (and mostly behave) exactly like Python. (This sort of cross-language migration was becoming a habit—the mypy implementation was originally written in Alore, and later a custom Java/Python syntax hybrid.)

Targeting the CPython extension API was key to keeping the scope of the project manageable. We didn’t need to implement a VM or any libraries needed by mypy. Also, all of the Python ecosystem and tools (such as pytest) would still be available for us, and we could continue to use interpreted Python during development, allowing a very fast edit-test cycle without having to wait for compiles. This sounded like both having your cake and eating it, which we quite liked!

The compiler, which we called mypyc (since it uses mypy as the front end to perform type analysis), was very successful. Overall we achieved around 4x speedup for clean mypy runs with no caching. The core of the mypyc project took about 4 calendar months with a small team, which included Michael Sullivan, Ivan Levkivskyi, Hugh Han, and myself. This was much less work than what it would have taken to rewrite mypy in C++ or Go, for example, and much less disruptive. We also hope to make mypyc eventually available for Dropbox engineers for compiling and speeding up their code.

There was some interesting performance engineering involved in reaching this level of performance. The compiler can speed up many operations by using fast, low-level C constructs. For example, calling a compiled function gets translated into a C function call, which is a lot faster than an interpreted function call. Some operations, such as dictionary lookups, still fall back to general CPython C API calls, which are only marginally faster when compiled. We can get rid of the interpretation overhead, but that only gives a minor speed win for these operations.

We did some profiling to find the most common of these “slow operations”. Armed with this data, we tried to either tweak mypyc to generate faster C code for these operations, or to rewrite the relevant Python code using faster operations (and sometimes there was nothing we could easily do). The latter was often much easier than implementing the same transformation automatically in the compiler. Longer term we’d like to automate many of these transformations, but at this point we were focused on making mypy faster with minimal effort, and at times we cut a few corners.

## Reaching 4 million lines

Another important challenge (and the second most popular request in mypy user surveys) was increasing type checking coverage at Dropbox. We tried several approaches to get there: from organic growth, to focused manual efforts of the mypy team, to static and dynamic automated type inference. In the end, it looks like there is no simple winning strategy here, but we were able to reach fast annotation growth in our codebases by combining many approaches.

As a result, our annotated line count in the biggest Python repository (for back-end code) grew to almost 4 million lines of statically typed code in about three years. Mypy now supports various kinds of coverage reports that makes it easy to track our progress. In particular, we report sources of type imprecision, such as using explicit, unchecked Any types in annotations, or importing 3rd party libraries that that don’t have type annotations. As part of our effort to improve type checking precision at Dropbox, we also contributed improved type definitions (a.k.a. stub files) for some popular open-source libraries to the centralized Python typeshed repository.

We implemented (and standardized in subsequent PEPs) new type system features that enable more precise types for certain idiomatic Python patterns. A notable example is TypedDict, which provides types for JSON-like dictionaries that have a fixed set of string keys, each with a distinct value type. We will continue to extend the type system, and improving support for the Python numeric stack is one of the likely next steps.

![server](https://dropboxtechblog.files.wordpress.com/2019/09/01-s_be3065586f8fa9c15d8db9d64833f16b5a48ee3941b26d6e4f9f37a6c6aecfbc_1565865178872_serverblog2a.png?w=768&h=576)

![client](https://dropboxtechblog.files.wordpress.com/2019/09/02-s_be3065586f8fa9c15d8db9d64833f16b5a48ee3941b26d6e4f9f37a6c6aecfbc_1565865190542_clientblog2a.png?w=768&h=576)

![combined](https://dropboxtechblog.files.wordpress.com/2019/09/03-s_be3065586f8fa9c15d8db9d64833f16b5a48ee3941b26d6e4f9f37a6c6aecfbc_1565876815034_combinedblog2a.png?w=768&h=576)

Here are highlights of the things we’ve done to increase annotation coverage at Dropbox:

_Strictness_. We gradually increased strictness requirements for new code. We started with advice from linters asking to write annotations in files that already had some. We now require type annotations in new Python files and most existing files.

_Coverage reporting_. We send weekly email reports to teams highlighting their annotation coverage and suggesting the highest-value things to annotate.

_Outreach_. We gave talks about mypy and chatted with teams to help them get started.

_Surveys_. We run periodic user surveys to find the top pain points and we go to great lengths to address them (as far as inventing a new language to make mypy faster!).

_Performance_. We improved mypy performance through mypy daemon and mypyc (p75 got 44x faster!) to reduce friction in annotation workflows and to allow scaling the size of the type checked codebase.

_Editor integrations_. We provided integrations for running mypy for editors popular at Dropbox, including PyCharm, Vim, and VS Code. These make it much easier to iterate on annotations, which happens a lot when annotating legacy code.

_Static analysis_. We wrote a tool to infer signatures of functions using static analysis. It can only deal with sufficiently simple cases, but it helped us increase coverage without too much effort.

_Third party library support_. A lot of our code uses SQLAlchemy, which uses dynamic Python features that PEP 484 types can’t directly model. We made a PEP 561 stub file package and wrote a mypy plugin to better support it (it’s available as open source).

## Challenges along the way

4백만 줄에 이르는 것은 당연히 쉬운 일이 아니었고, 그 과정에서 여러 실수와 문제들이 있었습니다.
아래는 다른 사람들이 우리와 같은 실수를 하지 않기를 바라는 마음에서 적은 내용들입니다.

__빠진 파일들__. mypy를 이용한 우리의 첫 빌드는 아주 적은 수의 파일을 대상으로 이루어졌습니다.
이 빌드밖에 있는 파일들을 검사 대상 외였죠. 어떤 파일에 어노테이션이 추가되면 빌드에 추가되는 방식입니다.
그래서 만약 빌드 밖에 있는 파일을 임포트하면, 전혀 검사되지 않은 Any 타입의 값을 받게됩니다.
이는 타입 정확도를 현저하게 떨어뜨립니다 (특히 초기의 마이그레이션에서요.).
최악의 경우는 두 개의 서로 다른 타입 검사가 완료된 코드베이스를 머지하면 두 코드베이스가 호환되지 않는다는 것을 발견하고,
수 많은 어노테이션의 수정이 필요하기도 했죠!
돌이켜 생각해보면 mypy 빌드 시에 기본적인 라이브러리 모듈을 포함시켜서 좀더 make things smmother하게 만들어야 했습니다.

__레거시 코드에 어노테이션 추가하기__. 처음 시작했을 때, 우리에게는 4백만줄의 파이썬 코드가 있었습니다.
이 코드 전체에 어노테이션을 추가하는 것은 non-trivial 함이 당연했죠.
그래서 우리는 PyAnnotate라는 도구를 만들어서 런타임에 타입을 수집하고 이렇게 수집된 타입을 토대로 타입 어노테이션을 삽입하고자 했습니다. 그러나 이는 큰 효용이 없었습니다. 타입을 수집하는 것이 느렸고, 나온 결과물도 대체로 수작업으로 일일히 수정해야 하는 것이었죠.
매번 테스트 빌드를 할 때마다 small fraction of network requests에서 타입을 수집하는 것도 고려해보았습니다만,
결과적으로는 이것이 너무 risky하다고 판단했습니다.

최종적으로는, 대부분의 코드가 코드 작성자에 의해 수작업으로 어노테이션 되었습니다.
우리는 highest-value 모듈과 함수들에 대한 report를 제공하여 주요한 어노테이션 작업이 더 원활하게 이루어지도록 했습니다. 수백군데에서 쓰이는 라이브러리 모듈은 우선적으로 어노테이션이 이루어져야하고, 반대로 곧 대체될 레거시 서비스는 어노테이션의 중요함이 훨씬 덜합니다.
또한 정적 분석 도구를 이용해서 레거시코드에 타입 어노테이션을 붙이는 실험도 했습니다.


__임포트 cycle__. 앞서도 임포트 cycle ("꼬임")이 mypy를 빠르게 하는 것을 어렵게 한다고 언급한 바 있습니다.
또한 모든 종류의 import cycle을 지우너하지 위해서 많은 노력이 필요했죠.
우리는 최근에 메이저한 redesign 프로젝트를 끝냈고, 마침애 대부분의 import cycle 이슈를 해결하였습니다.
이러한 이슈들은 초기 Alore 때에서 stem 했는데요.
Alore에는 이러한 import cycle을 쉽게 다룰 수 있는 문법이 존재했지만, 파이썬에서는 import cycle을 다루는 것이 쉽지 않았습니다. 왜냐하면 statements can mean mulitple things.
예를 들어, assignment가 type alias를 정의할 수 있고, mypy는 이를 대부분의 import cycle이 처리되기 전까지는 인식할 수가 없었습니다. Alore는 이러한 모호성이 없었습니다. 초기의 design decision이 몇년 후까지 pain을 주는 경우라고 할 수 있죠!


## 5백만 줄 그리고 그 너머로

초기 프로토타입에서 시작해서 4백만 줄을 검사하기에 이르기까지, 아주 긴 여정이었습니다.
파이썬의 타입 힌트 문법을 표준화했고, IDE와 에디터의 도움으로 파이썬 생태계에서 타입 검사 ~가 싹 텄고, 서로 다른 장단점을 가진 다양한 타임 체커가 만들어졌고, 라이브러리들도 지원하기 시작했죠.

비록 드롭박스 내에서는 타입 검사가 충분히 받아들여지고 있지만, 제 생각에 파이썬 커뮤니티에서 아직은 타입 검사는 초기단계라고 생각되고, 앞으로 더 나아지고 퍼져나갈 것이라고 생각합니다. 아직 거대한 파이썬 프로젝트에서 타입 검사를 써보지 않았다면, 지금이 바로 시작할 때라고 생각합니다 (아무도 저에게 타입 검사 도입 후에 후회한다고 말한 적이 없어요!). 타입 검사는 큰 프로젝트에서 파이썬을 더 나은 언어로 만들어주는 방법이라고 자신있게 말할 수 있습니다.

---

### Reference

> https://blogs.dropbox.com/tech/2019/09/our-journey-to-type-checking-4-million-lines-of-python/amp/