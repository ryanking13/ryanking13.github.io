---
layout: post
title: Cloudflare Workers 사용해보기
description: Cloudflare Workers
tags: [Cloud]
---

> 이전 글 - []

![Workers Logo](/assets/post_images/cloudflare_workers_logo.jpg)

이번 글에서는 Cloudflare Workers를 사용하여 JSON 데이터를 포매팅하는 간단한 함수를 만들어보도록 하겠습니다.

제 개발 환경은 다음과 같습니다.

- Windows 10 x64
- Node.js v.
- Wrangler v.

## wrangler

![Wrangler Logo](https://github.com/cloudflare/wrangler/raw/master/banner.png)

`wrangler`는 Workers 개발을 위한 CLI 도구 입니다. AWS의 `awscli`나 Azure의 `az`를 생각하시면 이해가 쉬울 듯 합니다.

`wrangler`는 Rust로 작성되어있고, npm이나 cargo로 설치가 가능합니다.

```sh
npm i @cloudflare/wrangler -g
# or
cargo install wrangler
```

Workers 프로젝트 생성, 설정, 빌드, 배포 등을 모두 `wrangler`를 통해서 수행하게 됩니다.

자세한 Wrangler CLI 명령어는 [여기](https://developers.cloudflare.com/workers/tooling/wrangler/commands/)를 참고하세요.

## 프로젝트 생성

`wrangler generate` 명령어로 새로운 프로젝트를 생성합니다.

```sh
wrangler generate pretty-json --type javascript
```

실행 후 pretty-json 디렉토리를 살펴보면 아래와 같은 보일러플레이트 파일들이 생성된 것을 확인할 수 있습니다.

```

```

__`wrangler.toml`__

먼저 살펴봐야 할 파일은 `wrangler.toml` 입니다.
[TOML](https://github.com/toml-lang/toml) 문법으로 작성되어 있으며, Workers 프로젝트의 설정 파일입니다.

주요 항목은 다음과 같습니다.

-
-
-

__`index.js`__

Workers 프로젝트의 엔트리포인트가 되는 파일입니다. (`wrangler.toml`을 수정하여 변경 가능합니다.)

기본 템플릿으로 생성된 `index.js` 파일을 살펴보면 Workers를 사용하는 방법을 대략적으로 파악할 수 있습니다.

HTTP 리퀘스트 (event)를 받고, 해당 리퀘스트를 처리하여 response 객체를 반환하면 됩니다.

...

## 프로젝트 실행

필요한 파일을 대충 살펴봤으니 일단 기본 템플릿 코드를 실행해봅시다.

wrangler는 두 가지 실행 방법을 제공하는데, 하나는 코드를 로컬 환경에서 실행하는 것이고,
다른 하나는 [Cloudflare Workers Playground](https://cloudflareworkers.com/)에 코드를 올려서 실행하는 방법입니다.

각각 `wrangler dev`, `wrangler preview` 명령어로 실행합니다.

```sh
# Local
wrangler dev
# Cloudflare Workers Playground
wrangler preview --watch
```

둘 중 자신에게 편한 방법으로 사용하면 되겠습니다.
다만, wrangler 공식 문서를 보면 `wrangler dev`는 아직 불안정하다고 합니다.

저는 `wrangler dev`로 로컬 환경에서 실행해보겠습니다.

```sh
wrangler dev
...
```

경고 메세지는 Cloudflare Workers 계정 설정을 아직 안 해서 나타나는 메세지이므로 일단 무시해도 됩니다.

```sh
curl http://localhost:8787
...
```

`http://localhost:8787`로 리퀘스트를 보내보면, `` 메세지로 응답하는 것을 확인할 수 있습니다.

## 기능 구현

기본 제공 코드를 실행해봤으니, 이제 우리가 원하는 기능을 구현해봅시다.

만들 기능은 다음과 같습니다.

- `url` 파라미터로 특정 URL을 받아서, 해당 URL이 JSON을 반환하면, JSON.stringify로 포맷팅해서 출력
- `hl` 파라미터가 1이면 하이라이팅

코드는 아래 링크를 참고했습니다.

- json
- highlight

```js
// index.js

```



### References

> https://developers.cloudflare.com/workers/tooling/wrangler
