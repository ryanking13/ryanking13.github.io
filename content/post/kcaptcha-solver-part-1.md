---
date: "2021-01-20T00:09:01Z"
description: kcaptcha
draft: true
tags:
- Machine Learning
title: kcaptcha
---

오픈소스 캡차 프로그램인 KCAPTCHA를 깨는 머신러닝 토이 프로젝트 개발기입니다.

**이런 내용에 대해 다룹니다**

- 데이터 수집 - 모델 구현 - 학습 - 모델 배포 파이프라인
- 개발 과정에서 발생한 이슈와 해결책

**이런 내용을 다루지 않습니다**

- 텐서플로우 기초 문법
- 최신 머신러닝 모델 및 학습 기법

## 0. 들어가며

한국 웹사이트에 많이 사용되는 대표적인 설치형 인터넷 게시판 소프트웨어(CMS, Contents Management System)로 [그누보드](https://sir.kr/)가 있습니다.

![]()

(어디서 한 번은 봤을 법한 특유의 그누보드 UI)

그누보드는 스팸 게시글이 등록되는 것을 방지하기 위해 러시아에서 개발된 [KCAPTCHA](http://www.captcha.ru/en/kcaptcha/)라는 캡차 프로그램을 사용합니다.[^recaptcha]

[^recaptcha]: 최신 그누보드는 구글의 리캡차(reCAPTCHA)를 디폴트로 사용하도록 바뀌었지만, 구글 API 연동의 번거로움 및 리캡차 자체의 불편함으로 인해서인지 여전히 KCAPTCHA를 사용하는 곳이 종종 보입니다.

**KCAPTCHA 예시**

![](https://github.com/ryanking13/kcaptcha-generator/raw/master/samples/58_005205.png)

![](https://github.com/ryanking13/kcaptcha-generator/raw/master/samples/72_001048.png)

마지막으로 업데이트 된 것이 2011년도인 KCAPTCHA는 언뜻봐도 굉장히 약해보이는(?) 캡차인데요.

간단한 머신러닝 모델로 이 캡차를 어느 정도 수준으로 파훼할 수 있을까하는 궁금증에 ~~(그리고 심심해서)~~
이 토이 프로젝트를 시작했습니다.[^kakaoapi]  이 프로젝트의 목표는 다음과 같습니다.

[^kakaoapi]: 이미 [상용 OCR API를 통해 KCAPTCHA를 파훼하려는 시도](https://studyforus.com/review/632853)도 존재합니다

1. 길이 2의 숫자 캡챠에 대해 95% 이상의 성능을 내는 모델 학습
2. 학습한 모델을 자바스크립트로 변환하여 브라우저 환경에 배포

프로젝트를 진행한 머신의 환경 및 스펙은 다음과 같습니다.

- OS: Windows10 x64
- GPU: NVIDIA RTX 3070
- Libraries: Tensorflow 2.4.0 / CUDA 11.0

## 1. 개발 도구 선정

이 프로젝트의 최종 목표는 학습된 모델을 외부에 배포하는 데에 있습니다.

GPU가 달린 서버를 운용하는 것은 비용적으로 부담이 되기 때문에,
학습한 모델을 자바스크립트로 변환하여 서버 없이 브라우저 환경에 배포하는 것을 목표로 잡았습니다.

머신러닝 모델을 자바스크립트로 변환하는 것을 지원하는 것은 라이브러리는 Tensorflow.js밖에 없으므로, 필연적으로 개발 도구는 텐서플로우로 한정됩니다.

> Note: 시도해보지는 않았지만 PyTorch --> ONNX --> Tensorflow --> Tensorflow.js도 이론상 [가능](https://drsleep.github.io/tutorial/Tutorial-PyTorch-to-TensorFlow-JS/)하다고는 합니다.

## 데이터셋 생성

실제 KCAPTCHA 프로그램을 사용하는 사이트에서 데이터를 수집하는 것이 제일 확실한 데이터 수집 방법이겠지만,
법적 문제 소지가 있으므로, 직접 데이터를 생성해보기로 합시다.

PHP로 만들어진 KCAPTCHA는 오픈소스로 공개되어 있으므로 누구나 다운로드 받아 사용할 수 있으며,
그누보드도 오픈소스이므로 그누보드에서 KCAPTCHA에 사용하는 디폴트 옵션도 그대로 적용할 수 있습니다.

```php
...
$captcha = new KCAPTCHA($_GET['string']);

if($_REQUEST[session_name()]){
	$_SESSION['captcha_keystring'] = $captcha->getKeyString();
}
...
```

PHP로 작성된 KCAPTCHA 소스코드를 수정하여, 원하는 캡차 문자열 이미지를 생성할 수 있도록 수정하고,

```python
...
_, headers = urllib.request.urlretrieve(
    "http://localhost:%d?string=%s" % (port, target),
    filename=save_path,
)
...
```

캡차 이미지 생성을 자동화하는 파이썬 스크립트를 작성하였습니다.

> 전체 데이터셋 생성 코드는 [여기](https://github.com/ryanking13/kcaptcha-generator)서 볼 수 있습니다.

## 2. 문제 정의

수집된 데이터로 학습을 하려면, 우리가 풀고자하는 문제가 정확히 어떤 것인지 정의할 필요가 있습니다.

캡차를 푸는 것을 다음과 같이 정의하겠습니다.

> C개의 클래스를 가진 길의 L의 문자열을 분류(classify)하는 문제

C는 캡차를 구성하는 것이 숫자(0-9)인지, 알파벳(a-z)인지 등에 따라 달라질 것이고, L은 캡차의 길이에 따라 정해질 것입니다.

저는 경험적으로 많이 본 형태인 숫자(0-9)만으로 구성된 길이 2의 캡차를 푸는 모델을 만들도록 하겠습니다. `(C=10, L=2)`

## 3. 데이터 임베딩

풀고자 하는 문제를 정의했으니, 이를 학습하기 위해서 데이터를 어떻게 임베딩할지를 살펴보도록 하겠습니다.

제가 생각한 분류기의 출력은 크게 다음의 두 가지 중 하나입니다.

1. __C 길이의 1차원 벡터 L개__
2. __C*L 길이의 1차원 벡터__

전자의 경우는 MNIST 문제가 L개 있는 것이라고 생각할 수 있겠습니다(물론 입력 이미지는 한 개 이지만요).
이 때 모델의 전체 loss는 L개의 출력에 대해 각각의 loss를 더한 값이 되겠네요.

예를 들어 숫자 42의 경우 다음과 같이 임베딩됩니다.

```
pred0 = [0   0   0   0   1   0   0   0   0   0]
pred1 = [0   0   1   0   0   0   0   0   0   0]
total_loss = loss(pred0, label0) + loss(pred1, label1)
```




후자는 C개 클래스에 대한 One-Hot Encoding을 길이 L만큼 반복한 형태입니다.

숫자 42의 경우 다음과 같이 임베딩됩니다.

```
pred = [
  0   0   0   0   1   0   0   0   0   0
  0   0   1   0   0   0   0   0   0   0
]
total_loss = loss(pred)
```

임베딩은 정의하기 나름이니 정답은 없습니다만,
저는 전자의 경우 Multi-Output을 구현하는 것이 여러 측면에서 번거로운 부분이 생길 것이라고 판단해,
후자의 방식을 채택했습니다.

### Loss 함수 정의

```
pred = [
  0   0   0   0   1   0   0   0   0   0
  0   0   1   0   0   0   0   0   0   0
]
total_loss = loss(pred)
```

데이터 임베딩을 정한 것까지는 좋은데, 위와 같은 경우 loss 함수를 어떻게 정의해야 할까요?

MNIST와 같이 데이터를 C개의 클래스 중 하나의 클래스로 분류하는 `Multi-class classfication` 문제는
모델의 끝단에 Softmax 함수를 붙여서 전체 출력의 합을 1로 만들고
Cross Entropy loss 함수를 사용하는데요.

이 문제는 전체 벡터의 합이 1이 아닌 길이 L(위 경우는 2)이므로 알맞지 않습니다.

이와 같이 하나의 오브젝트가 여러개의 클래스를 가지는 문제는 multi-label classification.

multi-label classification 문제의 loss 함수를 정의하는 방법 중 가장 간단한 것은 binary cross entropy를 사용하는 것입니다.

C*L개의 각각의 결과를 독립적으로 보고 binary한 분류 결과를 loss로 사용하는 것이죠.

> 지금 생각해보니 이 문제는 label의 개수가 정해진 특수한 케이스이므로 categorical cross entropy로도 loss를 정의할 수 있을 듯 합니다?

```python
def one_hot_encode(self, label):
    """
    e.g.) 17 ==> [0, 1.0, 0, 0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0, 1.0, 0, 0,]
    """
    vector = np.zeros(self.available_chars_cnt * self.captcha_length, dtype=float)
    for i, c in enumerate(label):
        idx = i * self.available_chars_cnt + int(c)
        vector[idx] = 1.0
    return vector
```


## 모델 선정 / 학습 구현

이제 모델을 고르고 학습 파이프라인을 구현할 차례입니다.

모델은 개발 편의상 [Keras Applications](https://keras.io/api/applications/)에 있는 모델을 사용했습니다. 실험해본 모델은 아래와 같습니다.

- MobileNetV2
- DenseNet

최종 브라우저 배포 환경을 고려하여 파라미터 수가 많지 않은(용량이 작은) 모델들을 선정했습니다.

Keras Applications에서는 ImageNet으로 사전 학습된 모델을 제공하므로 해당 모델을 받아서 학습해보겠습니다.

```python
self.net = DenseNet121(
    input_shape=input_shape,
    input_tensor=self.input_tensor,
    include_top=False,
    weights="imagenet",
    pooling="max",
)
```

```python
opt = tf.keras.optimizers.Adam(learning_rate=1e-4)
self.model.compile(
    optimizer=opt,
    loss="binary_crossentropy",
    ...
)
```

```python
def train(self, trainset, valset, batch_size, epochs):
    ...
    self.model.fit(
        x=trainset,
        epochs=epochs,
        validation_data=valset,
        callbacks=callbacks,
    )
```

대부분의 로직을 Keras API로 구현할 수 있어 굉장히 간견할 코드로 모델 구성과 학습 루프를 구성 할 수 있습니다.

> 전체 코드는 [여기](https://github.com/ryanking13/kcaptcha-solver/tree/master/classification)

### 학습 결과

**MobileNetV2**

```
결과
```

**DenseNet121**

```
결과
```

MobileNetV2는 모델 크기 상 표현력에 한계가 있는지 학습 과정에서 Loss가 충분히 줄어들지 않는 모습을 보이네요. 한편 DenseNet은 97%가 훌쩍 넘는 정확도를 보입니다.

## 학습 과정에서의 이슈

글로 쓸 때는 일련의 과정의 물 흐르듯 자연스럽게 이어진 것처럼 보이지만 사실은
많은 트러블슈팅이 있었습니다.
실제로 여러분이 소규모 머신러닝 프로젝트를 한다면 맞닥뜨릴 부분도 그런 부분이겠죠.
이 문단에서는 글에서 적지 않은 이슈들을 정리해보려 합니다.

1. 모델 선정

다양한 모델로 실험하기 전, 처음에는 브라우저에 이식하기 위해 최대한 작은 모델인 MobileNet V2 만을 가지고 실험을 했습니다.

그러나 위에서 언급한 것처럼 validation loss가 충분히 떨어지지 않는 상황 발생했습니다. 학습 데이터의 수를 늘리는 것으로는 나아지지 않았구요.

이후에 더 발전되고 무거운 모델을 사용하니 성능이 급격하게 증가하는 것을 보고
일단은 모델의 표현력 문제라고 결론지었지만, 사실은 그 외에도 여러가지 이유가 있을 수 있다고 생각합니다.

실제 프로덕션 환경에서 모델의 크기가 크리티컬한 상황이라면 다양한 요소들을 더 고려해볼 수 있을 것 같네요.

2. custom accuracy

Accuracy를 나타내는 metric으로 처음에는 텐서플로우에서 제공하는 기본 accuracy를 사용했는데요, 학습시 loss가 계속 떨어짐에도 불구하고 accuracy값은 0.5 근처에서 횡보하는 상황을 목격 했습니다.

처음에는 학습이 제대로 되고 있지 않은 것인가 생각했는데, 이는 사실 accuracy를 계산하는 방식(TODO)에 의한 것이었습니다.

```
```

이는 캡차에 맞는 accuracy를 계산하는 custom metric을 만들어서 넣어주는 방식으로 해결하였습니다.

```python
def _captcha_accuracy(self, captcha_length, classes):
    def captcha_accuracy(y_true, y_pred):
        sum_acc = 0
        for i in range(captcha_length):
            _y_true = tf.slice(y_true, [0, i * classes], [-1, classes])
            _y_pred = tf.slice(y_pred, [0, i * classes], [-1, classes])
            sum_acc += metrics.categorical_accuracy(_y_true, _y_pred)
        return sum_acc / captcha_length

    return captcha_accuracy
```

## 남아있는 문제점

1. Data Distribution

kcaptcha의 생성 옵션을 바꿔서 distribution을 조금만 바꿔도 성능 확 떨어짐 (확인).

본 실험에서는 실제로 사람들이 이러한 파라미터를 건드리지 않을 것이라고 가정하고 수행했으나, 더 현실적이고 하드한 컨디션을 고려하면 이를 개선해야 할듯.

(augmentation, 데이터 확보)

2. 고정 길이

캡차의 길이가 고정되어 있음. 이에 대해서는 [Part 3]3에서 Object Detection 방식을 적용하여 해결

---


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