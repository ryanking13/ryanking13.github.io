---
date: "2021-07-11T00:00:01+09:00"
title: 파이썬 패키징의 과거, 현재, 그리고 미래 
description: 파이썬 패키징의 과거, 현재, 그리고 미래 
summary: 파이썬 패키징의 역사 및 최근 동향을 소개합니다.
draft: false
categories:
- Python
---

## 들어가며

올해 초, 파이썬 패키지 설치 도구인 `easy_install`을 삭제하는 [PR](https://github.com/pypa/setuptools/pull/2544/files)이 머지되었습니다.
2017년도에 [해당 안건](https://github.com/pypa/setuptools/issues/917)이 제시된지 4년 만에 일어난 일입니다.

<div style="text-align: center;">
<img src="https://media.giphy.com/media/KEkOcB5DJ4E4bhou9T/giphy.gif">
<div>
    <span style="color:grey"><small><i>RIP easy_install (GIPHY)</i></small></span>
</div>
</div>

제가 파이썬을 처음 사용하기 시작한 것은 2016년 즈음이었는데요.
당시에는 파이썬 패키지를 설치할 때 pip을 사용하는 방법과
easy_install을 사용하는 방법이 병기되어 있는 문서가 많았습니다.
그래서 당시 파이썬을 잘 모르는 입장에서 easy_install이 이름처럼
pip보다 좀 더 간편한 방법이겠거니하고 생각했던 적이 있었습니다.
얼마 지나지 않아 그렇지 않다는 것을 알게되었지만요.

최근 머신러닝붐에 힘입어 파이썬의 인기가 크게 상승하면서,
새로 파이썬을 배우신 분들이라면
easy_install이라는 도구를 처음 들어보실 수도 있을 것 같은데요.
이 글에서는 easy_install의 죽음을 맞아(?)
파이썬 패키징의 역사를 정리해보고자 합니다.
 
 > **Note:** 이 글은 대부분 과거의 자료들을 기반으로 하였지만, 글쓴이의 생각으로 엮은 부분이 일부 있습니다.
 오류라고 생각되는 부분이 있다면 댓글 또는 def6488@gmail.com으로 알려주세요.
  
  ## 1. `distuils`: 파이썬 패키징의 시작
  
  > [PEP 229: Using Distutils to Build Python](https://www.python.org/dev/peps/pep-0229/)
  
  파이썬은 지금으로부터 약 30년 전인 1991년도에 처음 만들어졌습니다.
  이게 컴퓨터 업계에서 얼마나 옛날인가 하면,
  파이썬의 탄생이 Java의 탄생보다 [5년](https://en.m.wikipedia.org/wiki/Java_version_history)이나 빠르고,
  구글 검색엔진이 만들어진 시기보다도 [6년](https://en.m.wikipedia.org/wiki/History_of_Google)이나 빠릅니다.
  
  그렇다보니 지금은 웬만한 프로그래밍 언어에는 개발자들을 위한 패키지 저장소가 딸려있는 것이 당연하게 여겨지지만,
  이 당시 파이썬 생태계에는 패키지 저장소는 커녕,
  패키지를 검색할 수 있는 제대로 된 검색엔진조차도 없었습니다.
 
<div style="text-align: center;">
<img src="/assets/post_images/python-packaging/parnassus.png" width="70%">
<div>
    <span style="color:grey"><small><i>Vaults Of Parnassus (2006)</i></small></span>
</div>
</div>

  그래서 이 당시 파이썬 개발자들은 [파르나소스의 금고(Vaults Of Parnassus)](https://wiki.python.org/moin/VaultsOfParnassus)라는
  일종의 커뮤니티 사이트를 통해서 패키지를 공유했습니다.
  문제는 파이썬 패키지를 설치하는 정해진 방법이 없다보니 각자 설치법을 담은 문서를 패키지와 함께 공유하는 수밖에 없었습니다.
  _"이 패키지를 쓰려면 이 코드를 어디어디에 넣어!"_ 같은 식으로 말입니다.
   
이런 상황에 불편함을 느낀 파이썬 개발자들은
1998년, 파이썬 코드를 패키징하고 빌드할 수 있는 `distutils`라는 패키지를 만들게 됩니다.
distutils는 **setup.py**라는,
패키지의 메타데이터를 담은 파이썬 스크립트를 사용하는 방식을 제시했는데요.
이 스크립트를 이용해서 파이썬 패키지를 배포하고 설치하는 표준화된 방법을 제공했습니다.

아래는 distutils가 사용하는 setup.py 파일의 예시입니다.
   
```python
# distutils setup.py 예시
from distutils.core import setup
setup(name='foo', version='1.0', py_modules=['foo'], )
```
   
- `python setup.py sdist`: 패키지 소스코드 압축
- `python setup.py bdist`: 패키지 바이너리 배포판 생성
- `python setup.py install`: 패키지 설치

distutils가 제공하는 위 커맨드를 활용함으로서
개발자는 쉽게 패키지를 공유 가능한 형태로 만들 수 있게 되었고,
사용자는 공유받은 패키지를 공통적인 방법으로 설치할 수 있게 되었습니다.
얼마 지나지 않아 distutils는 2000년 파이썬 1.6에 표준 라이브러리로 포함되게 됩니다.

## 2. `PyPI`: 패키지 저장소의 등장

> [PEP 301: Package Index and Metadata for Distutils](https://www.python.org/dev/peps/pep-0301)

distutils의 등장으로 파이썬 패키지를 빌드하고 설치하는 과정은 표준화되었습니다.
그러나 문제는 어디서 패키지를 찾을 수 있는지 알 수 없다는 점이었습니다.
파이썬 개발자들은 여전히 커뮤니티 사이트 등에 패키지를 업로드하고 공유했는데,
사용자 입장에서는 자신이 필요한 패키지를 어디에서 찾아야할 지 알기 어려웠죠.

<div style="text-align: center;">
<img src="/assets/post_images/python-packaging/pypi.png" width="70%">
<div>
    <span style="color:grey"><small><i>PyPI (2006)</i></small></span>
</div>
</div>

이러한 상황을 개선하기 위해서 2003년,
파이썬 패키지들의 중앙 _인덱스_ 서버인 [PyPI (Python Packaging Index)](https://pypi.org/)가 등장합니다.
PyPI는 파이썬 패키지를 쉽게 찾을 수 있게 하는 목적으로 제안되었으며,
그렇기에 처음에는 각 패키지들의 메타데이터 정보를 제공하는데 초점을 맞추고,
직접 패키지를 호스팅하지는 않았습니다.
그래서 찾은 패키지를 실제로 다운로드 받기 위해서는 다시
외부 사이트에 접속해서 다운로드 받아야만 했습니다. [^cheeseshop]

[^cheeseshop]: 여담으로, 이때의 PyPI는 치즈가게라는 별명으로 불렸는데,
Python의 어원이 된 Monty Python에 나오는 [치즈가 없는 치즈가게](https://m.youtube.com/watch?v=Hz1JWzyvv8A) 에피소드에서 따온 이름이라고 합니다.

그러나 패키지를 외부 도메인에서 호스팅 하는 것은
해당 도메인에 대한 보안 취약점 문제를 야기하였기 때문에,
얼마 지나지 않아 2005년부터는
PyPI에서 파이썬 패키지를 직접 호스팅하는 결정을 내리게 됩니다.

## 3. `setuptools`: 새로운 빌드 시스템과 패키지 설치 도구

PyPI의 등장으로 다양한 서드파티 패키지들을 중앙 PyPI 저장소에서 관리할 수 있게 되었습니다.
그런데 distutils만으로는 이러한 패키지 저장소의 기능을 오롯이 활용하는 데에 제약이 많았습니다.
distutils는 PyPI에서 패키지를 다운로드 받을 수도 없고,
패키지 간 의존성에 대한 처리도 할 수 없는,
정말 단순히 소스코드를 패키징하고 설치하는 기능이 전부인 라이브러리였기 때문입니다.

이러한 불편함을 해소하기 위해 2004년 `setuptools`가 만들어졌습니다.
setuptools는 distutils의 확장판이라고 볼 수 있는데요.
distutils가 가진 패키지를 빌드하고 설치하는 기능에 더해서,
setuptools는 PyPI에 패키지를 업로드하거나, 패키지에 대한 테스트를 수행하는 등 다양한 부가 기능을 지원했습니다.

> **Note:** 다만 시간이 흐르면서 최근에는 PyPI 업로드 기능은 `twine`이 대체하고, 테스트 기능은 `unittest, pytest`가 대체하면서  [삭제](https://github.com/pypa/setuptools/issues/1684)되는 등
> 현재의 setuptools는 본연의 패키징 기능에만 집중하는 도구가 되었습니다.

```python
# setuptools setup.py 예시
from setuptools import setup, find_packages
setup(
    name = 'foo',
    version = '1.0',
    install_requires=["dependency1", "dependency2"],
    entry_points={},
    python_requires=">=2.4",
)
```

setuptools는 패키지 빌드를 위해 distutils에서 사용하였던 setup.py의 포맷을 그대로 사용하되,
문법을 확장하여 패키지의 의존성과 파이썬 버전을 지정할 수 있게 하였고,
애플리케이션의 엔트리 포인트를 설정하는 등의 기능을 추가로 포함하였습니다.

또한 setuptools는 설치 시에 `easy_install`이라는 도구를 함께 제공하였는데요.
easy_install은 파이썬 패키지를 직접 PyPI에서 다운로드 받지 않고도
쉽게 PyPI에 업로드된 패키지를 해당 패키지의 *의존성을 포함하여* 설치하는 기능을 지원했습니다.

```sh
easy_install <some_pkg>
```

이러한 easy_install의 등장은 단순히 편리한 파이썬 패키지 설치 도구가 생겼다라는 것 말고도,
파이썬 패키징 프로세스를 개발자의 영역와 사용자의 영역으로 구분하게 되었다는 점에서 의미가 있는데요.

<div style="text-align: center;">
<img src="/assets/post_images/python-packaging/packaging_process.png" width="80%">
<div>
    <span style="color:grey"><small><i>Pycon India 2019: Python Packaging - Where We Are and Where We're Headed</i></small></span>
</div>
</div>

위 그림에서 볼 수 있듯이 패키지의 배포 프로세스를 `빌드->업로드->다운로드->설치`의 네 단계라고 구분할 때,
기존에는 이 전체 프로세스를 구분 없이 하나의 프로그램 distutils (와 약간의 수작업) 가 수행했다면,
이제는 개발자가 수행하는 단계(`빌드->업로드`)는 setuptools,
사용자가 수행하는 단계(`다운로드->설치`)는 easy_install이 수행하도록
도구의 역할을 나누게 된 것입니다.

distutils의 한계점을 보완한 setuptools가 널리 활용되면서,
점차 distutils는 사용이 권장되지 않는 도구가 되었습니다.

> **Note**: distutils는 파이썬 3.10에서부터 [deprecate 되어](https://www.python.org/dev/peps/pep-0632/), 3.12에서 삭제될 예정입니다.

## 4. `pip`: 개선된 패키지 설치 도구

> [PEP 453: Explicit bootstrapping of pip in Python installations](https://www.python.org/dev/peps/pep-0453)

다시 시간이 조금 지나 2008년에는 파이썬하면 빼놓을 수 없는 `pip (핍)` 이 등장합니다.

pip은 setuptools와 함께 등장했던 easy_install을 대체하기 위해 만들어졌는데요.
easy_install은 파이썬 패키지를 설치하는 기능에는 충실했지만,
한 번 설치된 패키지를 삭제하거나,
설치된 패키지의 목록을 보여주는 것과 같은 기능이 없어서
패키지 관리 도구로서의 활용이 제한적인 불편함이 있었습니다.

pip은 파이썬 패키지를 설치하고 관리하는 데에 특화된 도구로서,
easy_install이 가지고 있던 패키지 관리 측면의 문제들을 해결하면서
git 레포지토리에서 파이썬 패키지를 바로 설치할 수 있게 하는 등의
몇 가지 부가 기능을 함께 제공했습니다. 

당연하게도 pip은 발표되고 얼마 지나지 않아 easy_install의 역할을 완벽히 대체했고,
2013년 [PEP 453](https://www.python.org/dev/peps/pep-0453/)를 통해 파이썬 3.4부터 파이썬의 디폴트 패키지 인스톨러가 되었습니다. [^pip]

[^pip]: pip은 pip installs packages라는 재귀적인 의미를 가지고 있습니다.

### 4+. `wheel`

원래 pip은 패키지 설치 시에 파이썬 소스코드를 직접 빌드하는 설치 방식만 제공을 했었습니다.
이러한 방식은 C-extension을 사용하는 패키지의 경우
빌드할 때 필요한 컴파일러가 없으면 패키지를 설치할 수 없는 문제가 있었습니다.

해당 문제를 해결하기 위해 2013년부터 pip은 미리 플랫폼에 맞추어 빌드된
바이너리 포맷 패키지를 설치하는 방식을 지원하게 되는데
([PEP 427](https://www.python.org/dev/peps/pep-0427/)),
이것이 현재도 사용되는 `wheel` 이라는 zip파일 형태의
바이너리 패키지 포맷입니다. [^egg]

[^egg]: 한편, easy_install은 `egg`라는 바이너리 포맷으로 된 패키지를 설치하는 방식을 지원했었는데요.
egg 포맷은 PEP에 명시되지 않은 비공식적인 포맷이었기 때문에 pip는 egg를 사용하지 않았습니다.

 ## 5. setuptools와 setup.py의 문제: _닭과 달걀 패러독스_

이상의 내용을 통해 파이썬 패키징이 어떻게 시작해서 발전해왔는지 살펴보았습니다.
여기서부터는 파이썬의 패키징이 앞으로 어떻게 바뀌어 갈 예정인지 알아보도록 하겠습니다.

<div style="text-align: center;">
<img src="https://media.giphy.com/media/oOmN1Z0AeLy6U2cuAh/giphy.gif">
<div>
    <span style="color:grey"><small><i>From: GIPHY</i></small></span>
</div>
</div>

setuptools와 setup.py를 이용한 파이썬의 패키징 시스템은 지금껏 굉장히 잘 작동하고 있는 것처럼 보이는데요.
사실은 해결될 수 없는 근본적인 문제를 몇 가지 안고 있습니다.
그 중 대표적인 것은 setup.py 파일이 setuptools에 의존적이라는 점입니다.

이 말을 듣고 setuptools가 사용하는 설정파일인 setup.py가 setuptools에 의존적인게 왜 문제냐?
하고 되물으실 수도 있을텐데요.
이것이 왜 문제냐하면, 사실 setuptools는 파이썬의 공식적이고 유일무이한 빌드 시스템이 아니기 때문입니다.

파이썬 패키지를 빌드하기 위해 지금까지 누구나 사용해왔던 setuptools이지만,
distutils와는 다르게 사실 setuptools는 파이썬의 표준 라이브러리가 아닙니다.
이는 의도적인 것으로, 사람들은 얼마든지 [명시된 규칙](https://packaging.python.org/specifications/)을 따라 새로운 패키지 빌드 시스템을 만들 수 있고,
그렇게 하는 것이 권장되고 있습니다.

그런데 setup.py에 의존하는 지금의 파이썬 패키징 방식은 setuptools가 없으면 빌드가 불가능한 시스템입니다.
이것을 파이썬 패키징 개발자인 [Dustin Ingram](https://github.com/di)은 닭이 먼저냐, 달걀이 먼저냐의 패러독스와 같다고 얘기를 했는데요.
 
1.  현재 파이썬 패키징 시스템에서 패키지를 빌드하기 위해 필요한 메타데이터는 setup.py에 명시됩니다.
 1. 따라서 setuptools가 아닌 다른 빌드 시스템을 이용해서 패키지를 빌드하려면 해당 시스템을 사용하겠다는 사실을 setup.py에 명시하여야 합니다. 
 2. 그런데 setup.py를 파싱하기 위해서는 setuptools가 필요합니다. 🤔 [^setup.py]
 3. 즉, 어떤 빌드 시스템을 사용하던 setuptools가 필수적으로 요구됩니다. 😵
 
[^setup.py]: setuptools.setup() 함수를 setup.py가 사용하기 때문입니다.

여기서 한 걸음 더 나아가볼까요?
 
 1. 당신이 새로 만든 패키지를 빌드하기 위해서는 setuptools A 버전에서 지원되는 특수한 기능을 요구합니다.
 2. setuptools A 버전이 필요하다는 사실은 어디에 적어두여야 할까요? 당연히 setup.py입니다.
 3. 그런데 setup.py를 파싱하기 위해서는 시스템에 setuptools가 설치되어 있어야 합니다.
 4. 시스템에 설치된 setuptools의 버전이 A가 아닌 B라면요?
 5. 🤯

## 6. `pyproject.toml`: 의 등장

> [PEP 517: A build-system independent format for source trees](https://www.python.org/dev/peps/pep-0517/) <br />
> [PEP 518: Specifying Minimum Build System Requirements for Python Projects](https://www.python.org/dev/peps/pep-0518/)

setup.py 문제가 발생하는 근본적인 원인은
패키지 빌드에 필요한 메타데이터를 저장하는 파일(setup.py)이
그 자체로 특정한 빌드 시스템(setuptools)에 종속되기 때문입니다.

이를 해결하기 위한 방법은 특정 빌드 시스템에 종속되지 않는,
선언적인(declarative) 설정 파일을 사용하는 것입니다.
이를 위해 2016년, pyproject.toml이 제안되었습니다.

pyproject.toml은 [TOML 포맷](https://github.com/toml-lang/toml)으로 만들어진 설정 파일인데요.
이 파일의 역할은 단순합니다.
파이썬 패키지를 어떻게 빌드하는지,
어떤 빌드 시스템을 사용해야 하는지를 명시하는 것입니다.
물론 기존에 사용하던 setuptools를 빌드 시스템으로 사용하는 것도 가능합니다.

```toml
# pyproject.toml 예시
[build-system]
requires = ["setuptools>=42", "wheel"]
```

위의 예시는 setuptools를 빌드 시스템으로 사용하는 pyproject.toml 파일의 예시입니다.
패키지를 빌드하기 위해 특정한 setuptools 버전이 필요하다는 점, 그리고 wheel 라이브러리가 함께 필요하다는 점을 명시하고 있습니다.

```toml
[build-system]
requires = ["flit_core >=2,<4"]
build-backend = "flit_core.buildapi"
```

만약 setuptools가 아닌 다른 빌드 시스템을 사용하고자 한다면 해당 시스템을 setuptools 대신 명시하면 됩니다.
위의 예시는 setuptools 대신 [flit](https://flit.readthedocs.io/en/latest/index.html)을 사용하는 경우입니다.

이처럼, setup.py 대신 pyproject.toml을 사용한다는 것은
setuptools라는 특정한 라이브러리에
파이썬 패키징 시스템이 종속되지 않게 된다는 것을 의미합니다.
따라서 누구나 자유롭게 빌드 시스템을 개발할 수 있게 되고,
특정한 빌드 시스템을 사용해서 자신의 패키지를 빌드하고자 하는 개발자는 그것을 pyproject.toml에 명시해두기만 하면 됩니다.

> pyproject.toml에 대한 더 상세한 내용은 [PEP 518](https://www.python.org/dev/peps/pep-0518/)을 읽어보시면 좋습니다.

### 6+. pyproject.toml에 빌드와 관련없는 항목들이 있는데요?

pyproject.toml은 원래 패키지 빌드와 관련된 정보만을 담기 위한 파일로 제안되었습니다.
그런데 패키지 개발자들은 개발과 관련된 설정 값을 관리하는 용도로도
pyproject.toml을 유용하게 사용할 수 있음을 발견했습니다.

그러면서 빌드 전에 수행되어야 하는 테스트, 코드 포맷팅 등에 대한 정보를 pyproject.toml에 함께 적어두기 시작했는데요.
대표적으로는 코드 포맷팅 도구인 black, 테스트용 프레임워크인 pytest 등이 pyproject.toml에 설정 값을 저장하고 있습니다.

```toml
# pyproject.toml of black
[tool.black]
line-length = 88
target-version = ['py36', 'py37', 'py38']
include = '\.pyi?$'
```

```toml
# pyproject.toml of pytest
[tool.pytest.ini_options]
minversion = "6.0"
addopts = "-ra -q"
testpaths = [
    "tests",
    "integration",
]
```

장기적으로는 pyproject.toml이 파이썬 패키지를 개발하는데 필요한 설정 값을
통합 관리하기 위해서 사용되지 않을까하는 생각이 듭니다. Node.js의 package.json처럼요.

## 7. 모던한 파이썬 패키징 도구들

마지막으로 pyproject.toml을 활용하는 _모던_ 파이썬 패키징 도구를 간단히 소개하고자 합니다.

### [poetry](https://python-poetry.org/)

<div style="text-align: center;">
<img src="https://avatars.githubusercontent.com/u/48722593?s=200&v=4">
<div>
    <span style="color:grey"><small><i>poetry logo</i></small></span>
</div>
</div>

poetry는 2018년부터 시작된 프로젝트로,
파이썬 패키지를 패키징(setuptools), 업로드(twine), 그리고 설치(pip)하는 모든 과정을 처리할 수 있는 원포올(one-for-all) 도구를 지향하는 프로젝트입니다.

패키징을 위한 도구와, 패키지를 설치하는 도구를 통합하는
행위에 관해서 다양한 의견이 갈리는 프로젝트라고 생각되긴 하는데요.
단일 도구로 패키지 개발에 필요한 모든 프로세스를 수행할 수 있다는 편의성 측면에서 매력적이여서,
최근들어 큰 인기를 끌고 있는  프로젝트입니다.

### [flit](https://github.com/takluyver/flit)

<div style="text-align: center;">
<img src="https://flit.readthedocs.io/en/latest/_static/flit_logo_nobg_cropped.svg">
<div>
    <span style="color:grey"><small><i>flit logo</i></small></span>
</div>
</div>

flit은 "쉬운 것을 쉽게" 라는 모토로 개발되고 있는 프로젝트로,
순수하게 파이썬만 사용해서 개발된 패키지를 PyPI에 업로드하는 과정을
단순화하는 것을 목표로 하는 도구입니다.

C-extension과 같은 부가 기능을 사용하지 않는 파이썬 패키지의 경우
업로드 과정에 복잡한 설정이 필요하지 않다는 점에서 착안해
패키지 업로드 과정을 단순화하는 것을 지향하는 프로젝트입니다.

## 마치며

30년에 달하는 역사를 가지고 있는 파이썬이지만,
생각보다 우리가 지금 사용하고 있는 많은 도구들이 도입되고 활성화된지는 얼마되지 않았습니다.
여전히 파이썬은 굉장히 액티브하게 발전하고 있고, 앞으로도 수많은 변화가 예정되어 있습니다.
점점 더 발전하는 파이썬의 모습을 기대해보셔도 좋을 것 같습니다.

---
  
  ### References
  
  - [Pycon CLE 2018: Inside the Cheeseshop: How Python Packaging Works](https://m.youtube.com/watch?v=AQsZsgJ30AE)
  - [Pycon India 2019: Python Packaging - Where We Are and Where We're Headed](https://m.youtube.com/watch?v=1WRRBrPpxhw)
  - [Pycon US 2021: Packaging Python in 2021](https://youtu.be/j8iXO5VErjw)
  - [PyPA: Packaging History](https://www.pypa.io/en/latest/history/)
  - [승귤입니다: 파이썬 패키징, 배포 툴의 과거와 현재](https://blog.gyus.me/2020/python-packaging-history/)
  
  
  
