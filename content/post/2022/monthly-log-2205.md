---
date: "2022-05-30T00:01:00"
title: 월간 기술 스크랩 22/05
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 5월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 5월)
draft: true
---

## ✍️ 글

### [MVC 창시자가 말하는, MVC의 본질](https://velog.io/@eddy_song/mvc)

아마도 소프트웨어 개발에서 가장 유명한 패턴 중 하나일 MVC(Model-View-Controller) 패턴에 대해서
초기에 어떤 아이디어로 해당 패턴이 만들어졌는지를 설명한 글.

유저의 멘탈 모델과 컴퓨터가 데이터를 가공하고 처리하는 방법이 매우 다르기 때문에 이를 모델과 뷰로 분리하고,
이를 연결하는 장치로서 컨트롤러를 설계했다는 사실을 알 수 있습니다.

## 📌 북마크

### [Annotated PyTorch Paper Implementations](https://nn.labml.ai/)

머신러닝 논문의 파이토치 구현체를 코드 단위에서 한 줄 한 줄 논문의 어떤 부분에 해당하는지 어노테이션을 달아놓은 사이트.
당연하지만 논문의 수가 아주 많지는 않은데, 유명한 논문의 구현체를 뜯어볼 일이 있다면 유용하게 사용할 수 있을 듯 합니다.

## 📰 기술 뉴스

### [Github: Math support in Markdown](https://github.blog/2022-05-19-math-support-in-markdown/)

깃헙에서 마크다운 파일을 작성할 때 이제 MathJax 라이브러리를 사용하여 수식을 나타낼 수 있습니다.

사실 "왜 안 되지?" 싶은 기능이었는데, 드디어 깃헙에서 공식적으로 지원하게 되었네요.


## ⚙️ 소프트웨어 / 프로젝트

### [PyScript](https://www.anaconda.com/blog/pyscript-python-in-the-browser)

PyConUS 2022에서 Anaconda가 공개한 HTML에 파이썬을 임베딩할 수 있는 라이브러리.

CPython을 WebAssembly로 컴파일해서 브라우저 환경에서 실행하는 것 자체는 Pyodide와 CPython 3.11 (알파) 에서 지원하고 있는데
PyScript는 좀 더 하이레벨에서 쉽게 프로그램을 작성할 수 있게 돕는 라이브러리입니다.

![image](https://user-images.githubusercontent.com/24893111/167320943-7d99e98a-6b2b-4561-9e1e-f94e24e0180a.png)

공식 소개글에서 설명하는 위 이미지가 이해하는 데에 도움이 될 듯 합니다.

### [Memray](https://github.com/bloomberg/memray)

블룸버그에서 공개한 파이썬 메모리 프로파일러.회사 내부적으로 사용하고 있던 도구를 오픈소스로 공개했습니다.
긴 시간 동안 실행되는 파이썬 애플리케이션에 대해서 코드의 어느 영역에서 메모리를 많이 할당하고 사용하고 있는지 알 수 있습니다.

한 가지 흥미로운 사실로는 메인테이너 중에 cpython 코어 개발자와 pip 메인테니어가 모두 있네요. 전문성은 확실할 듯합니다.

## 📙 책 / 강의 / 영상
