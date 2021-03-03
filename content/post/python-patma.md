---
date: "2021-03-01T20:00:00+09:00"
title: 파이썬의 패턴 매칭 도입
categories:
- Python
description: 파이썬의 패턴 매칭 도입
summary: 파이썬에 새로 추가되는 패턴 매칭에 대한 이야기입니다.
draft: true
---

> **Note**: 이 글은 파이썬 패턴 매칭 문법에 대한 역사적 배경과 여러 가지 생각들을 다룹니다. 파이썬 패턴 매칭 문법을 공부하기 위해 방문하셨다면 [PEP 636을 참고해주세요.](https://www.python.org/dev/peps/pep-0636/)

> **Note2**: 필자의 주관적인 생각이 일부 포함되어 있습니다.

<div style="width: 100%; display: flex; justify-content: center;">
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Pattern matching has been accepted for Python. The Python steering council has accepted the controversial proposal to add a pattern-matching primitive to the language. Details can be found here: <a href="https://t.co/f2kvo3SwP2">https://t.co/f2kvo3SwP2</a></p>&mdash; Python Software Foundation (@ThePSF) <a href="https://twitter.com/ThePSF/status/1360000940456218624?ref_src=twsrc%5Etfw">February 11, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

2021년 2월, 파이썬에 패턴 매칭 문법이 추가되는 것이 확정되었습니다.

이 글을 작성하는 시점 기준으로 아직 알파 릴리즈 단계인 파이썬 3.10에 패턴 매칭 문법이 공식적으로 포함될 예정이고, 현재는 [3.10a6 알파 릴리즈](https://www.python.org/downloads/release/python-3100a6/)를 통해서 패턴 매칭을 맛볼 수 있습니다.

그런데 이것이 그냥 파이썬에 새 기능 하나가 추가되었다, 정도로 넘어가기에는 꽤나 복잡한 뒷 얘기가 있습니다. 이 글에서는 파이썬에 패턴 매칭이 도입되기까지의 이야기들을 단편적인 수준에서 살펴보려 합니다.

## 패턴 매칭에 대한 요구

파이썬에 있어 다중 분기 조건(`multi-branch-conditonal problem`)을 처리할 수 있는 문법에 대한 요구는 늘상 존재했습니다([PEP 275](https://www.python.org/dev/peps/pep-0275/), [PEP 3103](https://www.python.org/dev/peps/pep-3103/)). C 또는 JAVA를 먼저 배우고 파이썬 생태계로 넘어온 개발자라면 왜 파이썬에는 `switch`가 없지? 하고 한번쯤은 생각해본 적이 있을 것입니다.

C와 JAVA의 `switch/case` 문법이 단순히 if/else if/else를 다르게 표현하는 방식이라면,
함수형 패러다임을 적용한 Haskell, Erlang, Elixir와 같은 언어들에는 더 복잡한 데이터 분기를 우아하게 처리하기 위한 패턴 매칭(Pattern Matching) 문법이 존재합니다. 최근 많은 개발자들의 관심을 받고 있는 Rust에도 [패턴 매칭 문법이 존재하죠](https://doc.rust-lang.org/book/ch18-03-pattern-syntax.html).

```rust
// Rust pattern matching syntax
fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        Point { x, y: 0 } => println!("On the x axis at {}", x),
        Point { x: 0, y } => println!("On the y axis at {}", y),
        Point { x, y } => println!("On neither axis: ({}, {})", x, y),
    }
}
```

물론 파이썬에서도 `Sequence unpacking`을 이용하면 패턴 매칭과 부분적으로 유사한 기능을 수행할 수 있습니다.

```python
seq = [1, 2]
a, b = seq
print(f"a: {a}, b: {b}")
# a: 1, b: 2
```

```python
cmd = "buy apple coke milk"
action, *stuffs = cmd.split()
if action == "buy":
    for stuff in stuffs:
        print(stuff)

# apple
# coke
# milk
```

그렇지만 이는 흔히 우리가 생각하는 패턴 매칭에 비해 매우 부족한 기능이었기에, 새로운 패턴 매칭 문법에 대한 요구가 계속적으로 나올 수밖에 없는 상황이었습니다.

## 패턴 매칭 아이디어의 역사

그럼 패턴 매칭에 대한 역사적인 흐름을 간단히 살펴볼까요?

2001년과 2006년에 각각 제안된 [PEP 275](https://www.python.org/dev/peps/pep-0275/)와 [PEP 3103](https://www.python.org/dev/peps/pep-3103/)이 단순히 파이썬에 `switch/case`구문을 추가하자는 내용이었던 한편,
2010년부터는 우리가 흔히 떠올리는 패턴 매칭 형태의 문법을 파이썬에 추가하자는 논의가 산발적으로 발생했습니다.

- [ML Style Pattern Matching for Python (2010)](https://groups.google.com/g/python-ideas/c/kuoWgMl7LrI/discussion)
- [PEP-3151 pattern-matching (2011)](https://groups.google.com/g/python-ideas/c/GYVAzJeDWCc/discussion)
- [Yet another Switch-Case Syntax Proposal (2014)](https://groups.google.com/g/python-ideas/c/J5O562NKQMY/discussion)
- [Pattern Matching (2015)](https://groups.google.com/g/python-ideas/c/Rn7df0cq0Kk/discussion)

그리고 이 모든 논의는 뚜렷한 결론이 나지 않은 채로 끝났습니다🤔.

그러다 2016년, 파이썬의 창시자인 Guido가 패턴 매칭 도입에 대한 의견을 제시했습니다 ([Match statement brainstorm](https://lwn.net/Articles/693493/)). 제 생각으로는 이때부터 Guido가 패턴 매칭을 도입하고자 하는 생각을 구체화한 게 아닐까 싶은데요.

그렇지만 패턴 매칭이 단지 if/else의 변형이 아니냐는 의견들 때문에 Guido도 패턴 매칭의 필요성을 확신하지 못했던 듯합니다. 파이썬의 격언 중 하나인 _["모든 문제에는 바람직한 하나의 해결책이 있다."](https://www.python.org/dev/peps/pep-0020/)_ 를 위반하기 때문이죠.

> **_"솔직히 나도 아직 확신이 없습니다!"_ <br/>**
_"Honestly I'm not at all convinced either!"_ <br/>
\- [@Guido van Rossum](https://groups.google.com/g/python-ideas/c/aninkpPpEAw/m/YGoXBkXUAgAJ)

그러다보니 이 글이 올라온 이후 다시 패턴 매칭에 대한 의견은 긴 시간 동안 표류합니다.
간간히 [패턴 매칭에 대한 글](https://tobiaskohn.ch/index.php/2018/09/18/pattern-matching-syntax-in-python/)이 올라오기는 했습니다만,
이 당시의 파이썬 코어 개발자들의 주요 관심사는 [Type hints](https://ryanking13.github.io/2018/07/12/python-37-whats-new.html#typing%EC%9D%98-%EB%B0%9C%EC%A0%84)나 [Coroutine](https://docs.python.org/3/whatsnew/3.6.html#whatsnew36-pep525) 같은 부분들이었던 것으로 보입니다.

또 한편으로는 패턴 매칭 구문이 워낙 첨예하게 의견이 갈리는 주제였기 때문에,
Guido가 충분한 시간을 두고 논의하고 싶었던 것으로도 생각됩니다.

2018년 당시 파이썬 커뮤니티에서는 파이썬 3.8에 [PEP 572](https://www.python.org/dev/peps/pep-0572/)인 walrus operator(`:=`)를 도입하는 데 [격한 논쟁](https://lwn.net/Articles/757713/)이 벌어졌었고,
이 사건이 Guido가 자비로운 종신독재자(BDFL, Benevolent Dictator for Life)자리에서 은퇴하는데까지 영향을 미쳤던 바 있습니다.
그렇기에 Guido는 같은 사태를 반복하지 않기 위해 패턴 매칭에 관해서는 충분히 논의를 거치고 싶었던 것으로 보입니다.

> **_"우리 좀 더 천천히 논의해보면 어떨까요?"_ <br/>**
_"Can I recommend going slow here?"_ <br/>
**_"제가 PEP 572 사태에서 배운 점이 한 가지 있다면, 그건 제안을 평가하고 논의하는 방법을 조정해야 한다는 것입니다."_<br/>**
_"If I've learned one thing from PEP 572 it's that we need to adjust how we discuss and evaluate proposals."_ <br/>
\- [@Guido van Rossum](https://groups.google.com/g/python-ideas/c/nqW2_-kKrNg/m/63-cVM_xBAAJ)

그렇게 지지부진하게 끝나는 듯 했던 패턴 매칭 도입은 2020년에 큰 변곡점을 맞게 됩니다.

## PEP 622의 등장

2020년 6월 23일, 파이썬의 창시자인 Guido는 4명의 공동 저자와 함께, 패턴 매칭 도입에 대한 내용을 담은 [PEP 622: Structural Pattern Matching](https://lwn.net/ml/python-dev/CAP7+vJLdGgbQ5kozPjMi5hCTmEZ5cr+8MFOoY_bNCT0pHTZNwg@mail.gmail.com/)를 발표합니다. 내용이 너무 길어서 메일에 본문을 넣는 대신 따로 리드미를 적어둘 정도로 정성을 들인 PEP였습니다.

마땅한 전조가 없었던[^RETIREMENT] 갑작스러운 PEP 622의 발표에 파이썬 코어 개발자들은 좋은 의미에서든 안 좋은 의미에서든 아주 뜨거운 관심을 보였습니다. PEP 622를 공개한 메일의 답장 스레드만 해도 상당한 개수일 정도였죠.

[^RETIREMENT]: 2019년 11월 Guido가 Dropbox에서의 은퇴를 발표했기 때문에, 이때를 계기로 벼르고 있던 작업을 시작한 것이 아닌가 하는 것 정도만 추측해 볼 수 있습니다.

PEP 622에는 굉장히 상세하게 패턴 매칭 문법이 정의되어 있었고,
이러한 문법이 기존의 파이썬 문법과 상당히 다른 해석 방식을 가지고 있었기 때문에,
개발자들의 의견이 첨예하게 갈렸습니다.

```python
match event.get():
    case Click((x, y), button=Button.LEFT):  # This is a left click
        handle_click_at(x, y)
    case Click():
        pass  # ignore other clicks
    case _:
        handle_other_cases()
```

>  **_"갑자기 `Point(x, 0)` 가 `Point.__new__`를 호출하지도 않고, `x`라는 변수를 찾는 것도 아니라는 게 직관적이지 않습니다."_** <br />
_"... there's a cognitive overhead because [suddenly] `Point(x, 0)` means something entirely different (it doesn't call Point.__new__, it doesn't lookup `x` in the locals or globals...)."_ <br/>
\- [@Antoine Pitrou](https://groups.google.com/g/python-ideas/c/nqW2_-kKrNg/m/63-cVM_xBAAJ)

마치 클래스를 생성하는 것 같은 ( `Click()` ) 묘한 작성법이라던가, 와일드카드인 `_`에 대해서도 불만을 표하는 사람들이 많았습니다.

```python
case Point(?x, 0):
```

그렇다보니 대표적으로는 변수와 바인딩을 구분하기 위해 `?`를 붙이자던가,

```python
case 200:
    ...
else:
    ...
```

와일드카드 `_` 대신 `else`를 쓰자던가 하는 문법적 의견들부터,

애초에 [패턴 매칭이 필요한가](https://lwn.net/ml/python-dev/24697a2a-269d-fcb9-5eab-2e0fea4dbfc4@hotpy.org/)라는 도돌이표같이 반복되는 의견까지 다양한 생각들이 난립했습니다.[^Firestorm]

[^Firestorm]: Guido는 이를 firestorm of feedback이라고 표현했습니다😂

> 그 외에도 PEP 622에 대한 다양한 개발자들의 의견을 [여기](https://lwn.net/Articles/827179/)에서 살펴볼 수 있습니다.

단기간에 워낙 많은 의견들이 쏟아지자 Guido는 공통적인 의견들을 모아 정리하면서 [시간을 가지고 천천히 합의점에 도달한 뒤](https://lwn.net/ml/python-dev/CAP7+vJLRRujd1KsZ8aBK0yNqomJaYQGzCyOVT9jJQBmdWdz_7w@mail.gmail.com/) 다시 논의를 이어가자고 말하게 됩니다.

## 이어지는 논쟁과 PEP 622 v2

조금 시간이 흘러 7월 1일, Guido는 PEP 


















## 끝나지 않은




당연히 파이썬에도 패턴 매칭을 도입하고자 하는 [의견들이 끊임없이 있었지만](https://lwn.net/Articles/838600/),
이것이 이미 성숙한 파이썬 문법에 있어 큰 문법적 변화를 변화를 가져와야하는 것이었기 때문에, [많은 이들의 우려와 반대가 있었습니다](https://discuss.python.org/t/gauging-sentiment-on-pattern-matching/5770). 

> _"이제 파이썬에 새로운 문법을 추가하는 것은 아주 높은 허들을 두어야 한다고 생각합니다. 이미 파이썬은 개념적으로 굉장히 거대하고, 새로운 기능을 추가한다는 것은 누군가의 파이썬 코드를 읽기 위해 새로운 컨셉을 배워야한다는 것을 의미합니다."_ <br/>
_"I think the bar for adding new syntax to Python at this point in its life should be set very high. The language is already conceptually pretty large, and every new feature means new concepts one must learn if one is to read an arbitrary blob of someone else’s Python code."_ <br/>
_"나는 패턴 매칭을 추가함으로써 얻는 이득보다는 새로 생기는 개념적 부하가 더 크다고 생각합니다."_ <br/>
_"To me, pattern matching doesn’t seem like it’s anywhere near big enough a win to be worth its enormous new conceptual load."_ <br/>
\- @Larry Hastings (CPython core developer)

이미 파이썬 코어 개발자들은 파이썬 3.8에서 walrus operator(:=)를 도입하는 데도 [격한 논쟁](https://lwn.net/Articles/757713/)을 벌였었고,
이것이 파이썬의 창립자인 Guido가 자비로운 종신독재자(BDFL, Benevolent Dictator for Life)에서 은퇴

 ~. 새로운 문법을 추가하는데에 더 보수적으로 접근했던 걸 수도 있을 것 같구요.




### References

> https://lwn.net/Articles/845480/
> https://lwn.net/Articles/838600/
> https://www.python.org/dev/peps/pep-0622/
> https://www.python.org/dev/peps/pep-0634
> https://www.python.org/dev/peps/pep-0635/
> https://www.python.org/dev/peps/pep-0636/
> https://github.com/gvanrossum/patma
