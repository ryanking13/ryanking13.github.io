---
date: "2018-05-22T00:00:00Z"
categories:
- Python
title: 파이썬 pathlib 사용하기 - NO MORE os.path.join()
summary: 파이썬 3.4에서 등장한 pathlib 모듈을 살펴보는 글입니다.
---

 - 서론이 좀 기니 조각 코드만을 보러 온거라면 [여기](#usage)를 클릭

지난 4월 26일 파이썬 웹 프레임워크인 flask가 1.0 버전 릴리즈를 [발표했다](https://www.palletsprojects.com/blog/flask-1-0-released/). 나는 flask 사용자는 아니지만 발표 내용 중 눈에 띄는 것이 하나 있었는데, 버전 업그레이드를 하면서 파이썬 3.3 버전 지원을 중단한 것이다.

```
- Dropped support for Python 2.6 and 3.3.
```

생각해보면 파이썬 3.3.0이 나온것이 [2012년 9월](https://www.python.org/download/releases/3.3.0/)이니 이미 [lifecycle 5년](https://devguide.python.org/#status-of-python-branches)이 지나긴 했다. 당당하게 3.4를 써도 되는 시기인 것이다.

따라서 그 기념(?)으로 파이썬 3.4부터 빌트인(built-in) 모듈에 포함된 __pathlib__ 을 소개해보려고 한다.

## pathlib

> pathlib : Object-oriented filesystem paths

pathlib 모듈의 기본 아이디어는 파일시스템 경로를 단순한 문자열이 아니라 객체로 다루자는 것이다. 가령 파일의 존재성 여부를 판단하는 것은 아래와 같이 작성할 수 있다.

```python
import os
from pathlib import Path

file_path = './path/to/file'

# 기존 (os.path)
if os.path.exists(file_path):
  # do something

# pathlib
p = Path(file_path)
if p.exists():
  # do something
```

사람에 따라 다를 수 있지만, pathlib을 사용하는 방식이 코드를 읽는 데에 있어 훨씬 자연스럽다고 느껴진다. 영어 문장으로 생각해도 더 잘 읽힌다.

파일시스템을 문자열이 아닌 객체로 다루게 되면서 얻게 된 큰 이익 중 하나는 연산자를 새롭게 정의할 수 있게 되었다는 점이다. pathlib은 이것을 아주 아름답게 이용했다.

```python
import os
from pathlib import Path

dir_name = 'dir'
sub_dir_name = 'sub_dir_name'
file_name = 'file'

# 기존 (os.path)
file = os.path.join(dir_name, sub_dir_name, file_name)

# pathlib
dir = Path(dir_name)
file = dir / sub_dir_name / file_name
```

__...no more os.path.join!__

pathlib은 나누기 연산자인 슬래시(`/`)가 경로 구분 문자로도 사용된다는 점에서 착안하여 나누기 연산자로 path를 연결하게끔 만들었다. 더 이상 보기 싫은 os.path.join()와 마주치지 않아도 되는 것이다!

## Path란?

그렇다면 저 `Path` 객체는 어떻게 되어 있을까?

![Path class](https://docs.python.org/3/_images/pathlib-inheritance.png)

Path 클래스는 위와 같은 상속 구조를 가진다.

PurePath (pure paths)와 Path (concrete path)의 차이점은 I/O와 관계된 메소드를 가지는 가에 대한 여부다.

일반적인 용도로 사용할 때에는 그냥 Path를 사용하면 된다. Path 오브젝트를 생성할때에 OS에 맞춘 하위 클래스를 리턴해준다.

```python
# windows machine에서 실행한 경우
from pathlib import Path

p = Path('.')
type(p)
# <class 'pathlib.WindowsPath'>
```

한편, 다른 OS의 path를 다루고자 하는 경우에는 PurePath를 써야한다. 예를 들어 Windows OS에서 Unix Path를 생성하고자 하는 경우는 PosixPath()를 사용하는 대신 PurePosixPath()를 사용해야만 한다.

> 파이썬 3.6 버전 부터는 PurePath가 os.Pathlike 인터페이스를 상속하여 os 모듈과의 호환성이 생겼다. 이는 [os 모듈 문서](https://docs.python.org/3/library/os.html#os.PathLike)를 참고하길 바란다.

## Usage

이제 기존에 pathlib을 사용하여 할 수 있는 일을 살펴보자.

#### 파일 열기

- Path.open()

```python
from pathlib import Path

filename = 'text.txt'

# without pathlib
file = open(filename, 'r')

# with pathlib
path = Path(filename)
file = path.open('r')
```

#### 파일 읽고 쓰기

단 한 번의 I/O만 하면 된다면, 번거롭게 파일을 열고 닫을 필요 없이 사용할 수 있는 함수들이 있다.

- Path.write_text()
- Path.write_bytes()
- Path.read_text()
- Path.read_bytes()

```python
from pathlib import Path

filename = 'text.txt'

# without pathlib
file = open(filename, 'r')
r = file.read()
file.close()

# without pathlib2
with open(filename, 'r') as f:
  r = f.read()

# with pathlib
path = Path(filename)
r = path.read_text()
```

#### 경로 분석

```python
from pathlib import Path

path = Path('/usr/bin/python3')

path
# PosixPath('/usr/bin/python3')

str(path)
# '/usr/bin/python3'

path.parts
# ('/', 'usr', 'bin', 'python3')

path.parent
# PosixPath('/usr/bin')

list(path.parents)
# [PosixPath('/usr/bin'), PosixPath('/usr'), PosixPath('/')]

# -----

path = Path('/usr/bin/python3/../')

# 주의!
path.parent
# PosixPath('/usr/bin/python3')

path.resolve()
# PosixPath('/usr/bin')
```

#### 리스팅

glob패턴을 사용하여 파일/디렉토리를 리스팅할 수 있다.

```python
from pathlib import Path

path = Path('.')

files = path.glob('*')
# <generator object Path.glob at 0x7f0ff370a360>

list(files)
# [PosixPath('.git'), PosixPath('.gitconfig'), PosixPath('.vimrc'), PosixPath('.zshrc'), PosixPath('pre-commit')]

# path.rglob(*)도 동일하다
list(path.glob('**/*'))
# [PosixPath('.git/COMMIT_EDITMSG'), PosixPath('.git/config'), PosixPath('.git/description'), PosixPath('.git/HEAD'), PosixPath('.git/hooks'), PosixPath('.git/index'), PosixPath('.git/info'), PosixPath('.git/logs'), PosixPath('.git/objects'), PosixPath('.git/refs')]

# path가 가리키는 폴더를 리스팅 할때는 glob('*') 대신 iterdir을 사용할 수 있다.
list(path.iterdir())
# [PosixPath('.git'), PosixPath('.gitconfig'), PosixPath('.vimrc'), PosixPath('.zshrc'), PosixPath('pre-commit')]
```

이 외에도 다양한 기능을 지원한다. 그동안 os, os.path 모듈을 사용하여 파일시스템을 다뤘던 것을 일반적인 것은 다 pathlib으로 대체할 수 있다.

## Conclusion

Asyncio(3.4 에서 추가)나 Typing(3.5 에서 추가)과 달리 pathlib 자체는 기존에 잘 돌아가던 프로그램에 억지로 끼워넣어야 하는 정도로 엄청난 가치가 있는 모듈이라라고는 생각하지 않는다. 그렇지만 새롭게 파이썬 프로젝트를 시작하면서 3.3 버전이하의 하위 호환성을 신경쓰지 않아도 된다면 충분히 고려할만한 유용한 모듈이 아닐까 생각한다.

## References

> https://docs.python.org/3/library/pathlib.html

> https://docs.python.org/3/library/os.path.html
