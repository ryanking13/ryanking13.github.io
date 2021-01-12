---
date: "2021-01-20T00:09:01Z"
description: kcaptcha
draft: true
tags:
- Machine Learning
title: kcaptcha
---

오픈소스 캡차 프로그램인 KCAPTCHA를 깨는 머신러닝 토이 프로젝트 개발기/포스트모템입니다.

## 들어가며

한국의 웹사이트에 많이 사용되는 대표적인 설치형 인터넷 게시판 소프트웨어(CMS, Contents Management System)으로 [그누보드](https://sir.kr/)가 있습니다.

![]()

(어디서 한 번은 봤을 법한 특유의 그누보드 UI)

그누보드는 스팸 게시글을 방지하기 위해 캡차를 활용하는데, 디폴트로 사용되는 것이 러시아에서 개발된 [KCAPTCHA](http://www.captcha.ru/en/kcaptcha/)입니다.

> 최신 그누보드는 구글의 리캡차(reCAPTCHA)를 디폴트로 사용하도록 바뀌었지만, 구글과의 연동의 번거로움 및 리캡차 자체의 번거로움으로 인해서인지 여전히 KCAPTCHA를 사용하는 곳이 많이 보입니다.

언뜻 보기에도 굉장히 약해보이는(?) KCAPTCHA 답게 상용 OCR API를 이용해서 KCAPTCHA를 시도가 있었는데요.

> https://studyforus.com/review/632853

이 글을 보고 실제로 KCAPTCHA 데이터를 학습한 머신러닝 모델로 어느 정도의 학습 성능을 낼 수 있을 지가 궁금해졌습니다.

그래서 이 토이 프로젝트를 시작했습니다. 이 토이 프로젝트의 목표는 다음과 같습니다.

1. 길이 2의 캡챠에 대해 95% 이상의 성능을 내는 모델 학습
2. 모델을 Javascript로 변환하여 브라우저only 환경에 배포

프로젝트를 진행한 머신의 스펙은 다음과 같습니다.

```
OS: Windows10 x64
GPU: NVIDIA RTX 3070
Software: Tensorflow 2.4.0 / CUDA 11.0
```

## 개발 도구 선정

이 프로젝트의 최종 목표는 단순 연구가 아니라 만들어진 모델을 배포하는 데에까지 있습니다.

GPU가 달린 서버를 운용하는 것은 비용적으로 부담이 되기 때문에, 학습한 모델을 자바스크립트로 변환하여 서버 없이 브라우저 환경에 배포하는 것을 목표로 잡았습니다.

모델을 JS로 변환하는 것을 지원하는 것은 Tensorflow.js밖에 없으므로, 필연적으로 개발 도구는 텐서플로우로 한정됩니다.

> (PyTorch 모델을 ONNX를 거쳐 Tensorflow.js 로 변환하는 것도 이론상 가능은 하다고 합니다.)

## 데이터셋 확보

실제 KCAPTCHA 프로그램을 사용하는 사이트에서 데이터를 수집하는 건 문제 소지가 있으므로, 직접 데이터를 생성하기로 하였습니다.

KCAPTCHA는 오픈소스로 공개되어 있으므로 다운로드 받아 사용할 수 있으며, 그누보드도 오픈소스이므로 그누보드에서 KCAPTCHA에 사용하는 디폴트 설정도 그대로 적용할 수 있습니다.

오리지널 KCAPTCHA 소스코드를 수정하여 원하는 캡차 문자열을 생성할 수 있게 만들고, 이를 자동화하는 스크립트를 작성합니다.

```
KCAPTCHA
```

```
PYTHON
```

> 전체 데이터셋 생성 코드는 [여기]()서 볼 수 있습니다.

## 문제 정의 / 데이터 임베딩

이제 수집한 데이터를 바탕으로 풀고자 하는 문제를 정의하겠습니다.

캡차를 깨는 것을 이 글에서는 다음과 같이 정의 합니다.

> C개의 클래스를 가진 길의 L의 문자열을 분류(classcify)하는 문제

우리는 경험적으로 많이 본 형태인 숫자(0-9)만으로 구성된 길이 2의 캡차를 사용하도록 하겠습니다. (C=10, L=2)

문제를 이렇게 정의하면, 우리가 만들 분류기의 출력은 다음의 두 가지 중 하나로 구성할 수 있습니다.

> 1. C 길이의 1차원 벡터 L개

> 2. C*L 길이의 1차원 벡터

전자의 경우는 머신 러닝을 처음 배울 때 했던 MNIST 문제가 L개 있는 것이라고 생각할 수 있겠습니다. 이 경우 loss는 L개의 output에 대해 각각의 loss를 계산해야겠네요.

후자는 C개 클래스에 대한 One-Hot Encoding을 길이 L만큼 반복한 형태입니다.

예를 들어 숫자 42의 경우 다음과 같이 임베딩됩니다.

[
    0, 0, 0, 0, 1.0, 0, 0, 0, 0, 0,
    0, 0, 1.0, 0, 0, 0, 0, 0, 0, 0,
]

자, 그럼 이 문제에 대해서 loss 함수를 정의해야 합니다.

MNIST 등에서 흔히 보는, C개의 클래스 중 하나의 클래스로 분류하는 Multi-class classfication 문제는 Softmax 함수에 Cross Entropy를 붙인 categorical cross entropy loss 함수를 사용하는데요.

이 문제는 전체 벡터의 합이 1이 아닌 길이 L(위 경우는 2)이므로 알맞지 않습니다.

이와 같이 하나의 오브젝트가 여러개의 클래스를 가지는 문제는 multi-label classification.

multi-label classification 문제의 loss 함수를 정의하는 방법 중 가장 간단한 것은 binary cross entropy를 사용하는 것입니다.

C*L개의 각각의 결과를 독립적으로 보고 binary한 분류 결과를 loss로 사용하는 것이죠.

둘 중 어느 것에 특별한 성능적인 이점이 있을지는 사실 잘 모르겠는데요 (아시는 분이 있다면 댓글 부탁드립니다.).

전자의 경우 multi-output을 처리하는게 여러모로 까다로운 문제일 것이라고 생각해서 편의상 후자의 방법을 선택했습니다.

## 모델 / 학습 구현

이제 실제로 모델을 구현할 차례입니다.
모델은 tensorflow.keras.application의 model zoo에 구현되어 있는 모델 중

> MobileNetV2
> DenseNet

두가지를 사용해보았습니다.

선택 기준은 단순히 최종 브라우저 배포 환경을 고려하여 파라미터 수가 많지 않을 것 (용량이 적을 것) 입니다.

텐서플로우에서 ImageNet으로 사전 학습된 모델을 제공하므로 해당 모델을 받아서 fine-tuning 하도록 하겠습니다.

옵티마이저로는 Adam, 러닝 레이트는 1e-4를 사용합니다.

```
모델 코드
```

```
학습 코드
```

> 전체 코드는 여기

```
결과
```

## 학습 과정에서의 이슈

1. 모델 선정

처음에는 브라우저에 이식하기 위해 최대한 작은 모델인 MobileNet V2를 선택.

그러나 validation loss가 충분히 떨어지지 않는 상황 발생.

모델이 작아서 발생하는 근본적인 문제?

2. custom accuracy

accuracy measure로 텐서플로우 기본 accuracy를 사용했는데, loss가 계속 떨어짐에도 불구하고 accuracy값은 0.5 근처에서 횡보하는 상황 목격. 이는 accuracy를 계산하는 방식(찾기)에 의함.
실제로 캡차를 계산하는 custom accuracy metric를 넣어줘서 이를 해결함.

3. preprocessing

데이터셋의 노이즈 등을 제거해주는 preprocessing 과정을 학습 전에 수행해봤으나, 그렇게 하지 않아도 충분히 높은 accuracy가 나와서 큰 의미가 없어졌음.
리얼타임으로 전처리를 하기는 어려우니 이러한 경우는 그대로 사용해도 될듯. 성능이 crutial하고 잘 나오지 않으면 고려해봐도 될 듯.

## 해결하지 못하는 문제점

1. Data Distribution

kcaptcha의 생성 옵션을 바꿔서 distribution을 조금만 바꿔도 성능 확 떨어짐 (확인).

본 실험에서는 실제로 사람들이 이러한 파라미터를 건드리지 않을 것이라고 가정하고 수행했으나, 더 현실적이고 하드한 컨디션을 고려하면 이를 개선해야 할듯.

(augmentation, 데이터 확보)

2. 고정 길이

캡차의 길이가 고정되어 있음. 이에 대해서는 [Part 3]3에서 Object Detection 방식을 적용하여 해결

[이어지는 글]()에서는 구현한 모델을 js로 변환하여 브라우저에 배포하는 내용에 대해서 다룹니다.

## 

[이전 글]()에서 ~ 다루었습니다.

이번 글에서는 완성한 모델을 브라우저에 배포하여 서빙하기까지의 과정에서 발생한 이슈에 대해서 다룹니다.

## Tensorflow.js

텐서플로우는 Tensorflow.js라는 이름의 자바스크립트 머신러닝 라이브러리를 제공합니다.

완성된 모델을 실행하는 것 뿐만 아니라, 새로 모델을 학습시키는 것 역시 지원. webgl을 통해 GPU를 지원하는 것은 덤이구요.

Tensorflow.js는 케라스가 사용하는 HDF5 포맷 또는, 텐서플로우에서 네이티브로 사용하는 SavedModel 등의 포맷을 자체 포맷으로 변환하는 `tensorflowjs_converter` 커맨드를 제공합니다.

앞서 Part1의 코드가 keras 모델을 사용했으므로 우리는 hdf5 형태로 모델을 export하고, 변환하도록 하겠습니다.

```
저장 코드
```

```
변환 코드
```

에러가 발생하네요? 우리가 multi label 문제의 accuracy를 측정하기 위해 만든 custom metric을 변환할수가 없나봅니다.


```
TensorFlow.js 레이어는 현재 표준 Keras 구성을 사용하는 Keras 모델 만 지원합니다. 지원되지 않는 작업 또는 계층 (예 : 사용자 지정 계층, Lambda 계층, 사용자 지정 손실 또는 사용자 지정 지표)을 사용하는 모델은 JavaScript로 안정적으로 번역 할 수없는 Python 코드에 의존하기 때문에 자동으로 가져올 수 없습니다.
```

어떻게 하면 좋을까요?

이를 깔끔하게 해결하는 방법이 있을 수도 있겠지만,
저는 간단한 해결책을 사용했습니다. custom metric을 안쓰는 거죠.

```
코드
```

앞서 모델을 저장할 경우에는 커스텀 메트릭을 쓰지 않게 설정하였습니다. 어차피 loss는 네이티브한 것을 사용하니 학습에는 큰 문제가 없습니다.

```
다시 변환
```

다시 변환해보면 output으로 지정한 폴더에 metric.json과 함께 weight파일들이 생성됩니다.

## js코드 작성

이제 변환한 모델을 js에서 읽어서 사용해줄 차례입니다.

```
npm install @tensorflow/tfjs
```

```js
    this.model = await tf.loadGraphModel(
      location.href + "/models/l2_160_60/model.json"
    );
```

`tf.loadGraphModel`을 이용하여 모델 파일을 읽어옵니다.

```js
    tfGetImage: function (imageId) {
      // Get HTMLImageElement from the document
      const imgElem = document.getElementById(imageId);
      const img = tf.browser.fromPixels(imgElem);
      return this.tfPreprocessImage(img);
    },
```

HTML 문서에서 이미지를 읽어와서 `fromPixels`로 이미지로 변환합니다.

```js
    tfPreprocessImage: function (img) {
      const mean = tf.tensor1d([0.485, 0.456, 0.406]);
      const std = tf.tensor1d([0.229, 0.224, 0.225]);
      const size = [60, 160, 3]; // [height, width, channel]
      return img.reshape(size).toFloat().div(tf.scalar(255)).sub(mean).div(std);
    },
```

파이썬에서 수행한 것과 똑같은 전처리 과정을 수행해주어야 합니다.

ImageNet으로 사전 학습된 Keras DenseNet 구현체는 전체 데이터셋의 평균/표준편차를 이용해서 데이터를 표준화해주는 작업이 들어갑니다.

```js
    tfPredictCaptcha: function () {
      const img = this.tfGetImage("captcha");
      const imgBatch = img.expandDims(0);
      // console.log(imgNormalizedBatch)
      const result = this.model.predict(imgBatch);
      this.captchaVal = this.tfDecodePrediction(result, 10, 2);
    },
    tfDecodePrediction: function (tensor, numCharSet) {
      // tensor.print();
      // slice tensor to each captcha character
      var sliced = tensor.dataSync().reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / numCharSet);
        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []; // start a new chunk
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
      }, []);
      // extract predictions for each character
      const argMax = (array) =>
        array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
      const predicted = sliced.map(argMax).join("");
      // console.log(predicted);
      return predicted;
    },
  },
```

추론과 추론 결과를 디코딩하는 코드입니다.

> 전체 코드는 여기서, Vue.js로 작성되었습니다.

## 배포

이제 완성된 코드를 정적 사이트로 빌드하여 Github Page를 통해 배포

> https://ryanking13.github.io/kcaptcha

```
GIF
```

## Part 3

앞서 문제 정의, 데이터 수집, 모델 구현, 변환 및 배포까지 일련의 프로세스를 다루어 보았습니다.

이번 글에서는 기존 모델의 문제점을 개선하고 .

기존 모델의 문제는 길이가 고정되어야 있어야 한다는 점.
길이가 다양한 캡차를 풀 수 없다는 점.

이는 classification 으로 문제를 정의했기 때문,
문제 정의를 바꾸지 않고 이를 해결하는 방법은

1. 최대 길이에 맞춰서 output을 뽑고 결과를 해석하는 방식을 조정

2. 길이 별로 모델을 따로 학습시키고, 추가로 길이를 판단하는 모델을 학습

1번 방법은 학습이나 추론이 까다로워 보이고, 2번은 간단하지만 redundancy가 너무 많은 것으로 생각된다.

그러므로 문제 정의를 바꾸자. classification 문제가 아니라 object detection 문제로

## 데이터셋 재확보

classification과 object detection에 사용하는 데이터셋은 전혀 다르므로 학습할 데이터셋부터 다시 만들어야 한다.

kcaptcha 생성 코드에서 bounding box를 추출하는 부분을 추가하였다

```
코드
```

## 모델 구현

텐서플로우의 공식적인 Object Detection 모델은 Tensorflow Object Detection API를 통해서 주로 제공된다.

그러나 복잡한 프레임워크에 맞추기는 번거롭기 때문에 대신 tf2-yolo3 구현체를 사용하기로 함.

## dataloader 작성

## 학습

## 변환

## 배포