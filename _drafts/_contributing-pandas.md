---
layout: post
title: Pandas 컨트리뷰션 후기
description: Pandas 컨트리뷰션 후기
tags: [Python, Github]
---

__TL;DR__

Pandas를 통하여 처음으로 대형 오픈 소스 프로젝트에 컨트리뷰션한 후기

라이브러리에서 버그를 발견하고, 버그 원인을 분석하고, 코드를 작성하고,
프로젝트의 컨트리뷰션 가이드에 따라 PR을 날리고 머지되기 까지의 과정을 다룹니다.

> 이 글은 오픈 소스 컨트리뷰션 가이드가 아니며, 프로젝트마다 컨트리뷰션 정책, 과정 등이 다를 수 있습니다.

## 도입

얼마 전, 파이썬 데이터 과학 라이브러리인 [Pandas](https://pandas.pydata.org/)를 사용하다가 json 데이터를 읽어오는 `read_json` 함수가 의아한 동작을 하는 것을 발견했습니다.

```python
import pandas as pd

with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')
dt2 = pd.read_json("test.json")
print(dt2)
```
```
               A
0  媛��굹�떎�씪留덈컮�궗
```

`read_json` 함수는 json 파일을 읽어서 파싱해주는 역할을 하는데, utf-8로 저장한 파일의 결과물이 깨지는 것입니다.

파이썬의 인코딩 문제에 지긋지긋하게 당해본 분들이라면, 파이썬에서 인코딩이 깨지는 건 당연한 거 아닌가? 라고 생각하실 수도 있지만,

[공식 다큐먼트](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_json.html)에 따르면 `read_json`은 기본적으로 파일의 인코딩을 utf-8로 취급합니다.

(사진)

그럼 파일의 인코딩을 utf-8로 명시해주면 어떨까요?

```python
import pandas as pd

with open("test.json", "w", encoding="utf-8") as f:
    f.write('{"A": ["가나다라마바사"]}')
dt2 = pd.read_json("test.json", encoding="utf-8")
print(dt2)
```
```
         A
0  가나다라마바사
```

제대로 깨지지 않고 파일을 읽어오는 것을 확인할 수 있습니다.

즉, 코드가 공식 문서대로 동작하고 있지 않습니다. 버그입니다.

## 🔎 버그 원인 분석

버그를 발견했으니 먼저 이유를 분석해야 합니다.

인코딩이 깨지는 것은 분명 제 개발환경이 한국어 Windows라 cp949 인코딩을 사용하고 있기 때문일 것입니다. 확인해볼까요?

```python
import pandas as pd

with open("test.json", "w", encoding="cp949") as f:
    f.write('{"A": ["가나다라마바사"]}')
dt2 = pd.read_json("test.json")
print(dt2)
```
```
         A
0  가나다라마바사
```

네, json 파일을 cp949 인코딩으로 저장하면 제대로 내용을 읽어오는 것을 확인할 수 있습니다.

이제 Pandas 개발팀에 버그 리포트를 하는 것으로 끝내도 되지만,
직접 문제의 원인을 파악하고 고쳐보기로 했습니다.

그렇다면 Pandas가 어디서 인코딩을 잘못 읽어오고 있는지 확인하여야 합니다. 코드를 뜯어볼 시간입니다.

# 👨‍💻 코드 톺아보기

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

`JsonReader` 라는 클래스 인스턴스를 생성하고 파일을 읽은 뒤 결과를 돌려주게 되어 있습니다.

```python
# https://github.com/pandas-dev/pandas/blob/794a1c21cfcbadd7a36653d9c8184868442be35b/pandas/io/json/_json.py#L613
class JsonReader(BaseIterator):
    #...
    def __init__(
        #...
        self.encoding = encoding
        #...
        data = self._get_data_from_filepath(filepath_or_buffer)
        self.data = self._preprocess_data(data)

    #...
    def _get_data_from_filepath(self, filepath_or_buffer):
        #...
            data, _ = _get_handle(
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



## 결론
---

### Reference

> 