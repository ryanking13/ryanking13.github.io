---
date: "2021-11-30T00:01:00"
title: 월간 기술 스크랩 21/11
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 11월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 11월)
draft: false
---

## ✍️ 글

### [Why you shouldn't invoke setup.py directly](https://blog.ganssle.io/articles/2021/10/setup-py-deprecated.html)

파이썬 패키징 도구인 setuptools 개발팀에서 더 이상 setuptools를 커맨드라인에서 실행 (e.g. `python setup.py install`)하지
말아달라고 호소(?)하는 글.

setuptools는 계속 개발될 것이지만, 이제는 라이브러리로만 남을 것이고, 직접적으로 setup.py를 실행하는 방식은 deprecated될 것이라는 글입니다.
이제는 [PEP517](https://www.python.org/dev/peps/pep-0517/)의 등장으로 setuptools에 의존하지 않고도 패키지를 빌드할 수 있게 되었고,
pip나 build와 같은 도구가 setuptools가 하던 기능의 일부를 대체하고 있으므로, 굳이 setup.py를 실행할 필요가 없다는 점을 이야기 합니다.

### [A 16 Year History Of The Git Init Command](https://initialcommit.com/blog/history-git-init-command)

깃 커밋 히스토리로 살펴보는 `git init` 커맨드의 역사.

`git init` 커맨드가 처음에는 `init-db` 명령어였고,
`.git` 디렉토리가 처음에는 `.dircache`라는 이름이었다는 사실 등
흥미로운 역사를 알 수 있습니다.

또한 이런저런 디테일이 바뀌기는 했어도 핵심적인 아이디어는 계속 유지되었다는 사실도 알 수 있습니다.
Linux도 그렇고, git도 그렇고, 초기 디자인과 현재의 디자인이 핵심적인 측면에서 크게 다르지 않다는 점은
리누스의 대단함이 느껴지는 부분이네요.

### [2021년 데이터/ML/AI 업계 지도와 최신 트렌드](https://news.hada.io/topic?id=5299)

2021년도 데이터 업계의 트렌트. 원문이 길고 복잡해서 GeekNews에서 xguru님이 한글로 번역해주신 버전을
공유합니다.

특징적인 부분은 Data Warehouse의 성장인데요. 워렌 퍼빗이 투자한 것으로 유명한 Snowflake가 엄청난 가격에
상장하면서 Data Warehouse라는 용어는 많이들 들어보셨겠지만, 이게 왜 필요하고 어떤 임팩트가 있는지는
잘 이해하기 어려웠습니다. 빅데이터가 화두가 된지 벌써 10년이 넘었고, Hadoop 같은 빅데이터 저장 플랫폼이 있는 상황에서
굳이 Data Warehouse가 필요한가? 라는 생각을 했었는데,
생각보다 데이터 저장을 위한 인프라의 문제가 해결되지 않았던 문제라는 점을 알 수 있었습니다.

한편으로 데이터 저장 인프라의 문제가 해결되면서,
다음 스텝으로 저장된 데이터를 탐색하고 분석해서 유저에게 전달하기까지의 파이프라인을 해결하고자 하는
DataOps가 앞으로의 화두가 될 가능성이 높다는 점도 확인해 볼 수 있습니다.

### [Photoshop's journey to the web](https://web.dev/ps-on-the-web/)

얼마 전 포토샵의 웹 베타 버전이 공개되었는데요.
이 글에서는 포토샵의 웹 포팅을 가능하게했던 기술을 간략히 소개합니다.

역시나 핵심 기술은 WebAssembly(정확히는 Emscripten)인데요.
최근 [WebContainer](https://blog.stackblitz.com/posts/introducing-webcontainers/)나 [Pyodide](https://pyodide.org)와 같이
네이티브 환경에서 동작하던 애플리케이션을 WebAssembly로 변환하여 브라우저에서 실행이 가능하도록 하는 프로젝트가 종종 보이는데요.
앞으로도 더 완성도 높은 프로젝트들이 나오기를 기대해봅니다.

## 📌 북마크

### [개발자 면접 시 짚고 넘어가야 할 질문들](https://hunj.dev/interview-questions/amp/)

면접자가 피면접자에 대해서 궁금한 것이 있는 만큼 피면접자도 회사에 대해 궁금한 것이 있기 마련입니다.
면접은 단방향이 아니라 쌍방향 소통 과정인만큼 면접은 자신을 알리기에 좋은 자리일뿐만 아니라 회사에 대해 알기에도 좋은 자리입니다.

회사가 아주 적극적으로 PR을 하지 않은 이상 내부 사정을 쉽게 알기 어렵고, 팀마다 다른 문화가 있는만큼
면접장에서 피면접자가 물어보면 좋을만한 사항을 정리한 글이 있어 소개합니다.

### [브라우저 개발자 도구의 비밀](https://christianheilmann.com/2021/11/01/developer-tools-secrets-that-shouldnt-be-secrets/)

마이크로소프트 엣지 브라우저를 만드는 개발자가 공개하는 브라우저 개발자 도구를 잘 활용하는 법.

이런 식의 가이드는 볼 때마다 "아 내가 정말 멍청하게 디버깅을 하고 있었구나"하고 생각하지만,
시간이 지나면 또 까먹고 `console.log()`를 치고 있는 자신을 발견하고 있기는 합니다.

그래도 볼 때마다 기억해두면 언젠가는 제대로 개발자 도구를  쓸 수 있는 날이 오겠죠?

## 📰 기술 뉴스

### [Thank you, Github](https://news.ycombinator.com/item?id=29095747)

Microsoft가 Github을 인수하고서부터 3년간 Github의 CEO로 일해왔던 Nat Friedman이 CEO직에서 사임했습니다.

Github이 인수되고서부터 엄청난 변화들이 있었는데요.
Actions, Codespaces, Copilot, Sponsors 같은 굵직한 변화들만 헤아려봐도 상당한 숫자입니다.
그 모든 것을 꽤나 잘하고 있다는 것도 특징이구요.
새로운 CEO는 어떤 방식으로 Github을 이끌어나갈지도 기대되는 부분입니다.

또 Github의 기능적인 발전과는 별개로, [Hacker News](https://news.ycombinator.com/item?id=29095747)를 보면
많은 사람들이 Nat이 Github에 미친 긍정적인 영향들을 얘기하고 있는데요.
대표적으로는 [이란 개발자들이 Github을 사용할 수 있도록 노력한 부분](https://github.blog/2021-01-05-advancing-developer-freedom-github-is-fully-available-in-iran/)이나,
[youtube-dl의 저작권 사태](https://mobile.twitter.com/natfriedman/status/1328365679473426432)와 같은 부분을 잘 해결한 것을
긍정적으로 평가하고 있는 것을 확인할 수 있습니다.

### [Python GIL Removal](https://lukasz.langa.pl/5d044f91-49c1-4170-aed1-62b6763e6ad0/)

얼마 전 파이썬 코어 개발자들이 모이는 Python Language Summit에서
파이썬의 GIL(Global Interpreter Lock)을 제거하는 것에 대한 발전된 논의가 있었습니다.

파이썬에서 GIL을 제거하는 것은 기존에도 수없이 논의되었던 논제이지만,
대부분 큰 성능 저하 없이는 불가능해서 아이디어에 그쳤다고 알려져 있는데요.
최근 페이스북의 개발자인 Sam Gross가 [nogil](https://github.com/colesbury/nogil)이라는
이름의 GIL을 제거한 파이썬 구현체를 공개했고,
이를 바탕으로 한 GIL 제거 논의가 긍정적으로 검토되었다고 합니다.

파이썬에서 GIL이 필요한 주된 이유는 파이썬이
레퍼런스 카운팅 방식의 가비지 컬렉션 기법을 사용하고 있고,
이 때문에 서로 다른 스레드에서 같은 오브젝트를 동시에 사용할 때
레퍼런스 카운트에 문제가 생기는 것을 방지하기 위함인데요.

Sam Gross의 구현체에서는 서로 다른 스레드가 각각의 인터프리터를 가지는 식으로 이를 해결했다고 합니다.
사실 상세한 내용은 이해하지 못했는데, 나중에 공식적인 PEP가 나오면 제대로 살펴보려고 합니다.

이와 관련해서 [CPython 커미터인 나동희 개발자님 인터뷰](https://www.youtube.com/watch?app=desktop&v=V18ceQO_JkM&feature=youtu.be)를
살펴보시면 이해에 도움이 될 듯 합니다.


## ⚙️ 소프트웨어 / 프로젝트

## 📙 책 / 강의 / 영상

### [파이썬 오픈소스 커미터가 되는 방법](https://m.youtube.com/watch?v=1goockl3wPs&feature=youtu.be)

CPython 커미터이자 현재 LINE에서 일하고 계신 나동희 개발자님 인터뷰.

얼마 전 파이썬 릴리즈 뉴스를 보다가 한국인 이름이 있어서 신기하게 봤던 기억이 있었는데,
한국에서 유이하게 존재하는 파이썬 커미터라고 합니다. (다른 한 분은 서울대 장혜식 교수님)
장혜식 교수님은 2000년도 초반에 활동을 하신 것 같으니 현재는 유일하다고 할 수 있겠네요.

### [Machine Learning Interviews Book](https://github.com/chiphuyen/ml-interviews-book)

머신러닝 분야로의 진로를 생각하고 있는 사람들을 위하여 인터뷰를 준비할 수 있도록 돕는 책.
저자는 Chip Huyen으로, NVIDIA와 Snorkel에 있었고 현재는 스탠포드에서 강의를 하시는 듯.

다양한 인터뷰 예시 문제들이 있고, 굳이 머신러닝에 관심이 없더라도 미국에서 컴퓨터 사이언스 분야 직업을 구하는 것에 대한
여러가지 이야기들을 살펴볼 수 있어서 한번쯤 읽어볼만한 듯 합니다.
