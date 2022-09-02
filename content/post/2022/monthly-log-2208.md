---
date: "2022-08-31T00:01:00"
title: 월간 기술 스크랩 22/08
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 8월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 8월)
draft: false
hiddenfromhomepage: true
---

## ✍️ 글

### [Write Better Commits, Build Better Projects](https://github.blog/2022-06-30-write-better-commits-build-better-projects/)

깃헙에서 작성한, 커밋을 더 잘 구성하는 방법에 대한 글.

기본적으로는 Atomic한 단위로 커밋을 쪼개는 것이 좋다는 내용인데요.
다만 저는 코드 리뷰를 하고 그에 따른 코드 수정이 빈번한 경우라면,
리뷰 내용을 rebase해서 반영하기 보다는 머지 시에 squash하는 것을 더 선호하는 편입니다.

## 📌 북마크

### [Decompiler Explorer](https://dogbolt.org/)

다양한 디컴파일러의 결과물을 쉽게 비교해볼 수 있는 사이트.

굉장히 비싼 유료 소프트웨어인 Hex-Rays를 포함해서 다양한 프로그램의 결과물을 비교해볼 수 있어서,
어떤 디컴파일러가 좋은 지 상황에 따라 어떤 소프트웨어가 더 좋은 결과물을 보여주는 지 알 수 있습니다.

<!-- ## 📰 기술 뉴스 -->

## ⚙️ 소프트웨어 / 프로젝트

### [Look Scanned](https://lookscanned.io/)

최근 문서에 서명을 해야할 때,
집에 프린터나 스캐너가 없는 경우 태블릿과 펜을 이용해서 서명을 하는 경우가 종종 있는데,
이 때 마치 직접 스캔한 것처럼 이미지를 변환해주는 도구입니다.

간혹 관공서등에서 "직접" 스캔한 파일을 요구할 때 유용하게 사용할 수 있을 듯 합니다.

### [weave](https://github.com/evmar/weave#demo)

WebAssembly 모듈 내부 구조를 보여주는 시각화 도구.

### [Hello](https://beta.sayhello.so/)

개발자를 위한 검색엔진.

머신 러닝 모델을 이용해서 쿼리를 분석하고, 그에 따른 결과를 보여줍니다.

간단한 질문들에는 좋은 답을 보여주는 것 같은데, 다만 검색 결과가 나오는 속도가 꽤나 느려서
좀 답답한 느낌이 있습니다. 더 개선되길 기대해봐야겠네요.

### [ImHex](https://imhex.werwolv.net/)

리버스 엔지니어를 위한 Hex Editor.

기존에는 간단하게 바이너리 파일 내부를 보거나 수정해야할 때는 [HxD](https://mh-nexus.de/en/hxd/)를 사용했었는데요.
이 프로그램은 좀 더 다양하고 복잡한 기능을 제공하고 있습니다. 다만 아직 만들어진지 2년이 채 되지 않은 프로젝트이기 때문에
얼마나 버그 없이 잘 동작할 지는 모르겠네요.

<!-- ## 📙 책 / 강의 / 영상 -->
