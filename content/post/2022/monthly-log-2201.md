---
date: "2022-01-31T00:01:00"
title: 월간 기술 스크랩 22/011
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 1월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 1월)
draft: true
---

## ✍️ 글

### [What does a Principal Software Engineer do?](https://blog.devgenius.io/what-does-a-principal-engineer-do-2e6af918ff28)

한국에서는 이른바 "수석" 엔지니어라고 부르는,
엔지니어의 최고 등급에 위치한 사람들은 어떤 역할을 하는 지를 설명한 글.

글에서 4가지 아키타입에 대해서 설명을 하는데요.

1. Generalist: 제품과 서비스 분야의 리더
2. Specialist: 특정 도메인의 전문가이자 해당 분야에 영향을 미치는 사람
3. Coding Machine: 복잡한 문제를 누구보다 빠르게 풀어내는 사람
4. Product Manager Hybrid: 복잡한 비즈니스 문제를 해결하는 사람

이 글을 소개한 [GeekNews 댓글](https://news.hada.io/topic?id=5557)에서 1, 2, 3번의 예시로
DeepMind의 CEO인 데미스 하사비스, 머신러닝 분야 석학인 제프리 힌튼 교수,
그리고 구글의 전설적인 개발자인 제프 딘을 들었습니다. (적다보니 다 구글 관련 인물이네요 😮)

개인적으로 떠오르는 인물로는,
1번에는 테슬라의 AI 헤드인 안드레아 카파시,
2번에는 LLVM의 창시자인 크리스 라트너 정도가 있지 않을까 생각합니다.

### [2022년의 PyTorch vs Tensorflow](https://www.assemblyai.com/blog/pytorch-vs-tensorflow-in-2022/)

2022년이 된 시점에서 대표적인 두 딥러닝 프레임워크인 PyTorch와 Tensorflow를 비교하는 글.

최근 몇년간 학계를 중심으로 PyTorch가 크게 성장했다는 것이 피부로 체감되는데,
최신 인기 모델들은 PyTorch 구현체는 거의 100% 존재하지만 Tensorflow 모델들은 없는 경우도 꽤 있다고 하고,
Tensorflow 구현체만 존재하는 경우는 Top 30 중에서는 아예 없었다고 합니다.

다만 배포 측면에서 봤을 때는 Tensorflow가 제공하는 다양한 도구들과 에코시스템이 아직까지는 압도적이기에
PyTorch가 열심히 따라오고는 있지만 아직은 멀었다는 느낌이네요.

### [Github Code Search의 역사](https://github.blog/2021-12-15-a-brief-history-of-code-search-at-github/)

Github이 최근 새로운 [코드 서치 기능](https://cs.github.com)을 소개했는데요.
이와 관련하여 Github의 검색 기능 역사를 다룬 블로그 글이 나와서 소개합니다.

사실 가볍게 읽기에는 꽤나 딥한 내용인데요. 코드 검색이 일반 검색과 어떻게 다르고,
어떤 문제들이 있어왔고 그것을 Github이 어떻게 해결해왔는지를 알 수 있는 흥미로운 글입니다.

### [Docker exec vs attach](https://iximiuz.com/en/posts/containers-101-attach-vs-exec/)

Docker `exec` 과 `attach` 명령어의 차이를 설명한 글.

Docker `exec`의 설명을 보면 `Run a command in a running container`라고 적혀있는데,
Docker가 프로세스 가상화라는 점을 생각하면 어떻게 한 프로세스 안에서 새 프로세스를 실행하는 거지?
라는 생각이 들 수 있는데요.
사실은 `exec`이 특정 컨테이너와 동일한 isolation boundary를 가진 새로운 컨테이너를 실행하는 명령어라는 점을 알 수 있습니다.

## [모두의 Github Actions](https://hyperconnect.github.io/2021/11/08/github-actions-for-everyone-1.html)

하이퍼커넥트 DevOps 팀에서 자사 CI 프레임워크를 Jenkins에서 Github Actions로 교체하면서 수행했던 작업들을 정리한 글.
제목의 링크는 1편이고, [2편](https://hyperconnect.github.io/2021/11/29/github-actions-for-everyone-2.html),
[3편](https://hyperconnect.github.io/2021/12/21/github-actions-for-everyone-3.html)까지 나와 있습니다.

시크릿 관리나 빌드 캐시 관리처럼 CI를 사용한다면 한번쯤 고민해봤을법한 주제에 대해서 상세히 다루어주고 있어서,
당장은 도움이 안 되더라도 북마크해놓고 필요할 때 꺼내보기 좋은 글인듯 합니다.

<!-- ## 📌 북마크 -->

## 📰 기술 뉴스

### [Microsoft forked MIT licensed repo and changed the copyright](https://news.ycombinator.com/item?id=29683471)

마이크로소프트가 개인이 개발한 MIT 라이센스로 되어있는 레포지토리를 포크하더니,
자신들의 라이센스로 바꿨다가 욕을 바가지로 먹은 사건.

알고보니 자동으로 커밋 템플릿 파일을 업로드하는 봇 때문에 발생한 사건이었다고 합니다.
마이크로스프트 오픈소스팀에서 빠르게 대응했고, 원 개발자에게도 사과했다고 하니 깔끔하게 결말이 난 듯 합니다.

## ⚙️ 소프트웨어 / 프로젝트

### [Fluent Search](https://fluentsearch.net/)

Windows용 통합 검색 유틸리티.

검색 유틸리티를 애용하는 편은 아니지만,
지금껏 Windows에서 사용할 수 있는 몇몇 도구를 써봐도 만족스럽지 못했는데요.
굉장히 가벼우면서 빨라서 매력적인 검색 유틸리티를 알게 되어서 소개합니다.

### [GitUI](https://github.com/extrawurst/gitui)

Rust로 작성된 터미널 기반 Git UI 클라이언트.

비슷한 프로젝트로 [tig](https://github.com/jonas/tig)와 [lazygit](https://github.com/jesseduffield/lazygit)
이 있는데, 두 프로젝트에 비해서 상대적으로 젊습니다.
프로젝트 README에는 두 프로젝트에 비해서 더 빠르고 안정적이라고 써져있는데, 직접 써봐야 알 수 있을 것 같네요.

사실 저는 묘하게 써드파티 Git 클라이언트는 손이 잘 안갔었는데,
이 기회에 여러가지 프로덕트를 프로덕트를 비교해보고 사용해보려고 합니다.


## 📙 책 / 강의 / 영상
