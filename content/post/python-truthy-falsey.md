---
date: "2018-04-05T00:00:00Z"
tags:
- Python
title: 파이썬에서의 Truthy Falsy
---

다른 강타입 언어들과 비교하여 파이썬이 갖는 재밌는 특징은, 어떤 타입의 오브젝트던 인스턴스 자체를 if문의 조건으로 사용할 수 있으며, 논리 연산의 피연산자로 사용할 수 있다는 것이다.

```python
obj = AnyObject() # int, string, array, tuple, dict, class ...

# 이런 거라던가
if obj:
  pass

# 이런 것도 가능하다
ret = obj or obj2 and obj3
```

### Truthy / Falsy

이러한 연산이 가능한 이유는 파이썬 오브젝트는 자신의 논리(boolean)값을 정할 수 있는 메소드를 가지기 때문이다.

파이썬 오브젝트의 논리 값은 `bool(object)` 함수의 리턴 값과 동일하다. 즉, 아래의 두 식은 동등하다.

```py
if obj:
  pass
```
```py
if bool(obj) == True:
  pass
```

`bool(object)`의 리턴 값은 다음과 같이 정의된다.

```
1. 오브젝트의 __bool__() 메소드가 정의되어 있는 경우
  > __bool__()의 리턴 값이 True이면 True, False이면 False

2. __bool__()이 정의되어 있지 않고 __len__() 메소드가 정의되어 있는 경우
  > __len__()의 리턴 값이 nonzero면 True, 0이면 False

3. 둘 다 정의되어 있지 않은 경우
  > True
```

이를 통하여 파이썬에서 임의의 오브젝트는 자신의 참/거짓을 정할 수 있게 된다. 이들은 논리 연산에서 True / False로 취급되지만, 엄밀한 True / False와는 구분 되어야 하므로, 참으로 취급 되는 값(Truthy), 거짓으로 취급되는 값(Falsy)라는 용어를 사용한다.

```python
obj = SomeObject()

if obj:
  print("Truthy")
else:
  print("Falsy")
```

파이썬의 기본(built-in) 오브젝트 중 Falsy 오브젝트는 아래와 같다.

- False
- None
- 0, 0.0, 0L, 0j
- ""
- []
- ()
- {}

이 외의 __모든__ 기본 오브젝트는 Truthy 오브젝트다.

---

### and / or 연산과 Truthy / Falsy

이러한 Truthy / Falsy 특성을 이용하여 파이썬은 흥미로운 문법을 만들었다.

임의의 오브젝트가 참/거짓의 논리 값을 가지므로 and / or의 피연산자가 될 수 있다. and / or은 이러한 오브젝트를 피연산자로 받아 True / False를 반환하는 대신 피연산자 중 마지막으로 확인한 Truthy / Falsy 오브젝트를 반환한다.

> 파이썬의 and / or 논리연산자는 연산 결과로 마지막으로 확인한 피연산자 Truthy / Falsy 오브젝트를 반환한다.


여기서 __마지막으로 확인한__ 이라는 것이 무슨 뜻인가 하면,

and / or 의 두 피연산자를 각각 A, B라고 하자 (A or B, A and B)

- or
  - A가 Truthy이면 B를 확인하지 않으므로 A가 저장된다.
  - A가 Falsy면 B를 확인하므로 B가 저장된다. (_B의 Truthy / Falsy 와 무관하다!_)
- and
  - A가 Truthy면 B를 확인하므로 B가 저장된다. (_B의 Truthy / Falsy 와 무관하다!_)
  - A가 Falsy면 B를 확인하지 않으므로 A가 저장된다.

가능한 모든 경우를 나타내면 아래와 같다.

```py
a = Truthy1 or Truthy2
# Truthy1
a = Truthy1 or Falsy2
# Truthy1
a = Falsy1 or Truthy2
# Truthy2
a = Falsy1 or Falsy2
# Falsy2

a = Truthy1 and Truthy2
# Truthy2
a = Truthy1 and Falsy2
# Falsy2
a = Falsy1 and Truthy2
# Falsy1
a = Falsy1 and Falsy2
# Falsy1
```

오브젝트를 리턴한다는 것이 이상해보일 수 있으나, 리턴 값(오브젝트)의 논리 값만 보면 정확하다.

이런 독특한 and / or 연산을 잘 사용하면 간결하고 재미있는 코드를 작성할 수 있다.

```py
def foo():
  if success():
    return truthy_value
  else:
    return None # falsy
```

위와 같이 성공하면 Truthy한 리턴값, 실패하면 None을 반환하는 함수가 있다.

함수가 None을 리턴하면 디폴트 값을 사용하고자 한다고 하자.

타 언어의 방식을 따르면 흔히 아래와 같이 코드를 짜게 된다.

```py
ret = function()
if ret is None:
  ret = DEFAULT_VALUE
```

파이썬의 한 줄 짜리 if-else(Ternary Operator)를 사용하여 좀더 짧게 짜볼 수도 있다.

```py
ret = function()
ret = ret if ret is not None else DEFAULT_VALUE
```

그러나 ret = ret 형태가 예뻐보이지 않고, if 절이 길어지면 가독성도 떨어질 수 있다.

이를 or 연산을 이용하여 간단하게 고칠 수가 있다.

```py
ret = function() or DEFAULT_VALUE
```

function()이 리턴값이 Truthy면 그대로 대입하고, Falsy면 디폴트 값이 대입된다.

```py
ret = function() or function2() or function3() or DEFAULT_VALUE
```

중첩해서 사용하는 것 역시 가능하다.

다른 재밌는 코드로, C에서 사용하는 conditional operator를 구현해보자.

```c
// c
ret = condition ? a: b;
```

Ternary Operator를 사용하면 아래와 같다.

```py
ret = a if condition else b
```

심플한 구조지만 앞선 예제와 비슷하게 condition이 길어질 경우 a와 b가 떨어져서 가독성이 떨어질 수 있다.

```py
ret = a if this_is_really_complicated_validation_function(a) else b
```

and / or을 사용하면 C의 형태와 구현할 수 있다.

```py
ret = condition and a or b
```

condition이 Truthy면 a 리턴하고, Falsy면 b를 리턴한다.

단, 이 문법은 a가 Falsy이면 올바르게 동작하지 않는다.

```py
a = 0
b = 'truthy'
ret = 1 and a or b
# truthy
```

에러 핸들링(?)을 하여 아래와 같은 기묘한 식을 사용할 수도 있다.

```py
a = 0
b = 'truthy'
ret = (1 and [a] or [b])[0]
# 0
```

물론 오히려 가독성이 엉망이 되었으니 사용할 이유가 없는 식이다.

---

### Conclusion

파이썬이 논리 값을 다루는 방법과 그것을 활용하는 예시는 상당히 흥미롭다. 파이썬이 덕 타이핑(duck typing)을 활용하는 방법을 보여주는 예라고도 할 수 있겠다.

이런 파이썬의 방식은 결국 간결한 정답을 추구하는 파이써닉(pythonic) 스타일과 연결된다. 파이썬의 철학에 공감한다면 이러한 파이썬의 독특한 특징을 살펴보는 것도 좋을 것이다.



---

### Reference

> http://books.goalkicker.com/PythonBook/
