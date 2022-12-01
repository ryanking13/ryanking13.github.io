---
date: "2022-11-30T00:01:00"
title: 월간 기술 스크랩 22/11
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 11월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 11월)
draft: false
hiddenfromhomepage: true
---

## ✍️ 글

### [How I make a living working on SerenityOS](https://awesomekling.github.io/How-I-make-a-living-working-on-SerenityOS/)

2018년부터 [SerinityOS](https://github.com/SerenityOS/serenity)를 개발하고 있는 Andreas Kling이
2021년부터 풀타임으로 오픈 소스 개발을 하면서 어떻게 돈을 벌고 있는지 소개하는 글입니다.

스폰서쉽을 통해서 들어오는 수익이 주가 되고, 유튜브 라이브 코딩에서도 약간의 수입이 들어오고 있다고 합니다.
별도의 광고 수입이나 투자를 받는 것은 없다고 하며, 이를 통해 더 많은 돈을 벌 수도 있지만
자유롭게 오픈 소스를 개발하는 것으로부터 얻는 자유와 평화가 더 가치 있다고 느낀다고 합니다.

### [Migrating From Python to Kotlin for Our Backend Services](https://doordash.engineering/2021/05/04/migrating-from-python-to-kotlin-for-our-backend-services/)

도어 대시에서 Python에서 Kotlin으로 백엔드 서비스를 마이그레이션 하기 위해 어떤 과정을 거쳤는지 소개하는 글입니다.

기존에는 Python 2와 Django를 이용해서 서비스하고 있었지만, Python 2의 수명이 끝나면서
마이그레이션이 필요해졌고, 다양한 언어를 고려하다가 Kotlin을 선택했다고 합니다.

도어대시 서비스에 필요한 기능들을 정리하면서, 여러 언어들이 이러한 요구사항을 갖추고 있는지,
각 언어의 장단점을 비교한 후 Kotlin을 선택하였고,
Kotlin으로 언어를 변경하면서 얻게 된 이점과,
한편으로 마이그레이션 과정에서 직원들이 새로운 언어를 학습하고 사용할 수 있도록 어떤 프로세스를 만들었는지를 소개합니다.

## 📌 북마크

### [Stable Diffusion Prompt Book](https://openart.ai/promptbook)

Stable Diffusion을 더 잘 사용하기 위한 기본적인 가이드와,
어떠한 프롬프트가 어떤 효과를 내는 지를 정리한 온라인 가이드북


## 📰 기술 뉴스

### [Kite is saying farewell](https://www.kite.com/blog/product/kite-is-saying-farewell/)

2014년부터 개발되었던 코드 자동 완성 및 추천 도구인 Kite가 개발을 중단한다는 소식.

최근에는 Github Copliot과 같이 비슷한 기능을 제공하는 도구들이 나오고 빛을 보기 시작했지만,
Kite는 기술이 충분히 성숙하지 못한 이른 시기에 런칭했기에 사용자에게 충분히 어필하지 못했다고 얘기합니다.

흥미로운 점은 Kite 개발 중단과 함께 회사 내부에서 사용하던 많은 코드를 오픈소스로 깃헙에 공개했는데요.
Kite 엔진과 더불어 다양한 도구들이 있으니 살펴보는 것도 좋을 듯합니다.

## ⚙️ 소프트웨어 / 프로젝트

### [Muse](https://lightning.ai/muse/view/null)

pytorch-lightning을 만든 Lightning-AI에서 공개한 stable diffusion 서빙 도구.

사실 워낙 많이 쏟아져 나오는 stable diffusion 기반 도구들이 있어 특별할 것이 있나 싶기도 한데요.
stable diffusion 자체보다는 Lightning-AI 에서 만든 앱 서빙 프레임워크 (Lighting) 를 홍모하는 느낌이 강합니다.
개인적으로 pytorch-lightning을 쓰면서 굉장히 편하다고 느꼈는데,
pytorch 기반 애플리케이션을 배포할 때 Lightning을 사용해보는 것도 좋을 것 같습니다.

## 📙 책 / 강의 / 영상

### [웹팩 핸드북](https://joshua1988.github.io/webpack-guide/)

웹팩의 개념과 기본적인 사용법을 설명하는 튜토리얼 사이트.