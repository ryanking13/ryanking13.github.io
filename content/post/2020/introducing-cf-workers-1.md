---
date: "2020-07-26T00:00:00Z"
description: Cloudflare Workers 소개
categories:
- Cloud
title: Cloudflare Workers 소개
summary: " "
---

![Workers Logo](/assets/post_images/cloudflare_workers_logo.jpg)

최근 마이크로서비스 아키텍처 중심으로 소프트웨어 개발 기법이 변화하면서,
FaaS (Function as a Service) 방식의 서버리스 컴퓨팅이 각광을 받고 있습니다.

[AWS Lambda](https://aws.amazon.com/ko/lambda/), [Azure Functions](https://azure.microsoft.com/ko-kr/services/functions/), [Google Cloud Functions](https://cloud.google.com/functions) 등 대표적인 클라우드 플랫폼에서
모두 FaaS 서비스를 제공하고 있고,
Google Cloud의 경우는 [Cloud Run](https://cloud.google.com/run?hl=ko)이라는 컨테이너 기반의 흥미로운 솔루션도 제공합니다.

아마 FaaS 방식의 서비스를 프로젝트에 도입하고자 한다면 대부분 위의 플랫폼들을 고려하실텐데요.
이 글에서는 기존의 플랫폼 대신, 다소 낯선 플랫폼을 소개하려 합니다.
바로 CDN(Content delivery network) 서비스로 유명한 Cloudflare의 [workers](https://workers.cloudflare.com/) 입니다.

## Workers의 특징

FaaS 클라우드 플랫폼이 제공하는게 다 고만고만하지 않나,
하는 생각이 들 수 있는데 Workers 이 녀석은 꽤나 독특합니다.

#### 1. V8 엔진 기반 런타임

Cloudflare Workers의 가장 큰 특징은 [V8 엔진을 기반으로 한 Workers 런타임을 이용하여 각 함수 별로 독립된 샌드박스 환경을 제공한다는 것](https://developers.cloudflare.com/workers/about/how-it-works/)입니다. 타 서비스가 각 함수를 VM 또는 컨테이너를 이용해서 격리된 환경을 구성하는 것과 대비되는 부분입니다.

![VM vs V8](https://blog.cloudflare.com/content/images/2018/10/Artboard-42@3x.png)

이러한 방식이 사용자 입장에서 어떤 차이를 가져오나 살펴보면, 각 함수가 각각의 VM/컨테이너에서 실행되는 타 서비스에 비해서, Workers는 __가벼운 V8 엔진 기반 Workers 런타임 + 하나의 런타임이 수많은 함수를 실행할 수 있다__ 는 점 덕분에 초기 실행속도가 어마어마하게 빨라집니다.

> _Workers processes are able to run essentially limitless scripts with almost no individual overhead by creating an isolate for each Workers function call._

<div style="text-align: center;">
	<span style="color:grey"><small>출처: https://developers.cloudflare.com/workers/about/how-it-works/</small></span>
</div>
<br/>

즉, 다시 말하면 서버리스 컴퓨팅의 고질적인 문제인 [Cold Start](https://mikhail.io/serverless/coldstarts/big3/)가 Workers에서는 획기적으로 줄어듭니다.

![Workers Logo](/assets/post_images/cloudflare_workers_cold_start.PNG)

Workers 소개 페이지에 따르면, Workers가 타 플랫폼 대비 50배 빠른 Cold Start 벤치마크를 보였다고 하며, 유료 플랜에서는 5ms 이하의 Cold Start 시간을 보장한다고 합니다.

#### 2. 리전: 지구 🌎

![Workers Region](/assets/post_images/cloudflare_workers_region.PNG)

Cloudflare Workers는 타 클라우드 플랫폼처럼 특정 리전을 정해서 앱을 배포하지 않습니다.
대신 Cloudflare의 방대한 CDN 네트워크를 활용하여 전 세계에 앱이 배포됩니다.
즉, 세계 어디에서나 적은 레이턴시로 서비스를 사용하는 것이 가능합니다.

> __Note__: AWS lambda에서도 자체 CDN 서비스인 [Cloudfront](https://aws.amazon.com/ko/cloudfront/)를 활용하여,
전 세계의 리전에 앱을 배포하는
[lambda@edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) 서비스를 제공합니다.
그렇지만 이 경우 CloudFront 비용을 추가로 부담해야 하고,
기본 AWS Lambda에 비해서 언어 등의 제약이 있습니다.

이러한 Workers의 특징을 더 잘 활용하기 위해 Cloudflare에서는 글로벌 Key-Value 스토리지인 [KV](https://developers.cloudflare.com/workers/reference/storage)도 함께 제공합니다.

#### 3. "무료"

![Workers Logo](/assets/post_images/cloudflare_workers_pricing.PNG)

Cloudflare Workers는 이 글을 작성하는 2020년 7월 기준, 일간 십만 회의 리퀘스트가 가능한 무료 플랜을 제공합니다.

AWS Lambda나 Azure Functions의 가격표를 보신 분이라면, _"다른 곳도 한 달에 리퀘스트 백만번까지 무료던데?"_ 라고 생각하실 수도 있는데요.
타 플랫폼은 리퀘스트 비용과는 별도로 스토리지, 네트워크 비용이 부과되기 때문에,
무료겠지? 하고서 간단한 프로젝트를 만들었다가 소소한 비용 청구를 당하는 경우가 있습니다.

그에 비해 Workers는 무료 플랜에서는 청구되는 비용이 아예 없어서 (신용카드 정보를 입력하지도 않습니다),
간단한 토이 프로젝트를 만들 때 부담 없이 사용할 수 있습니다.

## 단점

물론 장점이 있는만큼 Workers의 단점도 있습니다.

#### 1. 제한된 언어 지원

Workers는 자바스크립트 엔진인 V8을 기반으로 하는 특성상 근본적으로 개발 언어가 제한됩니다.
자바스크립트나 자바스크립트로 변환이 가능한 타입스크립트 정도만 쉽게 사용이 가능하며,
[WebAssembly](https://webassembly.org/)로 컴파일이 가능한 C, C++, Rust를 불완전하게 지원합니다.
따라서 파이썬, C#, 자바 등 다양한 언어를 지원하는 타 FaaS 플랫폼에 비해 개발 및 포팅에 애로사항이 있습니다.  

나는 자바스크립트가 너무 싫어! 같은 생각을 가진 분들이라면 WebAssembly의 발전에 희망을 걸어봐야 할 것 같네요.

> __Update(20/07/29)__: Cloudflare에서 [Python, Scala, Kotlin 등 타 언어에 대한 Workers 지원을 발표](https://blog.cloudflare.com/cloudflare-workers-announces-broad-language-support/)했습니다.
다만 해당 언어를 자바스크립트로 변환하는 서드파티 라이브러리에 의존하는 부분이 커서, 실제 프로덕션 코드에 사용이 가능할 지는 의문입니다.

#### 2. 타 서비스간의 연계성

AWS 같은 대형 클라우드 플랫폼들은 [일일이 나열하는 게 어려울 정도로 다양한 서비스](https://adayinthelifeof.nl/2020/05/20/aws.html)를 제공하고 있고,
이러한 서비스를 서로 간에 잘 연계해서 활용한다면 효율적으로 한 플랫폼에서 리소스를 관리할 수 있습니다.

그러나 Cloudflare에서 제공하는 클라우드 서비스는 Workers와 글로벌 스토리지인 KV 정도로,
다른 서비스와 Workers를 연계하여 앱을 개발하고자 한다면 결국 타 클라우드 플랫폼을 함께 사용해야 합니다.

## 결론

Cloudflare Workers는 타 클라우드 플랫폼의 FaaS 플랫폼과는 차별화되는 상당히 독특한 물건입니다.
Cloudflare에서 이번에 런칭한 [Cloudflare TV](https://cloudflare.tv/live)에서도 Workers를 도그푸딩하고 있다고 밝힌만큼,
Cloudflare 측에서도 지속적으로 Workers를 발전시킬 야심찬 계획을 가지고 있지 않을까 싶습니다.

새로운 서버리스 앱을 개발하고자 하는 계획이 있다면 한번쯤 Workers 사용을 고려해보시는 것도 좋을 듯 합니다.
이어지는 글에서는 Workers를 이용하여 간단한 서비스를 개발해보도록 하겠습니다.

> 다음 글 - [Cloudflare Workers로 서버리스 앱 개발하기]({{< ref "introducing-cf-workers-2.md" >}})

### References

> https://blog.cloudflare.com/cloud-computing-without-containers/

> https://mikhail.io/2018/08/serverless-cold-start-war/

> https://www.cloudflare.com/learning/serverless/serverless-performance/
