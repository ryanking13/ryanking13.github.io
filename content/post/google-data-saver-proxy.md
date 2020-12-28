---
date: "2018-04-26T00:00:00Z"
categories:
- Network
title: 크롬 데이터 세이버를 크롬 없이 사용하기
summary: 크롬 데이터 세이버의 동작을 뜯어보는 글입니다.
---

> UPDATE(2019/01/10)
> 데이터 세이버 프로그램이 업데이트 되면서 인증 방식이 많이 바뀌었습니다. (protobuf + signature)
> 따라서 아래 글의 방식은 더이상 동작하지 않습니다.

[데이터 세이버](https://chrome.google.com/webstore/detail/data-saver/pfmgfdlgomnbgkofeojodiodmgpgmkac?hl=ko)는 구글에서 제작한 크롬 브라우저의 확장 프로그램으로 크롬 웹 스토어에서는 다음과 같이 소개하고 있다.

> Google 서버를 통해 방문하는 페이지를 최적화하여 데이터 사용량을 줄이세요.

데이터 세이버의 기본 동작은 아주 단순한데, 구글 압축 서버(Google compress server)가 프록시(proxy)가 되어 서버가 보낸 데이터(주로 이미지)를 중간에서 압축하여 유저에게 보내는 방식이다.

아마 실제로는 캐싱도 해서 효율을 높이고 있을 것 같긴 한데, 어쨌거나 기본적인 동작은 압축이다.

![](../../../assets/post_images/without_data_saver.PNG)

__데이터 세이버를 껐을 때__

![](../../../assets/post_images/data_saver.PNG)

__데이터 세이버를 켰을 때__

데이터 세이버를 켜고 ssl을 사용하지 않는 사이트로 접속해보면 Remote Address가 달라져 있는 것을 확인할 수 있다.

---

### 구글 압축 서버에 직접 연결하기

데이버 세이버의 동작 방식이 단순히 구글 서버를 프록시로 사용하는 것이기 때문에, 우리는 굳이 데이터 세이버에 의존할 필요가 없다. 크롬 외의 다른 브라우저에서도 쉽게 같은 효과를 얻을 수 있고, 또는 브라우저 없이도 사용할 수 있다.

실제로 Firefox의 addon으로 일반 유저가 제작한 [Data saver proxy for Firefox](https://addons.mozilla.org/ko/firefox/addon/google_datasaver_for_firefox/)가 있다.

그렇다면 우리도 직접 연결을 해보자.

```
$ ping compress.googlezip.net
PING compress.googlezip.net (172.217.161.44) 56(84) bytes of data.
```

데이터 세이버를 켰을 때의 Remote Address인 172.217.161.44는 compress.googlezip.net이라는 도메인을 가진다.

해당 도메인을 프록시로 사용하여 리퀘스트를 보내보자.

```python
import requests

proxies = {
    'http': 'compress.googlezip.net',
    'https': 'compress.googlezip.net',
}

r = requests.get('http://www.bbc.com/', proxies=proxies)

print(r.status_code)
print(r.content)

# 502
# ...(omitted)...This page cannot be loaded using Chrome Data Saver. Try reloading the page...(omitted)...
```

단순히 프록시로 달기만 하는 것으로는 안되는 것 같다. 어떻게 동작하는 지 알아낼 필요가 있다.


구글 코드 아카이브를 찾아보면 [datacompressionproxy](https://code.google.com/archive/p/datacompressionproxy/)라는 것을 찾을 수 있다. compress.googlezip.net 서버가 이것을 사용할 것이라고 추정할 수 있다.

좀 더 찾아보면 이미 똑똑한 누군가가 이미 datacompressionproxy를 분석해서 standalone으로 활용할 수 있는 구현체를 만들어뒀다. (개이득!)

[Chrome-Data-Compression-Proxy-Standalone-Python](https://github.com/cnbeining/Chrome-Data-Compression-Proxy-Standalone-Python)

위 레포에서 코드를 살펴보면, `Chrome-Proxy`라는 헤더에 고정된 `authvalue`의 해시값을 포함한 특정 값을 심어서 보내야 한다는 것을 알 수 있다. 아래 코드는 위 레포에서 가져왔다.

```python
from hashlib import md5
import random
import time
import requests


# code from https://github.com/cnbeining/Chrome-Data-Compression-Proxy-Standalone-Python/blob/master/google.py
def get_long_int():
    return str(random.randint(100000000, 999999999))


# code from https://github.com/cnbeining/Chrome-Data-Compression-Proxy-Standalone-Python/blob/master/google.py
def get_google_header():
    authValue = 'ac4500dd3b7579186c1b0620614fdb1f7d61f944'
    timestamp = str(int(time.time()))
    return 'ps=' + timestamp + '-' + get_long_int() + '-' + get_long_int() + '-' + get_long_int() + ', sid=' + md5((timestamp + authValue + timestamp).encode('utf-8')).hexdigest() + ', b=2403, p=61, c=win'
```

이제 다시 리퀘스트를 보내보자.

```python
def get(url, headers={}, **kwargs):

    proxy_headers = {
        'Chrome-Proxy': get_google_header(),
    }

    # ...omitted...

    path_idx = url.find('/')
      host = url[:path_idx]
      path = url[path_idx:]

    proxy_headers.update({'Host': host})

    # ...omitted...

    return requests.get('http://compress.googlezip.net:80{path}'.format(path=path),
                        headers=proxy_headers, **kwargs)
```

요청을 보내고자 하는 url의 Host부분을 헤더의 `Host` 값으로 적어주었다.

```python
import requests
from google_compression_proxy import get as compress_get

http_image_url = 'http://ichef.bbci.co.uk/wwfeatures/wm/live/624_351/images/live/p0/4v/jy/p04vjy8l.jpg'
https_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Siberian_Tiger_by_Malene_Th.jpg/450px-Siberian_Tiger_by_Malene_Th.jpg'

r1 = requests.get(http_image_url)
r2 = compress_get(http_image_url)

print('Original image size:', len(r1.content))
print('Compressed image size:', len(r2.content))
# Original image size: 63816
# Compressed image size: 33361

r1 = requests.get(https_image_url)
r2 = compress_get(https_image_url)

print('Original image size:', len(r1.content))
print('Compressed image size:', len(r2.content))
# Original image size: 93198
# Compressed image size: 93198
```

이미지 url에 대해서 리퀘스트를 보내본 결과다.

http 요청에 대해서는 확실하게 이미지의 용량이 줄어든 것을 확인할 수 있다.

https 요청에 대해서는 압축을 하지 못한다.

샘플 코드를 포함한 전체 코드는 [여기](https://github.com/ryanking13/chrome-data-saver-python)에서 볼 수 있다.

---

### 다른 활용 방법

브라우저 없이 구글 압축 서버를 단순히 프록시 서버로 활용하는 방법도 있다.

웹 크롤링을 할 때 IP 차단 등을 이유로 프록시의 도움이 필요할 때가 있는데,

이를 위하여 [Free Proxy List](https://free-proxy-list.net/)나 [PubProxy](http://pubproxy.com/) 같은 좋은 사이트들이 있긴 하지만, 프록시들이 개개인의 선의로 제공되는 것이다보니 연결이 불안하거나 대역폭이 너무 작아서 쓰기 힘든 경우가 많다.

이럴 때 구글 압축 서버를 프록시로 사용하는 것이 한가지 방법이 될 수 있다.

다만 이것은 어뷰징으로 볼 여지가 있으니 선택은 개인의 몫에 맡긴다.

---

### Reference

> https://github.com/cnbeining/Chrome-Data-Compression-Proxy-Standalone-Python

> https://code.google.com/archive/p/datacompressionproxy/
