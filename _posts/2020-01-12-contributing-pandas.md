---
layout: post
title: 오픈소스 버그 고치다가 CPython까지 뜯어본 후기
description: 오픈소스 버그 고치다가 CPython까지 뜯어본 후기
tags: [Python]
---

__TL;DR__

파이썬 Pandas 라이브러리에서 발견한 버그를 수정하는 과정에서,
cpython의 코드베이스까지 뜯어보게 된 이야기입니다.

> 이 글은 오픈 소스 컨트리뷰션 가이드가 아닙니다.

## 도입

얼마 전, 파이썬 데이터 과학 라이브러리인 [Pandas](https://pandas.pydata.org/)를 사용하다가 json 데이터를 읽어오는 `read_json` 함수가 의아한 동작을 하는 것을 발견했습니다.

```python
import pandas as pd

# utf-8 인코딩으로 파일을 저장하고
with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')

# read_json() 함수로 읽어옵니다
dt2 = pd.read_json("test.json")
print(dt2)
```
```
               A
0  媛��굹�떎�씪留덈컮�궗
```

`read_json` 함수는 json 파일을 읽어서 파싱해주는 역할을 하는데, utf-8로 저장한 파일을 읽어왔을 때 결과물이 깨지는 것입니다.

파이썬의 인코딩 문제에 지긋지긋하게 당해본 분들이라면, 파이썬에서 인코딩이 깨지는 건 흔히 있는 일 아닌가? 라고 생각하실 수도 있지만,
[공식 다큐먼트](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_json.html)에 따르면 `read_json`은 기본적으로 파일의 인코딩을 utf-8로 취급합니다.

![read_json_docs](../../../assets/post_images/pandas_read_json_encoding.PNG)

그럼 파일의 인코딩을 utf-8로 명시해주면 어떨까요?

```python
import pandas as pd

with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')
dt2 = pd.read_json("test.json", encoding="utf-8")  # encoding 파라미터 지정
print(dt2)
```
```
         A
0  가나다라마바사
```

제대로 깨지지 않고 파일을 읽어오는 것을 확인할 수 있습니다.

즉, 코드가 공식 문서대로 동작하고 있지 않습니다. 버그입니다.

## 🤔 버그 원인 분석

버그를 발견했으니 먼저 이유를 분석해야 합니다.

인코딩이 깨지는 것은 분명 제 개발환경이 한국어 윈도우즈라 cp949 인코딩을 사용하고 있기 때문일 것입니다. 확인해볼까요?

```python
import pandas as pd

# 파일을 utf-8 대신 cp949 인코딩으로 저장
with open("test.json", "w", encoding="cp949") as f:
    f.write('{"A": ["가나다라마바사"]}')
dt2 = pd.read_json("test.json")
print(dt2)
```
```
         A
0  가나다라마바사
```

예상대로 json 파일을 cp949 인코딩으로 저장하면 제대로 내용을 읽어오는 것을 확인할 수 있습니다.

이제 Pandas 개발팀에 버그 리포트를 하고 끝내겠습니다. 수고하셨습니다.

...라고 하고 싶지만 직접 문제의 원인을 파악하고 고쳐보기로 했습니다 (답답하니 내가 뛴다!).

먼저 Pandas가 어디서 인코딩을 잘못 읽어오고 있는지 확인하여야 합니다. [Pandas 코드베이스](https://github.com/pandas-dev/pandas)를 뜯어볼 시간입니다.

# 🔎 코드 톺아보기

먼저 `read_json` 함수를 찾아봅시다.

`read_json` 함수는 [io/json/_json.py](https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/json/_json.py#L352) 파일에 정의되어 있습니다.

```python
# https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/json/_json.py#L352
def read_json(
    #...
    encoding=None,
    #...
):
```

인코딩의 기본 값은 `None`이네요. 더 따라가 봅시다.

```python
# https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/json/_json.py#L586
    json_reader = JsonReader(
        #...
        encoding=encoding,
        #...
    )

    #...
    result = json_reader.read()
    #...
    return result
```

`read_json`함수는 `JsonReader` 라는 클래스 인스턴스를 생성하고 해당 인스턴스를 통해서 파일을 읽은 뒤 결과를 돌려주게 되어 있습니다.

```python
# https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/json/_json.py#L613
class JsonReader(BaseIterator):
    #...
    def __init__(...):
        #...
        self.encoding = encoding  # 인코딩 지정
        #...
        data = self._get_data_from_filepath(filepath_or_buffer)  # 파일을 읽어오는 것으로 추정되는 메소드
        #...

    #...
    def _get_data_from_filepath(self, filepath_or_buffer):
        #...
            data, _ = _get_handle( # 파일 포인터를 가져오는 것으로 추정되는 메소드
                filepath_or_buffer,
                "r",
                encoding=self.encoding,
                compression=self.compression,
            )
        #...

        return data
```

`JsonReader`는 `__init__ --> _get_data_from_filepath`을 거쳐 `_get_handle` 메소드를 호출합니다.

메소드의 이름으로 보건대 파일 포인터를 생성하는 것으로 보입니다.

`_get_handle`함수는 [io/common.py](https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/common.py#L367) 파일에 정의되어 있습니다.

```python
# https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/common.py#L367
def _get_handle(...):
    #...
            # No explicit encoding
            f = open(path_or_buf, mode, errors="replace", newline="")
    #...
    return f, handles
```

`_get_handle` 함수에서 파일을 여는데, 인코딩이 명시되어 있지 않을 경우, `open` 함수의 인코딩 파라미터를 지정하지 않고 사용하네요.

이 부분이 문제인 걸까요? 확인해봅시다.

```python
with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')

data = open("test.json", "r", errors="replace", newline="").read()
print(data)
```
```
{"A": ["媛��굹�떎�씪留덈컮�궗"]}
```

`_get_handle` 함수와 동일한 파라미터를 줘서 파일을 열고 읽어 출력해보니,
앞서 `read_json`으로 읽었을 때와 동일하게 깨진 결과를 확인할 수 있습니다.

그렇습니다. 문제는 `open`에서 시작되었습니다.

`open`의 동작이 문제라면 문제는 Pandas가 아니라 파이썬의 영역입니다.

[파이썬 공식 문서](https://docs.python.org/3.8/library/functions.html#open)에서 `open` 함수에 대한 내용을 찾아보면,

> In text mode, if encoding is not specified the encoding used is platform dependent: __locale.getpreferredencoding(False)__ is called to get the current locale encoding.

인코딩이 지정되어 있지 않을 경우 `locale.getpreferredencoding(False)`의 실행 결과를 사용한다고 합니다.[^1]

```python
>>> import locale
>>> locale.getpreferredencoding(False)
'cp949'
```

제 한국어 Windows10 환경에서 `locale.getpreferredencoding(False)`의 결과는 cp949인 것을 확인할 수 있습니다.

## 👨‍💻 문제 해결...?

코드베이스를 깊이 들어가서야 발견한 문제의 원인에 비해서, 해결책은 아주 간단합니다.

```python
# https://github.com/pandas-dev/pandas/blob/fd7db9819b8c7dba86b2887bee33f670b2715afc/pandas/io/json/_json.py#L577
    if encoding is None:
        encoding = "utf-8"
```

인코딩이 지정되어 있지 않으면 utf-8로 강제해주는 것이죠.

기존 Pandas 코드베이스에서도 명시되지 않은 인코딩을 강제한 케이스를 찾아볼 수 있었고 ([예시1](https://github.com/pandas-dev/pandas/blob/fd7db9819b8c7dba86b2887bee33f670b2715afc/pandas/io/formats/format.py#L489-L490), [예시2](https://github.com/pandas-dev/pandas/blob/fd7db9819b8c7dba86b2887bee33f670b2715afc/pandas/io/formats/csvs.py#L77-L78)),
동일한 방식을 적용했습니다.

이것으로 끝일까요? 아닙니다. 테스트가 남았습니다.

## 💀 테스트를 짜자 (절망편)

Pandas는 코드 품질을 유지하기 위하여 코드 수정 PR에 테스트를 강제합니다.

우리가 수정한 버그는, `read_json`이 utf-8이 아닌 잘못된 인코딩을 기본값으로 사용할 수 있다는 것이었으니,
기존 코드에서는 에러가 발생하고, 수정한 코드에서는 에러가 발생하지 않는 테스트를 작성하여야 합니다.

그런데 `locale.getpreferredencoding(False)`은 시스템에 따라 다른 값을 리턴합니다.
윈도우즈라도 국가에 따라 다르고, 우분투나 맥에서는 utf-8로 고정되어 있습니다.
즉, 제대로 테스트를 작성하려면 기본 인코딩이 utf-8이 아닌 환경을 시뮬레이션 해주어야 합니다.
안 그러면 우분투에서는 성공하고 윈도우즈에서는 실패하는 테스트가 되어버릴 수도 있으니까요.

파이썬 빌트인 모듈인 `unittest`의 `mock` 모듈을 이용해서 `locale.getpreferredencoding` 함수의 리턴 값을 패치해봅시다.

```python
import pandas as pd
import locale
import sys
from unittest import mock

print("OS:", sys.platform)
print("Locale:", locale.getpreferredencoding(False))

# 파일은 utf-8로 저장
with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')

# unittest.mock 함수를 이용한 함수 패칭 (utf-8 --> cp949)
with mock.patch("locale.getpreferredencoding", return_value="cp949"):
    print("Patched locale:", locale.getpreferredencoding(False))
    dt2 = pd.read_json("test.json") # cp949로 기본 인코딩을 바꾸었으니 깨져야 한다.
    print(dt2)
```

```
OS: linux
Locale: UTF-8
Patched locale: cp949
         A
0  가나다라마바사
```

테스트는 기본 locale이 utf-8인 우분투 환경에서 진행했습니다.

그런데 어라? `mock.patch`를 이용해서 `locale.getpreferredencoding`함수의 리턴값이 cp949로 바뀐 것을 확인했음에도,
`read_json`은 정상적으로 utf-8 인코딩 파일을 읽어오고 있습니다.

## 🖐 안녕 CPython

여기서 꽤 오랜 시간 제자리걸음을 했습니다. 대체 어디가 문제인 것일까요.

그러다 문득 한 가지 가능성을 떠올렸습니다. 과연 파이썬 공식 문서는 100% 정확할까?

> 정말로 `open` 함수가 `locale.getpreferredencoding(False)`의 결과를 사용하는 것일까?

이 질문의 답은 문서에서는 확인할 수 없습니다. 직접 파이썬 코드베이스를 읽어봐야 합니다.

cpython 레포지토리에서 `open` 함수를 확인해볼 수 있습니다. [^2]

```c++
// https://github.com/python/cpython/blob/d0c92e81aa2171228a23cb2bed36f7dab975257d/Modules/_io/_iomodule.c#L228
// Cpython open() 함수 구현체
static PyObject *
_io_open_impl(PyObject *module, PyObject *file, const char *mode,
              int buffering, const char *encoding, const char *errors,
              const char *newline, int closefd, PyObject *opener)
{
    //...
    /* wraps into a TextIOWrapper */
    wrapper = PyObject_CallFunction((PyObject *)&PyTextIOWrapper_Type, // PyTextIOWrapper_Type 클래스를 사용합니다
                                    "OsssO",
                                    buffer,
                                    encoding, errors, newline,
                                    line_buffering ? Py_True : Py_False);
    //...
}
```

`open` 함수는 `PyTextIOWrapper_Type` 클래스를 이용하여 파일을 읽어들이고,


```c++
// https://github.com/python/cpython/blob/d0c92e81aa2171228a23cb2bed36f7dab975257d/Modules/_io/textio.c#L1071
// PyTextIOWrapper_Type 클래스 생성자 구현체
static int
_io_TextIOWrapper___init___impl(textio *self, PyObject *buffer,
                                const char *encoding, PyObject *errors,
                                const char *newline, int line_buffering,
                                int write_through)
{
    //...
    if (encoding == NULL && self->encoding == NULL) {
        // _PyIO_get_locale_module로 모듈을 읽어와서
        PyObject *locale_module = _PyIO_get_locale_module(state);
        if (locale_module == NULL)
            goto catch_ImportError;
        self->encoding = _PyObject_CallMethodIdOneArg(
            // 모듈의 PyId_getpreferredencoding 함수를 호출하여 인코딩을 가져옵니다
            locale_module, &PyId_getpreferredencoding, Py_False);
        //...
    }
    //...
}
```

`PyTextIOWrapper_Type`은 `_PyIO_get_locale_module`로 로케일 모듈을 가지고 와서,
`PyId_getpreferredencoding`을 호출하여 인코딩을 가져옵니다.

```c++
// https://github.com/python/cpython/blob/d0c92e81aa2171228a23cb2bed36f7dab975257d/Modules/_io/_iomodule.c#L571
PyObject *
_PyIO_get_locale_module(_PyIO_State *state)
{
    //...
    // _booltlocale 이라는 이름의 모듈을 임포트해옵니다
    mod = PyImport_ImportModule("_bootlocale");
    //...
    return mod;
}
```

`_PyIO_get_locale_module`은 `_bootlocale`이라는 이름의 파이썬 모듈을 가지고 오네요.

대체 `_bootlocale` 이녀석은 뭘까요? 사실 답은 파이썬 `locale` 모듈에서 찾을 수 있습니다. 

```python
# https://github.com/python/cpython/blob/d0c92e81aa2171228a23cb2bed36f7dab975257d/Lib/locale.py#L622
    # locale.getpreferredencoding() 구현체
    def getpreferredencoding(do_setlocale = True):
        """Return the charset that the user is likely using."""
        if sys.flags.utf8_mode:
            return 'UTF-8'
        import _bootlocale
        return _bootlocale.getpreferredencoding(False)
```

사실 `locale.getpreferredencoding`은 `_bootlocale.getpreferredencoding`을 그대로 가져와 쓰고 있었을 뿐입니다! [^3]

그리고 `_bootlocale` 모듈에는 진짜 `getpreferredencoding`이 구현되어 있습니다.

```python
# https://github.com/python/cpython/blob/d0c92e81aa2171228a23cb2bed36f7dab975257d/Lib/_bootlocale.py
    def getpreferredencoding(do_setlocale=True):
        if sys.flags.utf8_mode:
            return 'UTF-8'
        return _locale._getdefaultlocale()[1]
#...
```

즉, 요약하면 다음과 같습니다.

1. 파이썬의 `locale.getpreferredencoding` 함수는 `_bootlocale.getpreferredencoding` 함수를 호출하여 로케일 값을 얻어온다.
2. 그러나 파이썬의 C로 구현된 빌트인 `open` 함수는 사실 `locale` 모듈을 거치지 않고 직접 `_bootlocale` 모듈을 임포트해온다.
3. 따라서 `locale.getpreferredencoding` 함수를 패치하는 것은 `open` 함수의 동작에 영향을 주지 않았다.
4. 그렇다면 __\_bootlocale__ 모듈을 바로 패치하면 `open`의 동작에 영향을 줄 수 있다!

> 나중에 확인하기로, [파이썬 이슈 트래커에도 2017년에 해당 내용이 등록](https://bugs.python.org/issue31565)된 바 있습니다. <br> 그렇지만 개발자들이 반응해주지 않았네요. 🙁

## ✨ 테스트를 짜자 (희망편)

```python
import pandas as pd
import locale
import sys
from unittest import mock

print("OS:", sys.platform)
print("Locale:", locale.getpreferredencoding(False))

# 파일은 utf-8 인코딩으로 저장
with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')

# locale.getpreferredencoding 대신 _bootlocale.getpreferredencoding 패치
with mock.patch("_bootlocale.getpreferredencoding", return_value="cp949"):
    print("Patched locale:", locale.getpreferredencoding(False))
    dt2 = pd.read_json("test.json") # cp949로 기본 인코딩을 바꾸었으니 깨져야 한다.
    print(dt2)
```

기존 테스트 코드에서 패치하는 함수를 `_bootlocale.getpreferredencoding`로 바꾸었습니다.
결과는 어떨까요?

```
OS: linux
Locale: UTF-8
Patched locale: cp949
               A
0  媛��굹�떎�씪留덈컮�궗
```

원하던 결과대로 파일의 내용이 깨지는 것을 확인할 수 있습니다!

## 🚀 PR 보내기

이제 문제 원인, 해결책, 테스트까지 모두 완성했으니 PR을 보내봅시다.

![issue](../../../assets/post_images/pandas_issue.PNG)

먼저 [이슈](https://github.com/pandas-dev/pandas/issues/29565)를 작성해서 버그를 발견했음을 알리고,

![PR](../../../assets/post_images/pandas_pr.PNG)

이슈를 수정하는 [PR](https://github.com/pandas-dev/pandas/pull/29566)를 곧바로 날렸습니다.

Pandas는 테스트로 `unittest` 대신 `pytest` 사용을 권장해서 테스트 코드를 약간 수정해주었구요.

PR은 다음 날에 곧바로 머지되었습니다 :)

![PR_merged](../../../assets/post_images/pandas_merge.PNG)

## 결론

처음 Pandas에서 버그를 발견했을 때만 해도 아주 간단하게 끝날 줄 알았던 문제가 꼬리에 꼬리를 물어 Cpython까지 가게 되었습니다.

지금까지 몇 차례의 오픈소스 컨트리뷰션 경험은 있지만, Pandas 정도의 대형 레포지토리에 컨트리뷰션을 한 적은 처음이었는데요.

많은 사람들이 사용하는 패키지인만큼 더 신중하게 정확한 원인을 찾기 위해 접근해야 했고,
그 과정에서 Pandas를 넘어 CPython 코드까지 읽어보고 분석해볼 수 있는 기회가 되었습니다.

---

### Reference

> https://github.com/pandas-dev/pandas

> https://docs.python.org/3.8/library/functions.html

> https://github.com/python/cpython

[^1]: 파이썬 인코딩 문제를 다뤄본 사람은 `sys.getdefaultencoding()`이 아니고? 라고 생각할 수 있는데, 이 부분은 [여기](https://books.google.co.kr/books?id=NJpIDwAAQBAJ&pg=PA167&lpg=PA167&dq=locale.getpreferredencoding(false)+or+sys.getdefaultencoding()&source=bl&ots=elZ_lJKRZt&sig=ACfU3U2auxeyVMh-6xeCC1qVW9xQOVRh7g&hl=ko&sa=X&ved=2ahUKEwiMlaCi297mAhXyxosBHS54DqEQ6AEwB3oECAoQAQ#v=onepage&q=locale.getpreferredencoding(false)%20or%20sys.getdefaultencoding()&f=false)에서 설명을 더 찾아볼 수 있습니다.

[^2]: cpython은 2.x 까지는 파이썬으로 구현한 I/O 함수를 사용하다가 이후부터 c 기반으로 새로 구현했습니다. 기존의 파이썬 구현은 [_pyio](https://github.com/python/cpython/blob/master/Lib/_pyio.py) 모듈로 사용할 수 있습니다.

[^3]: 사실 OS마다 조금씩 다르게 동작하도록 구현되어있지만, 기본적으로는 거의 동일합니다. 