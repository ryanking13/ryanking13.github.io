---
date: "2021-03-04T20:00:00+09:00"
title: 파이썬의 패턴 매칭 도입에 얽힌 이야기
categories:
- Python
description: 파이썬의 패턴 매칭 도입에 얽힌 이야기
summary: 파이썬에 새로 추가되는 패턴 매칭에 대한 이야기입니다.
draft: false
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
함수형 패러다임을 적용한 Haskell, Erlang, Elixir와 같은 언어들에는 더 복잡한 데이터 분기를 우아하게 처리하기 위한 패턴 매칭(Pattern Matching) 문법이 존재합니다.

```rust
// Rust의 패턴 매칭 문법
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

당연히 파이썬의 코어 개발자들도 패턴 매칭에 대한 다양한 생각을 가지고 있었고,
이러한 생각들은 [과거의 PEP(Python Enhancement Proposals)](https://www.python.org/dev/peps/)나 [구글 python-ideas 그룹](https://groups.google.com/g/python-ideas)에서 살펴볼 수 있습니다.

2001년과 2006년에 각각 제안된 (그리고 부결된) [PEP 275](https://www.python.org/dev/peps/pep-0275/)와 [PEP 3103](https://www.python.org/dev/peps/pep-3103/)이 단순히 파이썬에 `switch/case`구문을 추가하자는 내용이었다면,
2010년부터는 우리가 일반적으로 떠올리는 패턴 매칭 형태의 문법을 파이썬에 도입하자는 논의가 발생하기 시작했습니다.

- [ML Style Pattern Matching for Python (2010)](https://groups.google.com/g/python-ideas/c/kuoWgMl7LrI/discussion)
- [PEP-3151 pattern-matching (2011)](https://groups.google.com/g/python-ideas/c/GYVAzJeDWCc/discussion)
- [Yet another Switch-Case Syntax Proposal (2014)](https://groups.google.com/g/python-ideas/c/J5O562NKQMY/discussion)
- [Pattern Matching (2015)](https://groups.google.com/g/python-ideas/c/Rn7df0cq0Kk/discussion)

그러나 산발적으로 발생했던 이 모든 논의는 뚜렷한 결론이 나지 않은 채로 끝나고 맙니다.

그러다 2016년, 파이썬의 창시자인 Guido가 패턴 매칭 도입에 대한 본인의 의견을 제시합니다. ([Match statement brainstorm](https://lwn.net/Articles/693493/)). 제 생각으로는 이때부터 Guido가 패턴 매칭을 도입하고자 하는 생각을 구체화한 게 아닐까 싶은데요.

그렇지만 패턴 매칭이 단지 if/else의 변형이 아니냐는 의견들 때문에 Guido도 패턴 매칭의 필요성을 확신하지 못했던 듯합니다. 파이썬의 격언 중 하나인 _["모든 문제에는 바람직한 하나의 해결책이 있다."](https://www.python.org/dev/peps/pep-0020/)_ 를 위반하기 때문이죠.

> **_"솔직히 나도 아직 확신이 없습니다!"_ <br/>**
_"Honestly I'm not at all convinced either!"_ <br/>
\- [@Guido van Rossum](https://groups.google.com/g/python-ideas/c/aninkpPpEAw/m/YGoXBkXUAgAJ)

그러다보니 이 글이 올라온 이후 다시 패턴 매칭에 대한 의견은 긴 시간 동안 표류합니다.
간간히 [패턴 매칭에 대한 글](https://tobiaskohn.ch/index.php/2018/09/18/pattern-matching-syntax-in-python/)이 올라오기는 했습니다만,
이 당시의 파이썬 코어 개발자들의 주요 관심사는 [Type hints](https://ryanking13.github.io/2018/07/12/python-37-whats-new.html#typing%EC%9D%98-%EB%B0%9C%EC%A0%84)나 [Coroutine](https://docs.python.org/3/whatsnew/3.6.html#whatsnew36-pep525) 같은 기능이었기에 패턴 매칭은 큰 관심을 받지 못했던 것으로 생각됩니다.

또 한편으로는 패턴 매칭 구문이 워낙 첨예하게 의견이 갈리는 주제였기 때문에,
Guido가 충분한 시간을 두고 논의하고 싶어했던 점도 있습니다.

2018년 당시 파이썬 커뮤니티에서는 파이썬 3.8에 [PEP 572](https://www.python.org/dev/peps/pep-0572/)인 walrus operator(`:=`)를 도입하는 데 [격한 논쟁](https://lwn.net/Articles/757713/)이 벌어졌었고,
이 사건이 Guido가 자비로운 종신독재자(BDFL, Benevolent Dictator for Life)자리에서 은퇴하는데까지 영향을 미쳤던 바 있습니다.
그렇기에 Guido는 같은 사태를 반복하지 않기 위해 패턴 매칭에 관해서는 충분히 논의를 거치고 싶어했던 것을 확인할 수 있습니다.

> **_"우리 좀 더 천천히 논의해보면 어떨까요?"_ <br/>**
_"Can I recommend going slow here?"_ <br/>
<br/>
**_"제가 PEP 572 사태에서 배운 점이 한 가지 있다면, 그건 제안을 평가하고 논의하는 방법을 조정해야 한다는 것입니다."_<br/>**
_"If I've learned one thing from PEP 572 it's that we need to adjust how we discuss and evaluate proposals."_ <br/>
\- [@Guido van Rossum](https://groups.google.com/g/python-ideas/c/nqW2_-kKrNg/m/63-cVM_xBAAJ)

그렇게 지지부진하게 끝나는 듯 했던 파이썬에의 패턴 매칭 도입은 2020년에 큰 변곡점을 맞게 됩니다.

## PEP 622의 등장

2020년 6월 23일, Guido는 4명의 공동 저자와 함께, 패턴 매칭 도입에 대한 내용을 담은 [PEP 622: Structural Pattern Matching](https://lwn.net/ml/python-dev/CAP7+vJLdGgbQ5kozPjMi5hCTmEZ5cr+8MFOoY_bNCT0pHTZNwg@mail.gmail.com/)를 발표합니다. 내용이 너무 길어서 메일에 본문을 넣는 대신 따로 리드미를 적어둘 정도로 정성을 들인 PEP였습니다.

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

>  **_"`Point(x, 0)` 가 `Point.__new__`를 호출하지도 않고, `x`라는 변수를 찾는 것도 아닌 완전히 새로운 의미를 갖는다는 게 직관적이지 않습니다."_** <br />
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

단기간에 워낙 많은 의견들이 쏟아지자 Guido는 PEP 622가 공개된 다음날 공통적인 의견들을 모아 정리하면서 [시간을 가지고 천천히 합의점에 도달한 뒤](https://lwn.net/ml/python-dev/CAP7+vJLRRujd1KsZ8aBK0yNqomJaYQGzCyOVT9jJQBmdWdz_7w@mail.gmail.com/) 다시 논의를 이어가자는 메일을 개발자들에게 전송합니다.

## 이어지는 논쟁

PEP 622가 공개된 지 약 일주일 정도가 흐른 7월 1일,
Guido는 PEP 622에 기반하여 패턴 매칭을 구현한 파이썬 커널인 ["playground"](https://mybinder.org/v2/gh/gvanrossum/patma/master?urlpath=lab/tree/playground-622.ipynb)을 공유하여 개발자들이 직접 패턴 매칭을 시험해볼 수 있도록 공개합니다.

그런데 이것이 패턴 매칭에 회의적인 생각을 가지고 있던 일부 개발자들의 역린을 건드리고 맙니다.

보통 파이썬에 새로운 기능이 추가되는 절차는 아래와 같은데요.

- 새로운 아이디어가 사람들의 관심을 얻고
- 누군가가 해당 아이디어를 열심히 PEP로 정리하여 공개하고
- 해당 PEP가 충분한 논의를 거치면서
- 최종적으로 합의에 도달하면
- 누군가가 해당 기능을 구현한다

PEP 622가 공개되고 아직까지 뜨거운 감자인 상태인데도 불구하고, 일주일 겨우 지난 시점에
완전한 구현체를 공개하는 것은 이미 PEP 622 통과를 상정하고 진행하는 것이 아니냐는 것이었죠.

>  **_"PEP 622는 이미 잘 구현된 상태에서 파이썬 커뮤니티에 제안되었습니다. 이미 기정 사실인 것처럼요."_** <br />
_"PEP 622 only seems to have been presented to the Python 
community only *after* a well-developed (if not finalised) 
implementation was built.  A fait accompli."_ <br />
<br/>
**_"그리고 이 PEP는 Guido의 권위를 업고 있으니, 십중팔구 결국에는 거의 그대로 통과되겠죠"_** <br/>
_"And since the PEP has Guido's authority behind it, I think 
it is likely that it will eventually be accepted pretty much as it was 
originally written."_ <br/>
<br/>
**_"그럼 우리가 개발자 채널에서 했던 수많은 토론들은 그저 헛수고에 그치겠죠."_** <br/>
_"This means that most of the discussion we have seen on python-dev (and 
there has been a lot) will end up being just pissing in the wind."_ <br/>
<br/>
**_"Guido의 [2번째 메일](https://lwn.net/ml/python-dev/CAP7+vJLRRujd1KsZ8aBK0yNqomJaYQGzCyOVT9jJQBmdWdz_7w@mail.gmail.com/)은 저한테는 이런 의미로 들리네요. '그래 그래 알아서들 떠들고, 우리는 열심히 개발할 테니 방해 좀 그만해'"_** <br/>
_"And Guido's 2nd email ("PEP 
622: Structural Pattern Matching -- followup") already to me (YMMV) 
reads rather like 'OK, you've had your fun, now try not to joggle our 
elbows too much while we get on with the work'."_ <br />
\- [@Rob Cliffe](https://lwn.net/ml/python-dev/d3bb7d78-6e30-92eb-6a9a-230212514e71@btinternet.com/)

물론 구현체의 공개를 긍정적으로 평가하는 의견들도 있었습니다.

> **_"이 PEP는 아직 초안이고 승인된 게 아닙니다. 아주 일반적인 절차대로 진행되고 있으니 걱정마세요 :)"_** <br/>
_"The PEP is still a draft and has not been accepted. Don't worry, the
normal process is still happening :)"_ <br/>
<br/>
**_"레퍼런스용 구현체를 공개하는건 아주 큰 도움이 됩니다. 사람들이 그걸 직접 만져보고 살펴볼 수 있으니까요."_** <br/>
_"Having a reference implementation is a HUGE help, because people can
play around with it."_ <br/>
<br/>
**_"물론 레퍼런스용 구현체가 필수는 아니지만, 이는 분명 도움이 되는 일이고 절대 안 좋은 것이 아닙니다." <br/>_**
_"Having a reference implementation isn't necessary, of course, but it's
definitely a benefit and not a downside."_ <br/>
\- [@Chris Angelico](https://lwn.net/ml/python-dev/CAPTjJmoxsLNGjvSkmV1WPikpVrQ9opoqGvj2RJw78Q-wdznJ4w@mail.gmail.com/)

## PEP 622 v2

많은 논쟁을 뒤로한 채, Guido는 다시 일주일이 지난 7월 8일 [PEP 622의 두번째 버전](https://lwn.net/ml/python-dev/CAP7+vJ+sAp3pXF90OJ9Moy0OfP7BX3rDVbsy005oA3MCf5ayBA@mail.gmail.com/)을 공개합니다.

사람들의 제안을 일부 수용하여 수정한 PEP 622 v2였지만,
그럼에도 불구하고 Guido의 스탠스는 꽤나 강경하게 느껴졌습니다.

> **_"새로운 버전에 드라마틱한 차이점은 없습니다."_** <br/>
_"That said, the new version does not differ dramatically in what we
propose."_
<br/><br/>
**_"왜냐구요? 제안을 통과시키기 위해 더 근본적인 것을 포기하는 것은 나쁜 전략이기 때문입니다."_**<br/>
_"Why is that? it seems a bad tactic not to give up
something more substantial in order to get this proposal passed."_
<br/><br/>
**_"언어 디자인은 정치가 아닙니다. 수학도 아니구요. 당장의 최저 임금을 올리기 위해 미래의 연금을 포기해야하는 상황도 아니라고 생각합니다."_** <br/>
_"Language design is not like politics. It’s not like mathematics
either, but I don’t think this situation is at all similar to
negotiating a higher minimum wage in exchange for a lower pension"_
<br/><br/>
**_"그러므로 저는 당장 승인되기 위해 이 기능을 더 못나게 만드는 것은 옳지 않다고 생각합니다._** <br/>
_"So I don’t think it’s right to propose making
the feature a little bit uglier just to get it accepted."_<br/>
\- [@Guido Van Rossum](https://lwn.net/ml/python-dev/CAP7+vJ+sAp3pXF90OJ9Moy0OfP7BX3rDVbsy005oA3MCf5ayBA@mail.gmail.com/)

또한 PEP 622 v2에서 Guido는 논란이 되었던 와일드카드 `_`나 OR 조건 `|` 같은 요소들이 대다수의 다른 언어에서 동일하게 차용되고 있다는 점을 들어 사람들을 설득합니다.

여전히 몇몇 사람들은 PEP 622에 대해 [부정적인](https://lwn.net/ml/python-dev/e6168cb4-7a2d-35c9-823b-f38f08445b8d@hastings.org/) 의견을 [나타냈으나](https://github.com/markshannon/pep622-critique), Guido는 계속 같은 얘기들로 소모적인 논쟁을 하기를 [거부](https://lwn.net/ml/python-dev/CAP7+vJKxTPyvsZWCDGU7SZcoH3GPQSMBV4mMrjbTTyTeTnoAyA@mail.gmail.com/)합니다.

이렇게 결국 패턴 매칭의 운명은 [Guido의 은퇴 후 파이썬의 최종 의사결정 기관](https://lwn.net/Articles/775105/)이 된 [Python Steering Council](https://github.com/python/steering-council)의 손으로 넘어가게 됩니다.

## PEP 622 is dead, long live PEP 634, 635, 636

Python Steering Council은 PEP 622의 작성자들과 함께 [논의를 진행](https://github.com/python/steering-council/blob/master/updates/2020-11-02-steering-council-update.md#august-recap)하였고,
그 결과 PEP 622의 발표로부터 약 세 달이 지난 10월 22일, Guido는 PEP 622를 대체할 세 개의 새로운 PEP를 공개하였습니다.

- [PEP 634: Structural Pattern Matching: Specification](https://www.python.org/dev/peps/pep-0634/)
- [PEP 635: Structural Pattern Matching: Motivation and Rationale](https://www.python.org/dev/peps/pep-0635/)
- [PEP 636: Structural Pattern Matching: Tutorial](https://www.python.org/dev/peps/pep-0636/)

이는 각각 패턴 매칭의 문법과 디자인 초이스, 그리고 사용 예시를 나타낸 PEP였습니다.

문법적인 측면에서만 보면 세세한 디테일에서 약간의 차이가 있었지만, 결과적으로는 기존의 제안과 거의 바뀌지 않은 내용이었죠.[^PEP634]

[^PEP634]: Guido는 새로운 세 개의 PEP를 공개하면서 기존 PEP 622를 `there were a lot of problems with the text`라고 표현했습니다. 

## Hello, Pattern Matching!

그리고 마침내 2021년 2월 8일, Python Steering Council은 PEP 634, 635, 636을 승인한다고 발표합니다.

> **_"패턴 매칭은 파이썬에 있어 아주 큰 변화이고, 모든 커뮤니티 구성원들의 동의를 얻는 것이 불가능함을 알고 있습니다."_** <br/>
_"We acknowledge that Pattern Matching is an extensive change to Python and that reaching consensus across the entire community is close to impossible."_
<br/><br/>
**_"그럼에도 불구하고, 충분히 많은 숙고를 거치고, 모든 사람들의 의견을 들어보고, 그리고 PEP 작성자들과의 개별 토론까지 거친 후에, 우리는 패턴 매칭이 파이썬 언어에 큰 보탬이 되리라 확신하게 되었습니다."_**<br/>
_"In spite of this, after much deliberation, reviewing all conversations around these PEPs, as well as competing proposals and existing poll results, and after several in-person discussions with the PEP authors, we are confident that Pattern Matching as specified in PEP 634, et al, will be a great addition to the Python language."_<br/>
\- [@Python Steering Council](https://lwn.net/Articles/845480/)

## 아직 끝나지 않은 이야기

이제 우리는 [2021년 10월에 정식 릴리즈될](https://www.python.org/dev/peps/pep-0619/) 파이썬 3.10에서부터 패턴 매칭을 사용할 수 있게 되었습니다.
그러나 여전히 패턴 매칭에 대한 의견은 분분한 상태입니다.

2020년 11월, 패턴 매칭이 정식으로 채택되기 전 CPython 커미터(Committer)들 사이에서 진행한 [투표](https://discuss.python.org/t/gauging-sentiment-on-pattern-matching/5770)에서,
44%의 개발자들은 패턴 매칭을 원하지 않는다고 답했습니다.

<div style="text-align: center;">
	<div>
    <div><img src="/assets/post_images/python_pattern_matching_poll.PNG" /></div>
	</div>
</div>

해당 투표에 댓글로 남겨진 파이썬 코어 개발자 Larry Hastings의 글을 끝으로 이 글을 마무리하려 합니다.

> **_"이제 파이썬에 새로운 문법을 추가하는 것은 아주 높은 허들을 두어야 한다고 생각합니다. 이미 파이썬은 개념적으로 굉장히 거대하고, 새로운 기능을 추가한다는 것은 누군가의 파이썬 코드를 읽기 위해 새로운 컨셉을 배워야한다는 것을 의미합니다."_** <br/>
_"I think the bar for adding new syntax to Python at this point in its life should be set very high. The language is already conceptually pretty large, and every new feature means new concepts one must learn if one is to read an arbitrary blob of someone else’s Python code."_ <br/>
<br/>
**_"나는 패턴 매칭을 원하지 않는다에 투표합니다."_**<br/>
_"I voted for I don’t want pattern matching."_ <br/>
\- [@Larry Hastings](https://discuss.python.org/t/gauging-sentiment-on-pattern-matching/5770/21)

이 글을 읽는 여러분의 생각은 어떠신가요?

### References

> https://lwn.net/Articles/845480/ <br/>
https://lwn.net/Articles/828486/ <br/>
https://lwn.net/Articles/838600/ <br/>
https://www.python.org/dev/peps/pep-0622/ <br/>
https://www.python.org/dev/peps/pep-0634/ <br/>
https://www.python.org/dev/peps/pep-0635/ <br/>
https://www.python.org/dev/peps/pep-0636/ <br/>
https://github.com/gvanrossum/patma
