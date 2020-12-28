---
date: "2018-06-05T00:00:00Z"
categories:
- Javascript
title: (번역) Javascript - The Curious Case of Null >= 0
summary: 개발 과정에서 예상치 못한 상황을 만났을 때 언어 스펙에서부터 차근차근 문제를 풀어가는 글입니다.
---

[원문 링크: Abinav Seelan - Javascript : The Curious Case of Null >= 0](https://blog.campvanilla.com/javascript-the-curious-case-of-null-0-7b131644e274)

> Why it’s important to read the Javascript Spec

예상치못한 상황을 만났을 때 언어 스펙에서부터 차근차근 문제를 풀어가는 글이다.

---

![](https://cdn-images-1.medium.com/max/1600/1*F-EDLK-OugJ_4KOgtJqnPA.png)

얼마 전 자바스크립트 기초 가이드를 작성하는 도중 `null`과 관계 연산자 사이에서 흥미로운 사례를 발견했다.

```js
null > 0; // false
null == 0; // false

null >= 0; // true
```

엥...?

값이 `0`보다 __크지 않고__ `0`과 __같지 않은데__ `0`보다 __크거나 같다__ 라니?

처음에는 그냥 자바스크립트가 자바스크립트했구나 하고 넘어가려고 했지만, 워낙 동작이 이상해서 도리어 흥미가 생겼다. `null` 타입이 특수하게 다뤄져서 이런 결과가 나온 걸까? 아니면 비교 연산이 이루어지는 방식이랑 관계가 있는 것일까?

그래서 이 문제의 원인을 알기 위해서 뿌리까지 파고들어가보기로 했다. 자바스크립트의 유일한 진리가 담긴 것! 그렇다 자바스크립트 스펙 문서다.

자 토끼를 잡으러 토끼굴에 들어가보자.

## The Abstract Relational Comparison Algorithm

우선 첫번째 비교 연산을 살펴보자.

```js
null > 0; // false
```

스펙 문서에 따르면, `>`, `<` 비교 연산자는 [_Abstract Relational Comparison Algorithm_](http://interglacial.com/javascript_spec/a-11.html#a-11.8.5)이라는 알고리즘을 사용하여 구문의 true/false를 판정한다.

```
1. ToPrimitive(x, hint Number)를 호출.

2. ToPrimitive(y, hint Number)를 호출.

3. Type((1)의 결과)가 String이고 Type((2)의 결과)가 String이면, 16번으로 이동.

4. ToNumber((1)의 결과)를 호출.

5. ToNumber((2)의 결과)를 호출.

6. (4)의 결과가 NaN이면, undefined를 리턴.

7. (5)의 결과가 NaN이면, undefined를 리턴.

8. (4)과 (5)의 결과가 동일하면, false를 리턴.

...(9~21 생략)...
```

이 알고리즘을 토대로 `null > 0`을 살펴보자.

1번과 2번에서는 `null`과 `0`을 인자로 하여 `ToPrimitive()`를 호출한다. 이 함수는 인자를 `Number`, `String`과 같은 원시 타입(primitive type)에 해당하는 값으로 바꾸는 함수다. 변환되는 값은 아래 표와 같다.

<script src="https://gist.github.com/abinavseelan/7c18d8d217aea981e99d3f089adfb520.js"></script>

표에 따르면 `null`과 `0`은 모두 원래의 값을 그대로 리턴한다.

그러므로 3번은 해당하지 않으니 넘어갈 수 있고, 4번과 5번을 적용하자. 두 값을 `Number` 타입으로 변환한다. 변환되는 값은 아래 표와 같다.

<script src="https://gist.github.com/abinavseelan/6c1770bba712eb4bd960f4daacaff2c8.js"></script>

`null`은 `+0`으로 변환되고 `0`은 당연히 그대로 `0`이다. 둘 모두 `NaN`이 아니므로 6, 7번은 넘어갈 수 있고, 8번에 따라 `+0`과 `0`은 같으므로 리턴 값은 __false__ 다. 따라서,

```js
null > 0 // false

// 같은 방식으로

null < 0 // false
```

## The Abstract Equality Comparison Algorithm

다음에 살펴볼 것은 이것이다.

```js
null == 0; // false
```

`==` 연산자는 [_Abstract Equality Comparison Algorithm_](http://interglacial.com/javascript_spec/a-11.html#a-11.8.5)이라는 알고리즘을 사용하여 구문의 true/false를 판정한다.

```
1. Type(x)과 Type(y)가 다르면, 14번으로 이동.

...(2~13 생략)...

14. x가 null이고 y가 undefined면, true를 리턴.
15. x가 undefined이고 y가 null면, true를 리턴.
16. Type(x)가 Number이고 Type(y)가 String이면, x == ToNumber(y)의 결과를 리턴.
17. Type(x)가 String이고 Type(y)가 Number이면, ToNumber(x) == y의 결과를 리턴
18. Type(x)가 Boolean이면, ToNumber(x) == y의 결과를 리턴.
19. Type(y)가 Boolean이면, x == ToNumber(y)의 결과를 리턴.
20. Type(x)가 String 또는 Number이고, Type(y)가 Object이면, x == ToPrimitive(y)의 결과를 리턴.
21. Type(x)가 Object이고, Type(y)가 String 또는 Number이면, ToPrimitive(x)== y의 결과를 리턴.

22. false를 리턴.
```

1번을 보면 `null`과 `0`은 다른 타입이므로 14번으로 이동한다. 14~21번을 살펴보면 모두 해당하지 않고, 따라서 22번에 따라 리턴 값은 디폴트로 __false__ 다. 따라서,

```js
null == 0; // false
```

## The Greater-than-or-equal Operator (>=)

자, 이제 마지막 문제다.

```js
null >= 0; // true
```

이 연산 결과를 분석하려고 스펙을 살펴본 순간 완전히 당황하고 말았다. `>=` 연산자는 아주 하이 레벨(high-level)에서 다음과 같이 결과를 계산하고 있었다.

```js
null < 0 이 false라면, null >= 0 은 true다.
```

<br />
<iframe src="https://giphy.com/embed/oOTTyHRHj0HYY" width="480" height="466" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
<br />

따라서,

```js
null >= 0; // true
```

잘 생각해보면 합리적이다. 수학적으로, 두 수 `x`와 `y`가 있을 때, `x`가 `y` 보다 _작지 않다_ 면, `x`는 `y` 보다 __반드시__ _크거나 같다_ .

아마 연산을 최적화 하기 위해서 이러한 방식을 사용하는 것이 아닐까 추측된다. `x >= y`의 결과를 구하기 위해서, `x`가 `y`보다 큰지 확인하고, 그렇지 않다면 `x`와 `y`가 같은지 확인하는 건 두 번의 연산이 필요하지만 `x`가 `y`보다 작은지 확인하는 건 한 번이면 끝나니까 말이다.

(`>=` 연산의 결과를 구하는 정확한 과정을 알고 싶다면 [여기](http://interglacial.com/javascript_spec/a-11.html#a-11.8.4)를 참고)

---

비록 이 문제는 아주 단순한 것이었지만, 이 문제의 해답을 구하는 과정은 나에게 프로그래밍 언어에 대한 좋은 인사이트(insight)가 되었다. 부디 이 글이 당신에게도 그렇길 바란다.
