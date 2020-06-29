---
layout: post
title: 안드로이드 앱 리패키징을 통한 SSL-Pinning 우회 (without Frida)
description: 안드로이드 앱 리패키징을 통한 SSL-Pinning 우회 (without Frida)
tags: [Network]
---

CTF나 버그 바운티 등을 하다보면 안드로이드 앱의 패킷을 뜯어봐야 하는 경우가 종종 있습니다.

이 때 앱이 HTTPS를 사용하여 패킷을 암호화하고 있다면 가짜 루트 인증서를 설치해서 암호화된 패킷을 중간에서 [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) 방식으로 가로채서 복호화하여야 합니다.

문제는, 안드로이드 7.0인 Nougat부터는 시스템적으로 사용자가 설치한 루트 인증서를 신뢰하지 않도록 하는 옵션(SSL-Pinning)이 [디폴트로 설정](https://developer.android.com/training/articles/security-config#base-config)되어 있습니다.

![android_trust_anchors](../../../assets/post_images/android_https01.PNG)

이 때문에 안드로이드 7.0 이상에서 가짜 루트 인증서를 디바이스에 설치하고 패킷 스니핑을 시도하면,
인증서 검증에 문제가 생겨서 앱이 제대로 동작하지 않습니다.

## ✔️ 1. Frida를 이용한 우회법

이러한 SSL-Pinning 옵션을 우회하는 방법으로 잘 알려진 것은 [Frida](https://github.com/frida/frida)를 이용해서,
앱의 인증서 검증 과정을 후킹하는 방법입니다.

해당 방법에 대해서는 아래 포스트에 자세히 설명되어 있습니다.

- [[Android] Frida를 이용한 SSL-Pinning 우회](https://securitynote.tistory.com/50)
- [Bypassing Android SSL Pinning with FRIDA](https://securitygrind.com/bypassing-android-ssl-pinning-with-frida/)

Frida는,

- 👍 SSL-Pinning 우회 외에도 다양한 용도로 사용할 수 있고,
- 👍 안드로이드 뿐만 아니라 iOS 등의 환경에서도 사용할 수 있다는 장점이 있습니다.

그렇지만,

- 👎 매번 adb에서 Frida 서버를 실행하고 컴퓨터와 통신해야 한다는 점과, 
- 👎 루팅된 디바이스가 필요해서 에뮬레이터를 사용하지 않으면 번거롭다는 단점이 있습니다.

그래서 이 글에서는 다른 방법을 소개하려고 합니다.

## 💡 2. 애플리케이션 리패키징을 통한 우회법

SSL-Pinning을 우회하는 다른 방법은,

직접 앱을 언패키징(Unpack)하고 사용자 루트 인증서를 신뢰하도록(_안드로이드 <= 6.0 버전을 타겟으로 하도록_) 설정을 변경한 뒤 다시 리패키징(Repack)해주는 방법입니다.

예시를 통해서 살펴보겠습니다.

> [이 포스트](https://go-madhat.github.io/Android-Analysis/)에서도 언패키징/리패키징 과정이 설명되어 있습니다.

(아래 예시는 [investing.com](https://play.google.com/store/apps/details?id=com.fusionmedia.investing&hl=en_US) 앱을 사용하였고, Android 10 및 Windows 환경에서 작업하였습니다.)

![android_trust_anchors](../../../assets/post_images/android_https02.jpg)

[Packet Capture](https://play.google.com/store/apps/details?id=app.greyshirts.sslcapture&hl=ko)
도구를 사용하여 앱의 패킹 스니핑을 시도하면, SSL 암호화된 패킷이 복호화되지 않는 상태입니다.

패킷 스니핑을 하기 위해 필요한 과정은 다음과 같습니다.

```
1. 애플리케이션 언패키징
2. 빌드 버전 변경
3. 애플리케이션 리패키징
4. 애플리케이션 서명
5. Profit!
```

#### 1. 애플리케이션 언패키징

[Apktool](https://ibotpeaches.github.io/Apktool/install/)을 사용하여 APK 파일을 언패키징합니다.

```sh
$ java -jar apktool.jar d com.fusionmedia.investing.apk
I: Using Apktool 2.4.1 on com.fusionmedia.investing.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from file: [...]
I: Regular manifest package...
I: Decoding file-resources...
I: Decoding values */* XMLs...
I: Baksmaling classes.dex...
I: Baksmaling classes2.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...
```

#### 2. 빌드 버전 변경

언패키징된 앱의 `AndroidManifest.xml`파일에서,
`platformBuildVersionCode` 파라미터와 `platformBuildVersionCode` 파라미터를 수정합니다.


```xml
<!-- Before -->
<manifest [..] platformBuildVersionCode="29" platformBuildVersionName="10">

<!-- After -->
<!-- API 버전 23 == 안드로이드 6.0 -->
<manifest [..] platformBuildVersionCode="23" platformBuildVersionName="6">
```

#### 3. 애플리케이션 리패키징

다시 Apktool을 사용하여 앱을 리패키징합니다.
리패키징 된 앱은 패키지 폴더 내부의 dist 폴더에 생성됩니다.

```sh
$ java -jar apktool.jar b com.fusionmedia.investing
```

### References

- https://goodtogreate.tistory.com/entry/APK-바이너리-수정후-리패키징repack
- https://gist.github.com/unoexperto/80694ccaed6dadc304ad5b8196cbbd2c
- https://github.com/appium/sign