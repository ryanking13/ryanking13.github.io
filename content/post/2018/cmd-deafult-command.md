---
date: "2018-09-03T00:00:00Z"
categories:
- Windows
title: Windows cp949 인코딩 자동 변경하기
summary: " "
---

한글 Windows를 사용하다보면 종종 불편한 것이 기본 시스템 인코딩이 `cp949`로 설정되어 있다는 것입니다.

![](../../../assets/post_images/cmd_encoding.PNG)

이 때문에 파일을 읽고 쓰거나,
웹 크롤링을 하다보면 종종 인코딩 이슈가 발생합니다.

> UnicodeDecodeError: 'cp949' codec can't decode bytes in position : illegal multibyte sequence

파이썬으로 한글 파일을 다루거나 한글 사이트 크롤링을 하는 사람이라면 한 번쯤은 위와 같은 메세지를 보셨을 텐데요.
그래서 Windows 환경에서 프로그램을 실행할 때는 습관적으로 명령 프롬프트(cmd)를 켜고

> chcp 65001

을 입력해 인코딩을 UTF-8로 바꾸는 것부터 하게 되는데,
아무래도 매번 하는 것은 귀찮으니 명령 프롬프트를 실행했을 때 이것이 자동으로 되게 해봅시다.

명령 프롬프트의 동작을 수정하는 것은
아래 레지스트리 항목을 건드리면 됩니다.

```
# 전체 유저에게 영향을 주고 싶다면
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor

# 한 유저에게만 영향을 주고 싶다면
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Command Processor
```

`Autorun` 항목을 추가하면 명령 프롬프트가 실행되었을때 특정 명령어가 자동으로 실행되게 할 수 있습니다.

![](../../../assets/post_images/cmd_autorun.PNG)

`chcp 65001`을 추가해준 뒤, 명령 프롬프트를 실행해보면,

![](../../../assets/post_images/cmd_autorun_result.PNG)

실행과 동시에 인코딩이 UTF-8로 바뀐 것을 확인할 수 있습니다.

이를 응용하면, 명령 프롬프트의 홈 디렉토리(?)를 바꾸거나
.bashrc와 유사한 세팅이 자동으로 수행되게 할 수 있습니다.
