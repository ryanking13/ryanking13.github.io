---
date: "2021-02-02T00:09:01Z"
description: 그누보드 캡차 인식 프로젝트 개발기 - Part 2
draft: true
tags:
- Machine Learning
title: 그누보드 캡차 인식 프로젝트 개발기 - Part 2
---

[이전 글]({{< ref "kcaptcha-solver-part-1.md" >}})에서는 KCAPTCHA 캡차 프로그램을 깨는 Tensorflow 모델을 개발하는 과정을 다루었습니다.

이번 글에서는 완성된 파이썬 Tensorflow 모델을 Tensorflow.js 레이어로 변환하여 브라우저에 배포하여 서빙하기까지의 과정, 그리고 그 과정에서 발생한 이슈에 대해서 살펴보도록 하겠습니다.

## 🌐 Tensorflow.js란?

[Tensorflow.js](https://www.tensorflow.org/js?hl=ko)는 Tensorflow 팀에서 공식 개발하는 자바스크립트 머신러닝 라이브러리입니다.

Tensorflow.js를 사용하면 Node.js나 브라우저 환경에서 완성된 머신러닝 모델을 실행하거나,
새로 모델을 학습시킬 수 있습니다. [WebGL](https://developer.mozilla.org/ko/docs/Web/API/WebGL_API)을 통해 GPU 연산 역시 지원하구요.

## 🔛 모델 변환

Tensorflow.js는 Keras가 사용하는 HDF5 포맷과, Tensorflow가 네이티브로 사용하는 SavedModel 등의 포맷을 Tensorflow.js 레이어로 변환하는 `tensorflowjs_converter` 커맨드를 제공합니다.

이전 글에서 사용한 모델을 HDF5 포맷으로 저장한 뒤, Tensorflow.js 레이어로 변환하도록 하겠습니다.

```python
...
checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
    self.save_path,
    monitor="val_loss",
    save_best_only=True,
    verbose=1,
)
callbacks.append(checkpoint_callback)

self.model.fit(
    x=trainset,
    epochs=epochs,
    validation_data=valset,
    callbacks=callbacks,
)
...
```

[Keras 모델은 `model.save(...)`로 저장](https://www.tensorflow.org/guide/keras/save_and_serialize?hl=ko)할 수 있습니다.
다만 저는 ModelCheckpoint Callback을 사용하여 학습 과정에서 자동으로 Best Accuracy 모델이 저장되도록 구현하였습니다.

```bash
pip install tensorflowjs
tensorflowjs_converter --input_format keras --output_format=tfjs_graph_model model.h5 model_tfjs/
```

위 커맨드는 `model.h5`라는 이름으로 저장된 케라스 모델을 Tensorflow.js 레이어로 변환하여 `model_tfjs` 폴더에 저장합니다.

커맨드 실행 후 `model_tfjs` 폴더를 살펴보면 model.json 파일과 weight 파일들이 생성된 것을 확인할 수 있습니다.

```bash
$ ls model_tfjs
group1-shard1of8.bin  group1-shard3of8.bin  group1-shard5of8.bin  group1-shard7of8.bin  model.json
group1-shard2of8.bin  group1-shard4of8.bin  group1-shard6of8.bin  group1-shard8of8.bin
```

> **Note**: Tensorflow.js 레이어로 모델을 변환할 때, [사용자 정의 레이어, 손실 함수 등을 사용했다면 변환이 되지 않습니다](https://tensorflow.google.cn/js/tutorials/conversion/import_keras?hl=ko#%EC%A7%80%EC%9B%90%EB%90%98%EB%8A%94_%ED%8A%B9%EC%84%B1).


## 👩‍💻 JS 코드 작성

이제 변환한 모델을 자바스크립트 환경에서 사용할 수 있도록 코드를 작성합니다.

> 전체 코드는 [여기](https://github.com/ryanking13/kcaptcha)서 볼 수 있습니다. Vue.js를 이용해서 작성되었습니다.

```bash
npm install @tensorflow/tfjs
```

npm 또는 yarn을 이용하여 `@tensorflow/tfjs`를 설치합니다.

```js
import * as tf from "@tensorflow/tfjs";

this.model = await tf.loadGraphModel(
  location.href + "/model_tfjs/model.json"
);
```

`tf.loadGraphModel()` 함수를 이용해서 모델을 읽어옵니다.
앞서 변환 결과 생성된 `model.json` 파일의 URL을 인자로 넣어주면 됩니다.


```js
tfGetImage: function (imageId) {
  // Get HTMLImageElement from the document
  const imgElem = document.getElementById(imageId);
  const img = tf.browser.fromPixels(imgElem);
  return this.tfPreprocessImage(img);
},
```

`tf.browser.fromPixels()` 함수는 이미지를 모델이 입력으로 받을 수 있는 텐서로 변환합니다.

```js
tfPreprocessImage: function (img) {
  const mean = tf.tensor1d([0.485, 0.456, 0.406]);
  const std = tf.tensor1d([0.229, 0.224, 0.225]);
  const size = [60, 160, 3]; // [height, width, channel]
  return img.reshape(size).toFloat().div(tf.scalar(255)).sub(mean).div(std);
},
```

놓치기 쉬운 부분으로,
데이터 전처리 과정은 (당연하게도) 변환된 모델에 포함되어 있지 않으므로 별도로 자바스크립트 코드를 작성해주어야 합니다.

위의 코드는 ImageNet의 평균/표준편차를 이용해서 데이터를 표준화해주는 작업입니다.
기존 파이썬 코드와 똑같은 동작을 하는 전처리 코드를 작성해주어야 합니다.

```js
tfPredictCaptcha: function () {
  const img = this.tfGetImage("captcha");
  const imgBatch = img.expandDims(0);
  const result = this.model.predict(imgBatch);
  this.captchaVal = this.tfDecodePrediction(result, 10, 2);
},
```

전처리까지 마친 데이터를 batch 단위로 변환해준 뒤 모델의 `predict()` 메소드에 입력으로 넣어주면,
모델의 예측 결과를 얻을 수 있습니다.

```js
/*
  [
    0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ] ==> "20"
*/
tfDecodePrediction: function (tensor, numCharSet) {
  var sliced = tensor.dataSync().reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / numCharSet);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, []);
  const argMax = (array) =>
    array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  const predicted = sliced.map(argMax).join("");
  return predicted;
},
```

모델의 출력을 원하는 포맷으로 변환하는 코드도 필요하다면 자바스크립트로 따로 작성해주면 됩니다.
위의 코드는 인코딩된 모델 출력 결과를 숫자로 변환하는 함수입니다.

## 🚢 배포

Tensorflow.js 추론에 필요한 코드는 이것으로 끝입니다.
이 외에 모델 학습 등 Tensorflow.js의 다양한 기능을 활용해보고 싶으시다면 [공식 API](https://js.tensorflow.org/api/latest/) 문서를 참고해주세요.

이제 나머지 살을 붙여서 웹 사이트로 빌드하여 배포하면 됩니다.

> https://ryanking13.github.io/kcaptcha 에서 배포된 웹 사이트를 볼 수 있습니다

<div style="text-align: center;">
  <video controls width="80%">
      <source src="/assets/post_images/kcaptcha_js.mp4"
              type="video/mp4">
  </video>
</div>


초기에 모델을 읽어오는 시간이 오래 걸리는 편이지만,
실시간으로 추론 되는 모습을 확인할 수 있습니다.