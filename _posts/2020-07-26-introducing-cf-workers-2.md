---
layout: post
title: Cloudflare Workers로 서버리스 앱 개발하기
description: Cloudflare Workers로 서버리스 앱 개발하기
tags: [Cloud]
---

> 이전 글 - [Cloudflare Workers 소개]({% link _posts/2020-07-26-introducing-cf-workers-1.md %})

![Workers Logo](/assets/post_images/cloudflare_workers_logo.jpg)

이 글에서는 Cloudflare Workers를 사용하여 JSON 데이터를 포매팅하는 간단한 앱을 만들어보도록 하겠습니다.

이 글에서 사용한 개발 환경은 다음과 같습니다.

- Windows 10 x64
- Node.js v12.6.0
- Wrangler v.1.10.3

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

> 전체 Wrangler CLI 명령어는 [여기](https://developers.cloudflare.com/workers/tooling/wrangler/commands/)를 참고하세요.

## 프로젝트 생성

`wrangler generate` 명령어로 `pretty-json`이라는 이름의 새로운 프로젝트를 생성하겠습니다.

```sh
wrangler generate pretty-json --type javascript
```

실행 후 생성된 `pretty-json` 디렉토리를 살펴보면 아래와 같은 보일러플레이트 파일들이 생성된 
것을 확인할 수 있습니다.

<div style="text-align: center;">
	<div><img src="/assets/post_images/wrangler_template.PNG" /></div>
</div>

#### __`wrangler.toml`__

가장 먼저 살펴봐야 할 파일은 `wrangler.toml` 입니다.
Rust에서 많이 사용하는 [TOML](https://github.com/toml-lang/toml) 문법으로 작성되어 있으며, Workers 프로젝트의 설정 파일입니다.

```toml
name = "pretty-json"
type = "javascript"
account_id = ""
workers_dev = true
route = ""
zone_id = ""
```

주요 항목은 다음과 같습니다.

- **name**: Workers 프로젝트 명입니다.
- **type**: 프로젝트의 타입입니다. 빌드 시 사용되며, `javascript`, `webpack`, `rust` 등의 옵션이 있습니다.
- **account_id**: 배포 시에 사용되는 Cloudflare 계정 ID 입니다.
- **workers_dev**: Cloudflare에서 제공하는 workers.dev 도메인에 배포할 지, 또는 커스텀 도메인에 배포할지를 지정하는 옵션입니다.

#### __`index.js`__

Workers 프로젝트의 엔트리포인트가 되는 파일입니다.

기본적으로 생성된 `index.js` 파일을 살펴보면 Workers 함수의 형태를 파악할 수 있습니다.

```js
/* index.js */

// 1. HTTP 요청이 들어오면 handleRequest를 호출합니다.
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 2. handleRequest에서 요청을 처리하고 Response 객체를 반환합니다.
async function handleRequest(request) {
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}
```

## 프로젝트 실행

주요 파일을 살펴봤으니 일단 기본 템플릿으로 생성된 코드를 실행해봅시다.

wrangler는 앱을 배포하기 전에 실행해보는 두 가지 방법을 제공합니다.

1. `wrangler dev`: 로컬 환경에서 코드 실행
2. `wrangler preview`: [Cloudflare Workers Playground](https://cloudflareworkers.com/)에 코드를 업로드하여 실행

```sh
# Local
wrangler dev
# Cloudflare Workers Playground
wrangler preview --watch
```

둘 중 자신에게 편한 커맨드를 사용하면 됩니다..

> __Note:__ wrangler 공식 문서에 따르면 `wrangler dev`는 alpha 단계 기능으로 동작 방식이 변경될 수 있다고 합니다.

이 글에서는 `wrangler dev`로 로컬 환경에서 코드를 실행해보겠습니다.

```sh
$ wrangler dev
...
 Running preview without authentication.
 Listening on http://127.0.0.1:8787
 watching "./"
```

실행 시 Cloudflare 계정 설정을 안 했다는 경고 메세지가 나타날 수 있지만 일단 무시하고 진행합니다.

앱은 `http://localhost:8787`에서 실행됩니다.

```sh
$ curl http://localhost:8787
Hello worker!
```

`http://localhost:8787`로 리퀘스트를 보내보면, Hello worker! 메세지로 응답하는 것을 확인할 수 있습니다.

## 기능 구현

기본적인 Workers 사용법을 확인해봤으니, 이제 원래 만들고자 한 기능을 구현해봅시다.

`pretty-json` 앱이 구현할 기능은 다음과 같습니다.

- `url` 파라미터로 특정 URL을 받아서, 해당 URL이 JSON을 반환하면, JSON.stringify()로 포맷팅해서 출력
- `hl` 파라미터가 1이면 JSON 하이라이팅

이러한 기능을 구현한 `index.js` 파일(일부)은 아래와 같습니다.

```js
// index.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const params = new URL(request.url).searchParams

  // `url`, `hl` 파라미터 처리
  const url = params.get('url')
  const highlight = params.get('hl') === "1"

  if (url === null) {
    return new Response('`url` parameter not given')
  }

  // `url` 파라미터에 따른 새로운 리퀘스트 생성
  req = new Request(url, request)
  req.headers.set('Origin', new URL(url).origin)

  // 리퀘스트 요청 및 처리
  const response = await fetch(req, contentTypeJson)
  const results = await gatherResponse(response)

  // Response 반환
  if (highlight) {
    return new Response(wrapJSON(highlightJSON(results)), contentTypeHTML)
  } else {
    return new Response(results, contentTypeJson)
  }
}
```

> 전체 코드는 [여기](https://github.com/ryanking13/pretty-json/blob/master/index.js)를 참고하세요.

간단한 JS 코드이므로 코드에 대한 설명은 주석으로 대신합니다.

구현한 기능을 아까와 같이 `wrangler dev`로 실행하고, `http://localhost:8787`로 접속해봅시다.

![wrangler json0](/assets/post_images/wrangler_json0.PNG)

접속 시 위와 같은 Raw JSON 데이터를 반환하는 [사이트](https://workers-tooling.cf/demos/static/json)가 있고,

![wrangler json1](/assets/post_images/wrangler_json1.PNG)

![wrangler json2](/assets/post_images/wrangler_json2.PNG)

방금 만든 Workers 앱에 `url` 파라미터로 해당 사이트의 URL를 전달하면,
포맷팅된 JSON을 반환하는 것을 확인할 수 있습니다.

## Worker 배포

이제 만든 Worker 앱을 실제로 배포하는 단계만이 남았습니다.

### 1. Cloudflare / Workers 계정 생성

Worker를 Cloudflare Workers에 배포하기 위해서는 Cloudflare 계정이 필요합니다.

[https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)에서 Cloudflare 계정을 생성합니다.

![CF registration](/assets/post_images/cloudflare_registration_01.PNG)

가입한 Cloudflare 계정으로, [Cloudflare Workers](https://workers.cloudflare.com/)에 로그인합니다.

처음 Workers에 접속하면 서브도메인 지정, 비용 플랜 선택, 이메일 인증 등을 요구합니다.
추후 변경이 가능한 항목들이니 상황에 맞게 입력/선택하시면 됩니다.

### 2. Account ID 확인 / API 토큰 생성

Workers 계정 설정을 완료하고 다시 [Cloudflare Workers](https://workers.cloudflare.com/)에 접속(로그인)하면,
다음과 같은 Workers 대시보드 창이 나타납니다.

![](/assets/post_images/workers_dashboard_01.jpg)

이 대시보드에서 바로 Worker를 생성하는 것도 가능하지만,
우리는 로컬 환경에서 작업한 Worker를 wrangler로 배포하도록 하겠습니다.

wrangler로 Worker를 배포하기 위해서는 Account ID와 API 토큰이 필요합니다.

화면 우측에 있는 것이 Account ID이고, 이 항목을 `wrangler.toml`의 `account_id` 항목에 입력합니다.

```toml
name = "pretty-json"
type = "javascript"
account_id = "<Account ID>"
...
```

다음으로 API 토큰을 생성하겠습니다.

![](/assets/post_images/workers_dashboard_02.jpg)

대시보드의 **Get your API token** 버튼을 클릭합니다.

![](/assets/post_images/workers_dashboard_03.jpg)

나타나는 화면에서 Create Token을 클릭하고,

![](/assets/post_images/workers_dashboard_04.jpg)

우리는 Worker를 배포(수정)하는 기능이 필요하므로 **Edit Cloudflare Workers** 템플릿을 고르겠습니다.

![](/assets/post_images/workers_dashboard_05.jpg)

예시 템플릿을 그대로 사용해도 됩니다.
저는 Workers를 수정하는 기능 빼고는 토큰의 권한을 전부 지워줬습니다.

![](/assets/post_images/workers_dashboard_06.jpg)

이어 버튼을 눌러 진행하면, API Token이 생성됩니다.
이 토큰은 한 번밖에 확인할 수 없으니 안전한 곳에 잘 저장해두어야 합니다.

```sh
$ wrangler config

╭────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                        │
│      To find your API Token, go to https://dash.cloudflare.com/profile/api-tokens      │
│              and create it using the "Edit Cloudflare Workers" template.               │
│                                                                                        │
│          If you are trying to use your Global API Key instead of an API Token          │
│                  (Not Recommended), run `wrangler config --api-key`.                   │
│                                                                                        │
╰────────────────────────────────────────────────────────────────────────────────────────╯

Enter API Token:
########
 Validating credentials...
 Successfully configured.
```

생성된 API 토큰을 `wrangler config`로 등록합니다. 이제 배포할 준비가 완료되었습니다.

### 3. Worker 배포

`wrangler publish`로 앱을 배포합니다.

> __Note__: `wrangler publish`는 앱을 빌드하는 `wrangler build` 명령어를 함께 실행합니다.
이 글과 같이 `javascript` 타입 앱의 경우 빌드가 필요없으나, `webpack`, `rust` 타입 앱의 경우 빌드가 필요합니다.

```sh
$ wrangler publish
 JavaScript project found. Skipping unnecessary build!
 Successfully published your script to https://pretty-json.ryanking13.workers.dev
```

Worker 배포가 완료되었습니다!

![](/assets/post_images/workers_publish.jpg)

[https://pretty-json.ryanking13.workers.dev](https://pretty-json.ryanking13.workers.dev/?url=https://workers-tooling.cf/demos/static/json)

배포된 주소로 접속해보면 로컬에서 Worker를 실행할 때와 동일한 결과를 확인할 수 있습니다.

### References

> https://developers.cloudflare.com/workers/tooling/wrangler
