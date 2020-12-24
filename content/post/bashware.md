---
date: "2018-05-17T00:00:00Z"
tags:
- Security
title: (번역) Beware of the Bashware
---

[원문 링크 : Gal Elbaz and Dvir Atiasl : Beware of the Bashware: A New Method for Any Malware to Bypass Security Solutions](https://research.checkpoint.com/beware-bashware-new-method-malware-bypass-security-solutions/)

- appendix에 해당하는 부분이 빠져있으니 기술적 설명에 대해 궁금하신 분은 원문을 읽어주세요.

- 과거 2017년 9월 티스토리 블로그에 올렸던 글을 옮겨 적은 글입니다.

---


### Overview

최근 우리 Checkpoint Research는 어떤 멀웨어든 보안 프로그램에 걸리지 않고 실행시킬 수 있는 새롭고 놀라운 방법을 발견했다. Bashware라고 우리가 명명한 이 방법은, 최근 베타 테스트가 끝나고 정식 발표된, 윈도우 10의 새로운 기능인 Windows Subsystem for linux(WSL)을 이용한다.


WSL은 윈도우 OS 유저들이 bash 터미널을 이용할 수 있게 하여 리눅스 OS용 바이너리를 윈도우 OS에서 실행할 수 있게 한다.


최근의 보안 프로그램들은 윈도우 시스템과 리눅스 시스템이 공존하는 복합적인 컨셉에 대해서 아직 대응하지 못하고 있고, 그로 인해 윈도우 OS 상에서 동작하는 리눅스 바이너리를 감시하지 못하고 있다. 이는 여러 멀웨어가 WSL의 기능을 이용해 보안 프로그램의 감시를 피해서 악의적인 코드를 실행할 수 있게 한다.

> 공격 데모 : https://youtu.be/fwEQFMbHIV8

Bashware는 WSL 메커니즘을 이용하여 아주 쉽게 멀웨어가 보안 프로그램을 통과할 수 있게 한다는 점에서 아주 위험하다. 우리는 이를 유명한 여러 안티 바이러스 프로그램에 테스트해보았고, 모두 통과하는데 성공했다. 이는 Bashware가 최대 400만 대의 윈도우 10 PC를 공격할 수 있는 가능성을 내포하고 있다는 뜻이다.


### BASHWARE

Bashware는 Windows Subsystem for Linux(WSL) 메커니즘을 이용한다. 이는 윈도우 10에서 새로 공개된 기능으로, 리눅스 ELF 바이너리를 윈도우 상에서 실행할 수 있도록 한다. Bashware에 대해서 알아보기 전에, WSL의 동작 방식에 대해서 살펴보도록 하자.

#### WSL Overview

WSL은 유저 모드와 커널 모드 요소를 모두 포함하고 있으며, 이를 통해 완전한 호환성 계층(compatibility layer)를 구성하여 버츄얼 머신(VM) 없이도 완전히 리눅스와 똑같은 환경에서 동작하는 것처럼 보이게 한다.

마이크로소프트는 각 어플리케이션이 분리된 환경에서 동작하도록 하여, 어플리케이션과 OS를 모두 단일 프로세스의 유저 모드 상의 주소에서 동작하도록 하였다. 이를 위해 새로운 컨셉인 피코 프로세스 (Pico process)가 등장하였다. 피코 프로세스는 윈도우 상에서 ELF 바이너리가 동작할 수 있도록 하는 컨테이너다. 이 새로운 프로세스는 아주 작으며, 일반적인 Windows NT Process (PEB, TEB, NTDLL 등)이 가진 구조적 블록(structural blocks)를 가지고 있지 않다.

리눅스 바이너리를 피코 프로세스에 위치시킴으로서, WSL은 리눅스 시스템 콜을 윈도우 커널로 보낸다. lxss.sys와 lxcore.sys 드라이버가 리눅스 시스템 콜을 윈도우 NT API로 바꾸고 리눅스 커널을 에뮬레이트(emulate)한다.

WSL 컨셉은 안드로이드 어플리케이션을 윈도우 환경에서 실행하는 Astoria project와 Drawbridge project에서 유래했으며, 이후에 포커스를 바꾸어서 현재의 서비스에 도달했다. 초기에 마이크로소프트는 베타 모드의 WSL을 제공하고 깃헙 페이지에서 유저의 이슈를 받았다. 그리고 대부분의 이슈가 해결되자 2017년 7월 28일에 공식 릴리즈를 발표하고, 10월 17일 예정된 윈도우 10 가을 크리에이터 업데이트(FCU)에서 적용된다.

WSL의 많은 문제가 해결되었기에 마이크로소프트가 이를 정식 릴리즈한 것이지만, 아직 산업계에 윈도우 시스템과 리눅스 시스템이 공존하는 복합적인 컨셉에 대해서 아직 대응하지 못하고 있고, 그로 인해 윈도우 OS 상에서 동작하는 리눅스 바이너리를 감시하지 못하고 있다. 이는 여러 멀웨어가 WSL의 기능을 이용해 보안 프로그램의 감시를 피해서 악의적인 코드를 실행할 수 있게 한다.

![](../../../assets/post_images/bashware1.jpg)

#### Bashware explained

Bashware는 WSL을 이용하여 악의적인 ELF와 EXE 페이로드를 보안 프로그램에 탐지되지 않게 실행하는 기법이다.

이 기법은 피코 프로세스의 구조를 이용한다. 피코 프로세스는 일반적인 윈도우 프로세스와 전혀 다르며, 일반적인 NT 프로세스로 감지되지 않는다. 그러나 피코 프로세스는 보통의 NT 프로세스와 똑같은 기능을 한다.

![](../../../assets/post_images/bashware2.png)

Bashware는 크게 4가지 과정을 거친다.

__Step 1: WSL 요소 다운로드__

WSL을 이용하려면, 우선 WSL 기능을 사용할 수 있는지 알아야 한다. 이는 피코 드라이버(Pico driver)의 상태를 확인해보면 알 수 있다. (윈도우 드라이버 경로에 lxcore.sys, lxss.sys가 존재하는 지를 확인하면 된다.) 만약 WSL 기능이 꺼져있다면, Bashware는 DISM 유틸리티를 이용해 드라이버를 로드한다. 이 방법은 아주 간단하고, 보안 프로그램의 의심을 받지 않는다. 이는 백그라운드 상에서 한 줄의 명령어를 입력하는 것만으로, 유저가 알아채지 못하게 WSL 요소를 다운로드받을 수 있게한다.

__Step 2: 개발자 모드 켜기__

WSL은 현재 베타 버전이기에 사용하기 위해서는 개발자 모드를 실행해야 한다. 개발자 모드를 실행하기 위해서는 아래의 레지스트리 키를 조작해야 한다.

    HKLM \ SOFTWARE \ Microsoft \ Windows \ CurrentVersion \ AppModelUnlock \ AllowAllTrustedApps
    HKLM \ SOFTWARE \ Microsoft \ Windows \ CurrentVersion \ AppModelUnlock \ AllowDevelopmentWithoutDevLicense


이 값들은 로컬 관리자 권한을 가진 유저 혹은 애플리케이션이 수정할 수 있다.


이 값들을 수정하는 것에 대한 검증 과정은 존재하지 않는다. Bashware는 이 레지스트리 값들을 수정하여 악의적인 공격이 가능하게 한다. 공격이 끝나면 다시 값을 수정하여 공격이 있었다는 사실을 감춘다.


__Step 3: 리눅스 설치__


WSL 기능과 개발자 모드를 켰지만, 아직 리눅스 파일 시스템을 다운로드 받지 않은 상황이다. Bashware의 다음 단계는 마이크로소프트 서버로부터 리눅스 파일 시스템을 다운로드 받는 것이다.


“Lxrun /install" 명령어를 이용해 WSL이 사용하는 우분투 16.04 파일 시스템을 다운로드 받을 수 있다. Bashware 역시 Lxrun.exe를 이용하여 파일 시스템을 다운로드 받는다. 이 과정 역시 의심받지 않으며 유저가 모르게 이루어진다.


__Step 4: 와인(Wine) 설치__



Bashware가 윈도우 시스템에서 리눅스 환경을 사용하기 위한 준비를 모두 마쳤다. 이제 무엇을 해야할까?



우리의 최종 목표를 리눅스 인스턴스를 이용하여 윈도우 시스템을 공격하는 것이다. 이는 멀웨어가 크로스 플랫폼(cross platform)에서 동작 가능하도록 디자인 되어있지 않아도 가능해야 한다. 이를 가능하게 하는 것이 Winehq 프로젝트로, 윈도우 프로그램을 리눅스 OS 환경에서 동작하도록 하는 것이다 와인은 에뮬레이터가 아니라, 윈도우 API 콜을 POSIX로 바꾸어주는 일을 한다.


Bashware는 Wine을 WSL 리눅스 환경에 다운로드 한다. 그리고 와인을 사용하여 EXE 포맷의 NT 시스템콜을 모두 POSIX 시스템콜로 바꾼다. 그후 Pico provider(lxcore.sys)가 POSIX 시스템콜을 다시 NT 시스템콜로 바꾼다. 결국 lxcore가 이 프로세스를 실질적으로 실행하는 입장이 된다. 이러한 방법을 이용하여, 윈도우 상에서 동작하는 악의적인 페이로드를 리눅스를 거쳐 보안 프로그램에 감지되지 않게 실행할 수 있다.


### Conclusion



Bashware는 WSL 기능의 취약점을 이용하는 것이 아니다, 사실 WSL은 굉장히 잘 디자인되어있다. Bashware가 작동하게 만드는 것은, 아직 이 기술이 새롭기에 보안 회사들이 제대로 대응하고 있지 못하기 때문이다.



마이크로소프트는 이미 다양한 보안 회사들과 협력하여 WSL에 대한 보안 관리를 수행하고 있다. 대표적으로 Pico API를 제공하여 안티바이러스 회사들이 피코 프로세스를 감시할 수 있도록 하는 것이다.




---

### Reference

> https://research.checkpoint.com/beware-bashware-new-method-malware-bypass-security-solutions/
