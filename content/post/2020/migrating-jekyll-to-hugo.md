---
date: "2020-12-29T00:00:00Z"
title: 블로그 Jekyll to Hugo 마이그레이션 후기
categories:
- Miscellaneous
description: 블로그 Jekyll to Hugo 마이그레이션 후기
summary: " "
---

연말을 맞아 (지금 보고 있는) 개발 블로그의 프레임워크를 [Jekyll](https://jekyllrb.com/)에서 [Hugo](https://gohugo.io/)로 교체했습니다.
이 글에서는 프레임워크를 바꾸는 결정을 하게 되기까지의 과정과 블로그 마이그레이션 과정에서 발생한 소소한 이슈에 대해서 얘기해보려 합니다.

{{% admonition type="note" title="Note" %}}

Hugo를 처음 들어봤거나, 이 글을 읽고 Hugo에 관심이 생겼다면 [이 글](https://ialy1595.github.io/post/blog-construct-1/)을 추천합니다.

{{% /admonition %}}


## Jekyll 블로그의 시작

이 블로그가 처음 만들어진 2018년 초, Jekyll 프레임워크를 사용하게된 이유는 아주 단순했습니다.

1. 남들 따라서 github.io 블로그 하나 만들어보고 싶었고
2. 당시에는 정적 사이트에 대해 아는 게 없었고
3. Github Pages를 만들려고 보니 Github에서 Jekyll을 추천했고 [^mojombo]
4. Jekyll은 잘 모르겠지만 레포에 푸시를 하면 알아서 사이트를 만들어준다고 하니까 좋아보인다.

[^mojombo]: Jekyll의 개발자가 Github의 Co-Founder인 [mojombo](https://github.com/mojombo)니까요.

아마 많은 분들이 Github의 접근성 덕에 저와 비슷한 이유로 Jekyll을 사용하셨을 거라고 생각됩니다.

그렇지만 3년 가까이 Jekyll을 써오면서 느낀 소소한 불편함 때문에, 결국은 Jekyll에서 졸업하게 되었습니다.

## 안녕 Jekyll, 안녕 Hugo

제가 사용하면서 느낀 Jekyll의 단점, 그리고 그와 대비되는 Hugo의 장점은 다음과 같습니다.

### 1. 빌드 시간

Jekyll은 처음 웹페이지를 빌드하는 데에 십여 초가 걸리고, 변경 사항을 반영하여 화면에 업데이트에도 수 초가 걸리는 반면,
Hugo는 순식간이라고 해도 좋을만큼 빠르게 웹페이지가 빌드됩니다.

### 2. 테마 수정의 어려움

Jekyll은 테마 전체를 `git clone` 해오는 방식인 반면,
Hugo는 `git submodule`을 이용해서 submodule 형태로 테마를 관리합니다.
그래서 테마를 바꾸는 것도 쉽고, 원 테마 소스코드를 건드리지 않으면서 테마의 세부 항목을 수정하는 것도 간단합니다.

### 3. 템플릿 문법의 제약

Jekyll은 [Liquid](https://shopify.github.io/liquid/)라는 Shopify에서 개발한 템플릿 문법을 사용합니다.
그러나 Liquid가 지원하는 함수(filter)가 그리 다양하지 않아 복잡한 기능을 구현하는 데에 제약을 느끼는 경우가 종종 있었습니다.

한편, Hugo는 Go 언어에 내장된 [Go Template](https://golang.org/pkg/text/template/#hdr-Functions) 문법을 기반으로 Hugo에 최적화된 문법을 제공하고 있고, 기능 확장도 용이합니다. 굉장히 자세한 공식 문서는 덤이구요.


### 4. Ruby의 불편함

Jekyll은 Ruby를 기반으로 작성되어 있고,
가끔 초기 세팅 시에 발생하는 디펜던시 문제 등을 해결하기 위해서 Ruby에 대한 지식(Bundler, Gemfile)이 필요한 경우가 있었습니다.

그에 비해 Hugo는 Go로 작성되어 있지만,
Go에 대한 지식이 없어도 프리컴파일된 바이너리를 다운로드받아 사용하기만 하면 되고, 이 과정에서 불편함을 겪은 적이 없었습니다.

## Jekyll to Hugo migration

위와 같은 소소한 불편함이 쌓이고 쌓여 Jekyll에서 떠나기로 마음을 먹었습니다.
마침 기존에 쓰던 블로그 테마를 교체하려고 생각하고 있던 상황에서,
새 술은 새 부대에 라는 마음으로 테마와 함께 프레임워크도 교체를 하기로 결정했습니다.

이제부터는 마이그레이션 과정에서 있었던 이슈들에 대해서 간단히 적어보려 합니다.

### 0. hugo import jekyll

가장 먼저 소개할 것은, Hugo에는 Jekyll로 만들어진 사이트를 Hugo에 맞게 import 해오는 [`hugo import jekyll`](https://gohugo.io/commands/hugo_import_jekyll/) 커맨드가 존재합니다.
이 커맨드는 단순히 원래 있던 파일을 Hugo 디렉토리 구조에 맞춰서 이동시켜 주는 정도가 아니라, 원래 파일에 있던 메타데이터를 Hugo가 요구하는 형태로 변경해주기도 하고, 이미지나 폰트 같은 정적 애셋들도 그대로 가지고 와줍니다.

저의 경우는 `hugo import jekyll`을 실행하고 바로 Hugo로 페이지를 빌드했을 때도 일부 링크가 깨지는 것을 제외하면, 대부분의 페이지가 기존의 형태 그대로 빌드되는 것을 확인할 수 있었습니다.
사실 저는 초기 마이그레이션 과정에 난항을 겪을 것이라고 예상하고 있었어서,
*이렇게 쉽게 된다고?* 하고 굉장히 놀랐습니다.

물론 `hugo import jekyll`이 만능은 아닙니다. 다음은 수작업으로 해결해야 했던 부분을 간단히 얘기해보려 합니다.

### 1. URL Consistency 

블로그 마이그레이션에 있어 가장 먼저 고려했던 부분은 모든 포스트가 기존과 똑같은 URL을 유지하는 것이었습니다.
이미 다른 사이트에서 하이퍼링크 형태로 이 블로그의 포스트에 접근하고 있는 사람이 많기 때문에, 기존 포스트의 URL을 바뀌지 않게 하는 것이 중요했습니다.

Hugo는 [`permalink`](https://gohugo.io/content-management/urls/#permalinks-configuration-example) 설정을 통해 각 포스트의 빌드 결과물이 어떤 URL로 갈지 설정하는 것이 가능하고[^jekyll_permalink], 이를 기존 Jekyll 블로그 포맷과 동일하게 맞춰주었습니다.

[^jekyll_permalink]: 물론 [Jekyll도 permalink 설정이 가능합니다.](https://jekyllrb.com/docs/permalinks/)

```toml
# config.toml
[permalinks]
  post = "/:year/:month/:day/:filename.html"
# .html이 보기 흉한 건 어쩔 수 없습니다 😂
```

### 2. Liquid to Go Template

기존에 포스트에 Liquid 문법을 사용한 코드가 있다면,
이를 Go Template의 동등한 문법으로 바꾸어 주어야 했습니다.

대표적으로는, 포스트 간의 링크를 Jekyll에서는 Liquid의 `{% link %}` 문법으로 구현하는데,
Hugo에서 같은 기능을 사용하기 위해 이를 일일이 찾아 `{{</* ref */>}}` 문법으로 바꾸어 주었습니다.

```markdown
<!-- 이랬던 것이 -->
> 다음 글 - [링크]({% link _posts/2020-07-26-introducing-cf-workers-2.md %})

<!-- 이렇게 바뀌었습니다 -->
> 다음 글 - [링크]({{</* ref "introducing-cf-workers-2.md" */>}})
```

## 결론

제가 얼마간 써보면서 느낀 Hugo는 굉장히 빠르고, 확장성도 좋은 매력적인 프레임워크입니다.

이 글을 작성하는 2020년 말을 기준으로 [Jekyll (41.9k)](https://github.com/jekyll/jekyll)이나 [Hexo (32k)](https://github.com/hexojs/hexo)같은
쟁쟁한 경쟁자를 제치고 가장 많은 Stargazer를 받고 있는 것이 [Hugo (49k)](https://github.com/gohugoio/hugo)라는 점도
Hugo의 매력이 많은 사람들에게 어필하고 있는 부분이라고 볼 수 있을 것 같습니다. [^stargazer]

2021년도 새해를 맞아 올해는 블로그를 만들어봐야지! 하고 생각하고 있으시다면, Hugo를 선택해보시면 어떨까요?

[^stargazer]: 여기에는 중국에서의 Golang과 Hugo의 기묘한 인기가 허수로 반영되어 있다고 생각하긴 합니다.


### References

> https://gohugo.io/documentation/
