---
date: "2022-12-20T00:01:00"
title: 오픈 소스 개발 1년 회고
categories:
- Pyodide
description: 오픈 소스 개발 1년 회고
summary: " "
draft: false
---

<div style="text-align: center;">
<img src="https://pyodide.org/en/stable/_static/pyodide-logo.png" style="height:auto; width: 100%; max-width: 600px">
</div>

해마다 연말이 되면 여러 개발자들이 쓴 회고글을 볼 수 있다.
여러 사람들의 회고를 읽다보면 세상에 정말로 열심히 사는 사람들이
많다는 것에 감탄하기도 하고, 동기부여가 되기도 하는데,
나 역시도 종종 회고글을 써볼까 생각했지만, 돌이켜보면 뚜렷한 목표의식을 가지고
한 해를 보낸 적이 마땅치 않아 두서없는 글이 될까봐 글을 완성한 적이 없었다.

그러다 올해는 무엇을 하였나하고 생각해보니,
마침 [Pyodide 프로젝트](https://pyodide.org/)의 코어 컨트리뷰터가
된 지 딱 1년이 다 되어가는 시점이다.
그래서 올해는 오픈 소스 프로젝트에 참여하면서 1년간 경험하고 느낀 점들에
대해서 이야기해보고자 한다.

{{% admonition type="note" title="Pyodide?" %}}

Pyodide 프로젝트에 대해서는
[이전 블로그 글](https://ryanking13.github.io/2022/01/17/introducing-pyodide-1.html)에서 소개하였다.

{{% /admonition %}}

<div style="text-align: center;">
<img src="/assets/post_images/pyodide-1year/commits-2022.png" style="height:auto; width: 100%; max-width: 600px">
<div>
    <span style="color:grey"><small><i>
    2022년 한 해동안 Pyodide에 약 180개의 커밋을 했으니,
    대략 이틀에 한 번 꼴로 커밋을 했다.
    </i></small></span>
</div>
</div>

## 1. 사용자에서 개발자로

Pyodide 프로젝트를 처음 알게 된 것은 2021년 7월 무렵이었다.
파이썬을 브라우저에서 실행한다는 프로젝트의 목표가 흥미로웠고,
평소에 관심(만) 가지고 있던 WebAssembly 기술을
적극적으로 활용하고 있다는 점에서도 매력을 느꼈다.

처음에는 간단한 토이 프로젝트를 만들어 볼 목적으로
Pyodide를 살펴보기 시작했었는데,
그 과정에서 빌드 문제를 해결하는
[PR](https://github.com/pyodide/pyodide/pull/1711)을
올린 것이 이 Pyodide 에의 첫 기여였다.

<div style="text-align: center;">
<img src="/assets/post_images/pyodide-1year/first-pr.png" style="height:auto; width: 100%; max-width: 600px">
<div>
    <span style="color:grey"><small><i>
    Pyodide 프로젝트에 올린 한 줄짜리 첫 번째 PR
    </i></small></span>
</div>
</div>

그 후로 Pyodide를 사용하면서 발생하는 문제들이나
오래되어 업데이트 되지 않은 문서에 관련된 부분들을
간간히 리포팅하고 수정했었는데,
약 3개월 정도가 지난 2021년 11월에
메인테이너로부터 이슈를 닫을 수 있는
권한이 있는 community members 자격에 초대한다는 메일을 받았다.

<div style="text-align: center;">
<img src="/assets/post_images/pyodide-1year/community-members.png" style="height:auto; width: 100%; max-width: 600px">
</div>

사실 이는 프로젝트에 대한 실질적인 권한이 있다기보다는
그 동안의 기여에 대한 인정을 해주는 느낌에 가까웠는데,
나에게 있어서는 기존에는 Pyodide를 사용하는 개인 사용자라는 입장이었다면,
이제는 내가 Pyodide 프로젝트에 일부가 되었다는 느낌을 받았었다.

그렇다보니 이 시점부터 프로젝트에 대한 관심이 많이 커졌고,
한편으로는 약간의 자신감도 생겼다.
Pyodide 코드베이스는 꽤나 복잡도가 높은 편인데,
그래서 이전에는 예상치 못한 부작용이 발생할까봐
코어 로직을 건드리는 것에 부담감을 느껴
잘못된 것을 수정하는 수준의 기여가 대부분이었다면,
이 시점부터는 새로운 기능을 추가하는 등의 기여를
시도하기 시작했다. 그리고 그 후로 약 2개월 정도가 더 지난 2022년 1월에
PR을 머지할 수 있는 권한이 있는 코어 개발자 자격을 얻었다.

지금에서야 하는 얘기지만 사실 처음 코어 개발자로 초대를 받았을 당시에는
아직 몇 달 참여하지 않은 사람에게 이렇게 쉽게 위험한(?) 권한을 줘도 되는가라는
일종의 임포스터 신드롬같은 느낌을 받았었다.
그러나 시간이 지나고 지금 코어 개발자의 위치에서 생각해보면
두 가지 이유에서 꽤나 합리적인 결정이었다고 생각한다.

**첫째로**, 대부분의 오픈 소스 프로젝트는 만성 인력 부족을 겪고 있다.

대형 회사가 운영하는 오픈 소스를 제외한 대부분의 오픈 소스 프로젝트들은
자원 봉사자들이 파트 타임으로 개발하고 있고,
Pyodide의 경우도 원래는 모질라에서 개발을 했었던 프로젝트였지만,
현재는 커뮤니티 주도 오픈 소스로 이관된 상태고,
초기 메인테이너는 개발을 하지 않고 있다.
그렇다보니 프로젝트 기여에 관심을 가지는
한 사람 한 사람이 굉장히 소중할 수밖에 없다.

<div style="text-align: center;">
<img src="https://www.commitstrip.com/wp-content/uploads/2014/05/Strip-Vision-Open-source-650-finalenglish.jpg" style="height:auto; width: 100%; max-width: 600px">
<div>
    <span style="color:grey"><small><i>오픈 소스 개발의 이상과 현실</i></small></span>
</div>
</div>

**둘째로**, 대부분의 사람들은 지속적으로 오픈 소스에 기여하지 않는다.
아무리 인기 있고 매력적인 오픈 소스 프로젝트라도, 대부분의 개발자들은
여러 현실적인 이유로 지속적으로 오픈 소스에 기여하지 않는다.
기본적으로 오픈 소스 개발은 자기 만족에 가까운데,
자신의 시간과 노력을 들여 뚜렷한 금전적인 보상이 없는
활동을 지속적으로 할 수 있는 사람은 드물다.

그렇다보니 짧은 기간이나마 프로젝트에 관심을 가지고 소통을 하는 사람들은
프로젝트 개발자들에게 굉장히 소중하고 고마운 사람이 된다.
이는 Pyodide에 한정한 내 경험이지만,
대부분의 오픈소스에 적용되는 이야기라고 생각한다.

## 2. 코어 개발자의 일

<div style="text-align: center;">
<img src="/assets/post_images/pyodide-1year/dalle-dev.png" style="height:auto; width: 100%; max-width: 400px">
<div>
    <span style="color:grey"><small><i>DALL-E: A software engineer writing code</i></small></span>
</div>
</div>

코어 개발자가 되기 전 후에는 어떤 부분이 달라졌을까?

사실 프로젝트의 코어 개발자라고 해서 특정한 의무가 생기지는 않는다.
나를 포함해서 Pyodide를 개발하는 모든 개발자는 여가 시간을 이용해서
Pyodide에 기여하는 개발자들이고, 그렇기 때문에 정기적으로 미팅에 참여해야 한다거나,
특정한 이슈에 할당이 되어서 정해진 기간 내에 문제를 해결해야 한다던가하는 의무는 없다.
그렇지만, 본인이 프로젝트에 애정을 가지게 된만큼, 의무는 없지만 의무감은 생긴다.

기본적으로 Pyodide는 코어 개발자 1인 이상의 승인을 받아야 머지가 가능하도록 되어있다.
Pyodide에 정기적으로 기여하는 코어 개발자는 나를 포함해 셋이고,
그렇기에 내가 아닌 다른 개발자가 PR을 올렸다면 나 또는 다른 한 사람이 리뷰를 해야 머지가 가능한 구조다.

바꾸어 말하면, 다른 코어 개발자가 열심히 일을 해서 PR을 잔뜩 만들었다면,
리뷰가 bottle-neck이 되지 않기 위해서 열심히 리뷰를 해야 한다는 뜻인데,
단순 기여자일 때와 코어 개발자일 때의 가장 큰 차이점은,
리뷰를 하기 위해서 레포지토리에 올라오는 모든 이슈와 PR을 살펴볼 필요가 생긴다는 점이다.

기존에는 이슈나 PR이 올라와도 내가 관심이 없는 분야이거나 잘 모르는 내용이라면
"에이 모르겠네~"하고서 넘겼다면,
이제는 최소한 무슨 일이 일어나고 있는지 정도는 알고 있어야 하며,
필요 시에는 큰 방향성에 대해서도 깊게 ~.

Pyodide는 Python, C, JavaScript, WebAssembly 등 여러 언어를 사용하고 있고,
~...

## 3. 흥미로운 경험들

이번 문단에서는 오픈 소스 개발을 하면서 얻은 흥미로운 경험들에 대해서
조금 적어보려고 한다.

### 파이썬 생태계 개발자들과의 교류

Pyodide는 일종의 파이썬 배포판이라는 특성상
파이썬 생태계 전체를 포괄하는 프로젝트이며,
그렇다보니 파이썬 생태계 내의 다양한 개발자들과
교류를 하게 된다.

예를 들면,

- CPython의 WebAssembly 공식 지원과 관련하여 CPython 코어 개발자들과 커뮤니케이션을 하고
- 웹 환경에서의 패키징을 위해서 Python Packaging Authority(PyPA) 사람들과도 대화를 나누고
- 데이터 과학 분야의 패키지들을 브라우저 환경에 포팅하기 위해서 Numpy, Scipy, Scikit-learn의 개발자들과도 교류를 해야한다.

~~.

### Jupyterlite Community Workshop

jupyterlite, anaconda, pyscript, ...

## 4. 힘든 점

### 나에겐 낮이지만 너에겐 밤이다

전 세계 어디서나 언제든 ~ 이슈를 올리고 코드를 수정할 수 있다.

한국에서는 밤이어도, 세계 어딘가에서는 낮이고,
한국에서는 주말이어도, 세계 어딘가에서는 주중이다.

깃헙 알림이 메일로 오는데, 주말밤낮 가리지 않고 ~ 울려대는 메일 소리는
~ 힘들게 한다.

처음 코어 개발자가 되었을 때는, 조금이라도 빠르게 ~
흘러가는 모든 일들을 샅샅이 알아야 한다고 생각해서 ~

그 과정에서 ~.

자신이 관심이 있어서 시작한 일이라도, 의무가 되면 ~.
번아웃이 이래서 오는 것인가 싶더라.
지금은 ~ 개인의 삶과 ~ 밸런스를 맞추려고 노력 중이다.

주말에는 의도적으로라도 ~ 않도록 하고 있고, 사실 ~ 아무 문제도 발생하지 않는다.

## 5. 얻은 것

- 다양한 것 배우기
- 오픈 소스와 프로젝트의 지속 가능성

## 6. 프로젝트의 미래와 앞으로의 계획

Pyodide는 여전히 실험적인 프로젝트이지만,
2022년 들어 WebAssembly가 크게 주목받으면서 빠르게 성장하고 있다.

CPython에서 이미 WebAssembly를 지원하기 위한 노력이 진행되고 있고,
Anaconda가 올해 공개한 PyScript가 대중들에게 크게 알려지면서
일반 파이썬 개발자들도 브라우저위의 Python이라는 것에 관심을 가지기 시작했다.

Pyodide는 기존에는 모든 것을 직접 만들어야 했지만,
이제는 다양한 ~ . 다양한 것들을 표준화하고 ~.

나 개인적으로도 이러한 ~ 노력하고 있고, ...

## 7. 감상과 결론

