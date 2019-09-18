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

드롭박스는 파이썬의 헤비 유저입니다. 드롭박스의 백엔드 서비스와 데스크톱 클라이언트 앱에서 가장 많이 사용되고 있는 언어가 파이썬입니다 (Go, Typescript, 그리고 Rust 역시도 많이 사용합니다.). 그러나 수백만 줄의 파이썬 코드로 구성된 드롭박스 서비스의 거대한 크기를 고려하면, 파이썬의 동적 타이핑은 코드를 이해하기 어렵게 만들고 이는 생산성에 지대한 영향을 줍니다. 이러한 문제를 해결하기 위해여, 우리는 가장 널리 알려진 파이썬 타입 체커인 mypy를 사용하여, 점진적으로 정적 타입 검사를 도입하기 시작했습니다. (mypy는 오픈소스 프로젝트이며, 핵심 개발팀이 드롭박스에 고용되어 있습니다.)

이정도로 거대한 규모에서 파이썬에 정적 타입 검사를 도입한 것은 드롭박스가 거의 최초였습니다. 지금에서야 수천 개의 프로젝트들이 mypy를 사용하고 있으며, 충분히 실환경에서 검증된 상태입니다. 그러나 현재의 수준에 이르기까지는 수많은 문제와 실패가 있었습니다. 이 글은 제 대학 연구 프로젝트에서 시작한 파이썬 정적 타입 검사가, 이제는 파이썬 커뮤니티의 수많은 개발자들이 사용하는 자연스러운 일이 될 때까지의 여정을 다룹니다. 현재는 다양한 IDE 및 코드 분석 도구에서 파이썬 정적 타입 검사 기능을 지원하고 있습니다.

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

mypy는 제가 드롭박스에 들어오기 몇년전, 영국 캠브릿지 대학에서 시작되었습니다. 저는 박사과정에서 정적 타입 언어와 동적 타입 언어를 합치는 연구를 하고 있었습니다. Siek과 Taha의 [gradual typing]() 과 [Typed Racket]()의 영향을 받아, 하나의 프로그래밍 언어를 작은 스크립트에서 수백만줄의 코드베이스에서도 

The story of mypy begins in Cambridge, UK, several years before I joined Dropbox. I was looking at somehow unifying statically typed and dynamic languages as part of my PhD research. Inspired by work such as Siek and Taha’s gradual typing and Typed Racket, I was trying to find ways to make it possible to use the same programming language for projects ranging from tiny scripts to multi-million line sprawling codebases, without compromising too much at any point in the continuum. An important part of this was the idea of gradual growth from an untyped prototype to a battle-tested, statically typed product. To a large extent, these ideas are now taken for granted, but it was an active research problem back in 2010.

타입 검사에 대한 제 초기 연구는 파이썬을 타겟으로 한 것이 아니었습니다. 대신 제가 직접 만든 `Alore`라는 언어를 사용했습니다. 
My initial work on type checking didn’t target Python. Instead I used a home-grown, small language called Alore. Here is an example to give you an idea of what it looked like (the type annotations are optional):

```
def Fib(n as Int) as Int
  if n <= 1
    return n
  else
    return Fib(n - 1) + Fib(n - 2)
  end
end
```

Using a simplified, custom language is a common research approach, not least since it makes it quick to perform experiments, and various concerns not essential for research can be conveniently ignored. Production-quality languages tend to be large and have complicated implementations, making experimentation slow. However, any results based on a non-mainstream language are a bit suspect, since practicality may have been sacrificed along the way.

My type checker for Alore looked pretty promising, but I wanted to validate it by running experiments with real-world code, which didn’t quite exist for Alore. Luckily, Alore was heavily inspired by Python. It was easy enough to modify the checker to target Python syntax and semantics, making it possible to try type checking open source Python code. I also wrote a source-to-source translator from Alore to Python, and used it to translate the type checker. Now I had a type checker, written in Python, that supported a Python subset! (Certain design decisions that made sense for Alore were a poor fit for Python, which is still visible in parts of the mypy codebase.)

Actually, the language wasn’t quite Python at that point: it was a Python variant, because of certain limitations of the Python 3 type annotation syntax. It looked like a mixture of Java and Python:

```
int fib(int n):
    if n <= 1:
        return n
    else:
        return fib(n - 1) + fib(n - 2)
```

One of my ideas at the time was to also use type annotations to improve performance, by compiling the Python variant to C, or perhaps JVM bytecode. I got as far as building a prototype compiler, but I gave up on that, since type checking seemed useful enough by itself.

I eventually presented my project at the PyCon 2013 conference in Santa Clara, and I chatted about it with Guido van Rossum, the BDFL of Python. He convinced me to drop the custom syntax and stick to straight Python 3 syntax. Python 3 supports function annotations, so the example could be written like this, as a valid Python program:

```python
def fib(n: int) -> int:
    if n <= 1:
        return n
    else:
        return fib(n - 1) + fib(n - 2)
```

Some compromises were necessary (this is why I invented my own syntax in the first place). In particular, Python 3.3, the latest at that point, didn’t have variable annotations. I chatted about various syntax possibilities over email with Guido. We decided to use type comments for variables, which does the job, but is a bit clunky (Python 3.6 gave us a much nicer syntax):

```python
products = []  # type: List[str]  # Eww
```

Type comments were also handy for Python 2 support, which has no built-in notion of type annotations:

```python
def fib(n):
    # type: (int) -> int
    if n <= 1:
        return n
    else:
        return fib(n - 1) + fib(n - 2)
```

It turned out that these (and other) compromises didn’t really matter too much—the benefits of static typing made users quickly forget the not-quite-ideal syntax. Since type checked Python now had no special syntax, existing Python tools and workflows continued to work, which made adoption much easier.

Guido also convinced me to join Dropbox after finishing my PhD, and there begins the core of this story.

## Making types official (PEP 484)


We did the first serious experiments with mypy at Dropbox during Hack Week 2014. Hack Week is a Dropbox institution—a week when you can work on anything you want! Some of the most famous Dropbox engineering projects can trace their history back to a Hack Week. Our take-away was that using mypy looked promising, though it wasn’t quite ready for wider adoption yet.

An idea was floated around that time to standardize the type hinting syntax in Python. As I mentioned above, starting from Python 3.0, it has been possible to write function type annotations in Python, but they were just arbitrary expressions, with no designated syntax or semantics. They are mostly ignored at runtime. After Hack Week, we started work on standardizing the semantics, and it eventually resulted in PEP 484 (co-written by Guido, Łukasz Langa, and myself). The motivation was twofold. First, we hoped that the entire Python ecosystem would embrace a common approach for type hinting (Python term for type annotations), instead of risking multiple, mutually incompatible approaches. Second, we wanted to openly discuss how to do type hinting with the wider Python community, in part to avoid being branded heretics. As a dynamic language that is famous for “duck typing”, there was certainly some initial suspicion about static typing in the community, but it eventually subsided when it became clear that it’s going to stay optional (and after people understood that it’s actually useful).

The eventually accepted type hinting syntax was quite similar to what mypy supported at the time. PEP 484 shipped with Python 3.5 in 2015, and Python was no longer (just) a dynamic language. I like to think of this as a big milestone for Python.

## The migration begins

We set up a 3-person team at Dropbox to work on mypy in late 2015, which included Guido, Greg Price, and David Fisher. From there on, things started moving pretty rapidly. An immediate obstacle to growing mypy use was performance. As I implied above, an early goal was to compile the mypy implementation to C, but this idea was scrapped (for now). We were stuck with running on the CPython interpreter, which is not very fast for tools like mypy. (PyPy, an alternative Python implementation with a JIT compiler, also didn’t help.)

Luckily, there were algorithmic improvements to be had. The first big major speedup we implemented was incremental checking. The idea is simple: if all dependencies of a module are unchanged from the previous mypy run, we can use data cached from the previous run for the dependencies, and we only need to type check modified files and their dependencies. Mypy goes a bit further than that: if the external interface of a module hasn’t changed, mypy knows that other modules that import the module don’t need to be re-checked.

Incremental checking really helps when annotating existing code in bulk, as this typically involves numerous iterative mypy runs, as types are gradually inserted and refined. The initial mypy run would still be pretty slow, since many dependencies would need to be processed. To help with that, we implemented remote caching. If mypy detects that your local cache is likely to be out of date, mypy downloads a recent cache snapshot for the whole codebase from a centralized repository. It then performs an incremental build on top of the downloaded cache. This gave another nice performance bump.

This was a period of quick organic adoption at Dropbox. By the end of 2016, we were at about 420,000 lines of type-annotated Python. Many users were enthusiastic about type checking. The use of mypy was spreading quickly across teams at Dropbox.

Things were looking good, but there was still a lot of work to be done. We started running periodic internal user surveys to find pain points and to figure out what work to prioritize (a habit that continues to this day). Two requests were clearly at the top: more type checking coverage, and faster mypy runs. Clearly our performance and adoption growth work was not yet done. We doubled down on these tasks.

## More performance!

Incremental builds made mypy faster, but it still wasn’t quite fast. Many incremental runs took about a minute. The cause is perhaps not surprising to anybody who has worked on a large Python codebase: cyclic imports. We had sets of hundreds of modules that each indirectly import each other. If any file in an import cycle got changed, mypy would have to process all the files in the cycle, and often also any modules that imported modules from this cycle. One of these cycles was the infamous “tangle” that has caused much grief at Dropbox. At one point it contained several hundred modules, and many tests and product features imported it, directly or indirectly.

We looked at breaking the tangled dependencies, but we didn’t have the resources to do that. There was just too much code we weren’t familiar with. We came up with an alternative approach—we were going to make mypy fast even in the presence of tangles. We achieved this through the mypy daemon. The daemon is a server process that does two interesting things. First, it keeps information about the whole codebase in memory, so that each mypy run doesn’t need to load cache data corresponding to thousands of import dependencies. Second, it tracks fine-grained dependencies between functions and other constructs. For example, if function foo calls function bar, there is a dependency from bar to foo. When a file gets changed, the daemon first processes just the changed file in isolation. It then looks for externally visible changes in that file, such as a changed function signature. The daemon uses the fine-grained dependencies to only recheck those functions that actually use the changed function. Usually this is a small number of functions.

Implementing all this was a challenge, since the original implementation was heavily geared towards processing things a file at a time. We had to deal with numerous edge cases around what needs to be reprocessed when various thing change, such as when a class gets a new base class. After a lot of painstaking work and sweating the details, we were able to get most incremental runs down to a few seconds, which felt like a great victory.

## Even more performance!

Together with remote caching that I discussed above, mypy daemon pretty much solved the incremental use case, where an engineer iterates on changes to a small number of files. However, worst-case performance was still far from optimal. Doing a clean mypy build would take over 15 minutes, which was much slower than we were happy with. This was getting worse every week, as engineers kept writing new code and adding type annotations to existing code. Our users were still hungry for more performance, and we were happy to comply.

We decided to get back to one of the early ideas behind mypy—compiling Python to C. Experimenting with Cython (an existing Python to C compiler) didn’t give any visible speed-up, so we decided to revive the idea of writing our own compiler. Since the mypy codebase (which is written in Python) was already fully type annotated, it seemed worth trying to use these type annotations to speed things up. I implemented a quick proof-of-concept prototype that gave performance improvement of over 10x in various micro-benchmarks. The idea was to compile Python modules to CPython C extension modules, and to turn type annotations into runtime type checks (normally type annotations are ignored at runtime and only used by type checkers). We effectively were planning to migrate the mypy implementation from Python to a bona fide statically typed language, which just happens to look (and mostly behave) exactly like Python. (This sort of cross-language migration was becoming a habit—the mypy implementation was originally written in Alore, and later a custom Java/Python syntax hybrid.)

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

_Static analysis. We wrote a tool to infer signatures of functions using static analysis. It can only deal with sufficiently simple cases, but it helped us increase coverage without too much effort.

_Third party library support. A lot of our code uses SQLAlchemy, which uses dynamic Python features that PEP 484 types can’t directly model. We made a PEP 561 stub file package and wrote a mypy plugin to better support it (it’s available as open source).

## Challenges along the way

Getting to 4M lines wasn’t always easy and we had a few bumps and made some mistakes along the way. Here are some that will hopefully prevent a few others from making the same mistakes.

Missing files. We started with only a small number of files in the mypy build. Everything outside the build was not checked. Files were implicitly added to the build when the first annotations were added. If you imported anything from a module outside the build, you’d get values with the Any type, which are not checked at all. This resulted in a major loss of typing precision, especially early in the migration. This still worked surprisingly well, though it was a typical experience that adding a file to the build exposed issues in other parts of the codebase. In the worst case, two isolated islands of type checked code were being merged, and it turned out that the types weren’t compatible between the two islands, necessitating numerous changes to annotations! In retrospect, we should have added basic library modules to the mypy build much earlier to make things smoother.

Annotating legacy code. When we started, we had over 4 million lines of existing Python code. It was clear that annotating all of that would be non-trivial. We implemented a tool called PyAnnotate that can collect types at runtime when running tests and insert type annotations based on these types—but it didn’t see much adoption. Collecting the types was slow, and generated types often required a lot of manual polish. We thought about running it automatically on every test build and/or collecting types from a small fraction of live network requests, but decided against it as either approach is too risky.

In the end, most of the code was manually annotated by code owners. We provide reports of highest-value modules and functions to annotate to streamline the process. A library module that is used in hundreds of places is important to annotate; a legacy service that is being replaced much less so. We are also experimenting with using static analysis to generate type annotations for legacy code.

Import cycles. Previously I mentioned that import cycles (the “tangle”) made it hard to make mypy fast. We also had to work hard to make mypy support all kinds of idioms arising from import cycles. We recently finished a major redesign project that finally fixes most import cycle issues. The issues actually stem from the very early days of Alore, the research language mypy originally targeted. Alore had syntax that made dealing with import cycles easy, and we inherited some limitations from the simple-minded implementation (that was just fine for Alore). Python makes dealing with import cycles not easy, mainly because statements can mean multiple things. An assignment might actually define a type alias, for example, and mypy can’t always detect that until most of an import cycle has been processed. Alore did not have this kind of ambiguity. Early design decisions can cause you pain still many years later!

## To 5 million lines and beyond

It has been a long journey from the early prototypes to type checking 4 million lines in production. Along the way we’ve standardized type hinting in Python, and there is now a burgeoning ecosystem around Python type checking, with IDE and editor support for type hints, multiple type checkers with different tradeoffs, and library support.

Even though type checking is already taken for granted at Dropbox, I believe that we are still in early days of Python type checking in the community, and things will continue to grow and get better. If you aren’t using type checking in your large-scale Python project, now is a good time to get started—nobody who has made the jump I’ve talked to has regretted it. It really makes Python a much better language for large projects.

Are you interested in working on Developer Infrastructure at scale? We’re hiring!

---

### Reference

> https://blogs.dropbox.com/tech/2019/09/our-journey-to-type-checking-4-million-lines-of-python/amp/