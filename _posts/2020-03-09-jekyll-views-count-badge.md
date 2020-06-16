---
layout: post
title: HITS!를 이용하여 Jekyll 블로그에 조회수 배지 달기
description: HITS!를 이용하여 Jekyll 블로그에 조회수 배지 달기
tags: [Miscellaneous]
---

__TL;DR__

`_layouts/post.html`에 아래 구문을 삽입합니다.

{% raw %}
```html
  <div style="text-align: center;">
	<a href="http://hits.dwyl.com/{{ site.url | remove_first: 'https://' | remove_first: 'http://' }}/{{ page.url | remove_first: '/' | replace: '/', '-' }}" target="_blank">
	  <img src="http://hits.dwyl.com/{{ site.url | remove_first: 'https://' | remove_first: 'http://' }}/{{ page.url | remove_first: '/' | replace: '/', '-' }}.svg" />
	</a>
  </div> 
```
{% endraw %}


## 들어가며

[Jekyll](https://jekyllrb.com/)이나 [Hugo](https://gohugo.io/)과 같은 정적 사이트 생성기로 블로그를 운영하다보면,
대표적으로 발생하는 불편함으로 블로그 방문자와의 상호작용을 기록할 수가 없다는 점이 있습니다.

이는 자체적인 백엔드가 없기 때문인데요. 그렇다보니 서드파티 서비스를 이용하여 이를 대체하고는 합니다.

대표적으로 댓글 기능의 경우는 보통 [Disqus](https://disqus.com/)나 [utterances](https://utteranc.es/)를 이용해서 구현합니다.
방문 기록 분석은 십중팔구 [구글 애널리틱스](https://analytics.google.com/)를 이용합니다.

## 내 글의 조회수를 보여주고 싶다면?

구글 애널리틱스 하나면 누가, 어디에서, 언제, 어떤 검색어로, 블로그에 방문했는지 모두 알 수 있습니다.
그러나 이는 블로그 주인 자신만 볼 수 있다는 문제가 있습니다.

> "네가 보고 있는 이 글을 다른 사람들이 이만큼이나 봤어!"

위와 같은 생각, 즉 과시욕이나 신뢰감을 주려는 목적으로 글의 조회수를 보여주고 싶다면 어떻게 해야 할까요?

## Hits! 소개

![Hits logo](https://user-images.githubusercontent.com/194400/30136430-d1b2c2b8-9356-11e7-9ed5-3d84f6e44066.png)

[Hits!](http://hits.dwyl.io/)는 본래 깃헙 레포지토리 방문자 수를 세기 위해 만들어진 프로젝트입니다.

사용법은 매우 간단합니다.

```markdown
![HitCount](http://hits.dwyl.com/{unique-string}.svg)
```

![Hit svg](https://hits.dwyl.com/homepage.svg)

마크다운 기준으로 위 형태의 URL로 이미지를 불러오면, 해당 URL이 한 번 불릴 때마다 조회수가 1씩 올라간 배지가 표시됩니다.

```markdown
![HitCount](http://hits.dwyl.com/{username}/{project}.svg)
![HitCount](http://hits.dwyl.com/ryanking13/my-awesome-repository.svg)
```

본래 목적대로 깃헙 레포지토리 README에 배지를 달고자 한다면 위 형태의 URL을 사용할 수 있겠죠.

이 글의 목적대로 블로그에 사용한다면 아래와 같이 전체 URL을 넣어주는 형태로 사용하면 됩니다.

```markdown
![HitCount](http://hits.dwyl.com/ryanking13.github.io/2020/01/12/contributing-pandas.html.svg)
```

## 배지 자동 생성 레이아웃 설정

그러나 매번 글을 쓸 때마다 배지를 다는 것은 번거롭습니다.
오타를 내서 URL의 일관성이 떨어질 문제도 있구요.

그러니까 우리는 정적 페이지가 빌드 될 때에 자동으로 배지를 삽입하도록 해봅시다.

Jekyll 기준 게시글의 레이아웃을 지정하는 파일은 `_layout/post.html` 입니다.

제가 사용하는 [Type-on-Strap](https://github.com/sylhare/Type-on-Strap) 테마의 경우 `post.html`파일이 다음과 같이 되어있는데요.

{% raw %}
```html
...
  <header id="main" style="">
	...
	  <h1 id="{{ page.title | cgi_escape }}" class="title">{{ page.title }}</h1>
	...
  </header>
  <-- 제목과 본문 사이 공간 -->
  <section class="post-content">
	  ...
	  {{ content }}
	  ...
  </section>
```
{% endraw %}

Jekyll에서 사용하는 변수나, [Liquid](https://shopify.github.io/liquid/) 문법은 모르더라도,
대략적으로 윗 부분이 제목, 아랫 부분이 본문이라는 것을 알 수 있습니다.

이 사이에 배지를 넣어봅시다. 아래 코드를 복사해서 삽입합니다.

{% raw %}
```html
  <div style="text-align: center;">
    <a href="http://hits.dwyl.com/{{ site.url | remove_first: 'https://' | remove_first: 'http://' }}{{ page.url }}"
      target="_blank">
      <img
        src="http://hits.dwyl.com/{{ site.url | remove_first: 'https://' | remove_first: 'http://' }}{{ page.url }}.svg" />
    </a>
  </div>
```
{% endraw %}


[참고 예시](https://github.com/ryanking13/ryanking13.github.io/blob/7a67b1a957d91737b239e028501858068f7ad344/_layouts/post.html#L12-L18)

## 완성

이제 사이트를 배포하여 확인해봅시다.

![](../../../assets/post_images/hits01.png)

게시글마다 제목 아래에 예쁘게 배지가 붙어있습니다. 새로고침 할 때마다 숫자가 증가하는 것도 확인할 수 있습니다.

![](../../../assets/post_images/hits02.png)

URL은 위와 같이 생성되었네요.


### References 

> http://hits.dwyl.io/

> https://github.com/dwyl/hits
