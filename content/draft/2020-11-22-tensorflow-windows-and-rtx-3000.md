---
date: "2020-11-22T00:00:00Z"
description: 텐서플로우 with RTX 3070 삽질기
draft: true
tags:
- Machine Learning
title: 텐서플로우 with RTX 3070 (feat. Windows) 삽질기
---

__TR;DR__

- 1. 3천 번대 RTX GPU는 CUDA 11.0 이상을 요구합니다.
- 2. 텐서플로우는 아직 정식 릴리즈되지 않은 2.4 버전부터 CUDA 11.0을 지원합니다. [20.11.22 기준]
- 3. 그런데 윈도우즈에서 3천 번대 RTX GPU에 맞는 CUDA 코드 JIT 컴파일을 위해서는 CUDA 11.1이 필요합니다(와장창).

---

![RTX 3070 GALAX](/assets/post_images/RTX_3070.jpg)

_내가 바로 RTX 3070 오너_

## 들어가며

최근 데스크탑을 맞추면서 새로 나온 NVIDIA RTX 3070 그래픽카드를 구매했습니다.
그동안 소소하게 머신 러닝 프로젝트를 할 때 쓰던 GTX 965M 그래픽 카드가 달린 게이밍 노트북을 버리고,
'나도 좋은 그래픽카드로 힙하게 텐서플로우를 돌려보겠어', 하는 마음이었죠.

그렇지만 그게 그리 마음처럼 쉽게 되지 않았습니다.

## Q1. 텐서플로우 초기화가 너무 느려요...

> 개발 환경
- Windows 10 x64
- Tensorflow 2.3.1
- CUDA 10.1
- CUDNN 7.6.2

아무 걱정 없이 기존에 노트북에서 개발하던 프로젝트를 그대로 받아 실행하려고 했을 때,
가장 처음 맞닥뜨린 문제는,

> 텐서플로우가 돌아가기는 하는 것 같은데... 왜 이렇게 느리지?

였습니다.

```sh
2020-11-21 22:35:20.079981: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library cudart64_101.dll
2020-11-21 22:35:24.121484: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library nvcuda.dll
2020-11-21 22:35:24.168994: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1716] Found device 0 with properties:
pciBusID: 0000:01:00.0 name: GeForce RTX 3070 computeCapability: 8.6
...
2020-11-21 22:35:25.234873: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library cudnn64_7.dll
2020-11-21 22:35:25.237763: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1858] Adding visible gpu devices: 0 # 여기서 수분의 시간이 소요됩니다
2020-11-21 22:39:20.902689: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1257] Device interconnect StreamExecutor with strength 1 edge matrix:
...
```

텐서플로우로 ~.

이 문제의 실마리는 아래의 깃헙 이슈에서 찾을 수 있었는데,

> Yeah, unfortunately TF 2.3 does not support GPUs with compute capability 8.x. tf-nightly and the upcoming TF 2.4 release should both work, PTAL. Both tf-nightly and TF 2.4 will use CUDA 11.

https://github.com/tensorflow/tensorflow/issues/43718#issuecomment-703871083

이 글 작성 시점 기준 stable 버전인 텐서플로우 2.3이 compute capability 8.x를 지원하지 않기 때문에 2.4를 사용하라는 답변이었습니다.

조금 더 파헤쳐보면

https://www.tensorflow.org/install/gpu?hl=EN#hardware_requirements

> On systems with NVIDIA® Ampere GPUs (CUDA architecture 8.0) or newer, kernels are JIT-compiled from PTX and TensorFlow can take over 30 minutes to start up. This overhead can be limited to the first start up by increasing the default JIT cache size with: 'export CUDA_CACHE_MAXSIZE=2147483648' (see JIT Caching for details).

텐서플로우 공식 문서에서도 CUDA 아키텍쳐 8.0 이상에서 JIT 컴파일 과정으로 인해서 텐서플로우의 초기화 단계에 수십분이 소요될 수 있다는 언급이 있습니다.

https://developer.nvidia.com/cuda-gpus

3천 번대 RTX GPU는 모두 8.6의 capability를 가지고 있어서, JIT 컴파일 때문에 시간이 오래 걸리는 것이라고 합니다.

## A1. CUDA 버전 업데이트

이러한 GPU의 capability를 지원하기 위해서는 결국 CUDA에서 지원을 해야합니다.

지금까지 텐서프로우가 쭉 사용해오고 있던 CUDA 10.1 버전에서는 7.x 까지의 capability만 지원하기에,
CUDA 11.0 버전 이상을 사용해야만 하고,
텐서플로우 2.4 버전부터 CUDA 11.0 을 사용하기로 되어있기 때문에 텐서플로우 2.4를 사용하라고 개발자가 답변한 것이죠.

일단 해결된 것 같습니다. CUDA와 텐서플로우 버전을 올려보도록 합시다.

## Q2. 에러








 


![CMS Logo](http://cms-dev.github.io/cms.svg)

> 전체 코드는 [ryanking13/oneshot-cms-deploy](https://github.com/ryanking13/oneshot-cms-deploy)에서 볼 수 있습니다.

## 발단

지난 3월, 코로나 사태로 인해 대학교들이 온라인 개강을 하면서,
지인으로부터 프로그래밍 과제용 사이트를 구축해달라는 요청을 받았습니다.

시중에 다양한 온라인 저지/프로그래밍 대회 플랫폼이 오픈소스로 존재해서
사이트를 구축하는 것 자체는 어렵지 않았지만,
문제는 당시에 제가 기초군사훈련을 앞두고 있어 지속적인 사이트 관리가 어려운 상황이었습니다.
사이트 구축을 요청하신 분께서 이슈에 일일이 대응하는 것은 불가능했구요.

그래서 떠올린 해결책이 전체 서비스를 도커라이징해서 쉽게 배포할 수 있게 만들고,
문제가 발생하면 그냥 인스턴스를 날려버리고 재실행할 수 있게 제공하는 것이었습니다.

마침 늘 이미지를 받아 쓰기만 하던 도커를 제대로 살펴보고 싶다는 생각도 있어서,
일 반 공부 반으로 작업을 시작했습니다.

> 👨: 문제 생기면 그냥 날리고 다시 시작 오케이? <br/>
👦: ㅇㅋ


### References

> [http://supervisord.org/](http://supervisord.org/)

[^1]: 국제정보올림피아드, 한국정보올림피아드에서도 사용된 적이 있습니다.