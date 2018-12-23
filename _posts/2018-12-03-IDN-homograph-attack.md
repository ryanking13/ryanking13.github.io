---
layout: post
title: IDN Homograph attack 이란
tags: [Security]
---

HackerOne의 보고서들을 읽던 중, 우연히 HackerOne 사이트의 IDN Homograph attack에서 대한 [보고서](https://hackerone.com/reports/29491)가 있어서, 대강 알고 있던 내용을 다시 정리해보는 글.

---

### Typosquatting

공격자가 가짜 구글 사이트를 만들어 피해자가 가짜 사이트에 접속하게 만들고 싶다고 하자.

이를 위한 고전적인 방법은 google.com 도메인과 유사하게 생긴 도메인을 만드는 것이다. 예를 들어, go0gle.com 도메인을 만들고 피해자에게 이 사이트가 google인 척 접속하게 만든다. 더해서 Open Redirect 공격을 사용하면 성공 확률이 올라갈 것이다. 이러한 방식을 타이포스쿼팅(typosquatting)이라고 한다.

그러나 이 방식은 주소창을 눈여겨 보는 유저라면 쉽게 알아챌 수 있기 때문에, 공격자들을 좀 더 교묘하게 도메인을 속이는 방법을 찾기 시작했고 여기서 IDN Homograph attack이 등장한다.

### IDN(Internationalized domain name)?

우리가 흔히 볼 수 있는 도메인은 대부분 ASCII 문자로 되어 있지만, 때로 한글이나 일본어처럼 ASCII 범위가 아닌 유니코드 문자로 된 도메인을 볼 일이 있다. ([청와대.한국](http://청와대.한국) 이 대표적이다.)

그러나 DNS 스펙을 정의한 문서인 [RFC2181](https://tools.ietf.org/html/rfc2181)에는, DNS에 포함되는 주소가 ASCII 범위에 한정되어야 한다고 규정되어 있기 때문에 정의대로라면 유니코드 도메인은 DNS에서 처리(변환)이 불가능하다.

이 문제를 해결하기 위하여 IDN이 등장하였는데, 간단히 요약하면 유니코드 도메인을 [퓨니코드](https://ko.wikipedia.org/wiki/%ED%93%A8%EB%8B%88%EC%BD%94%EB%93%9C) 방식으로 ASCII 도메인으로 변환하여 DNS에 저장하는 방식이다.

퓨니코드 변환 규칙은 도메인 맨 앞에 퓨니코드임을 명시하는 `xn--`을 붙이고, 전체 도메인에서 유니코드 범위에 해당하는 문자를 빼서 변환한뒤 주소 뒤에 붙이는 것인데, 상세한 IDN 변환 규칙을 설명하는 것이 이 글의 목표는 아니니 관심있는 사람은 [위키피디아 문서](https://en.wikipedia.org/wiki/Internationalized_domain_name)를 살펴보도록 하자.

어쨌거나, IDN을 사용하면 임의의 유니코드 범위 도메인을 사용하는 것이 가능해진다. 예를 들어, `청와대.한국`의 경우는 `http://xn--vk1b187a8ue.xn--3e0b707e/`로 변환된다.

### IDN Homograph attack

다시 공격으로 돌아가자. IDN의 존재로 인해 우리는 유니코드 범위의 임의의 문자를 사용하여 도메인을 만들 수 있게 되었다. 공격자들은 이 기능을 이용하여 가짜 도메인을 만들어낸다.

유니코드 범위에는 라틴 문자, 키릴 문자와 같이 영어 알파벳과 거의 유사하게 생긴 문자들이 존재한다. 이러한 문자들은 폰트에 따라서는 화면 상에 완전히 동일하게 표시되기도 하는데, 이렇게 동일하게 표시되는 서로 다른 문자를 Homograph 또는 Homoglyph라고 한다.

| 알파벳 | 키릴 문자 |
|--------|-----------|
| o      | о         |
| google.com | gооgle.com    |
| http://google.com | http://xn--ggle-55da.com |

위 두 주소에서, 왼쪽은 영어 알파벳 o, 오른쪽은 키릴 문자 о를 사용해 만든 도메인이다. 두 도메인은 동일해 보이지만, 실제로 접속했을 때 연결 되는 사이트는 완전히 다른 사이트다.

### Mitigation

IDN Homograph attack은 클라이언트 사이드에서 해결해야 할 문제이기 때문에 브라우저들마다 서로 다른 해결책을 사용하고 있다. 위키피디아에 따르면, 각 브라우저의 해결책은 아래와 같다. 

- Google Chrome: 유저가 선호하는 언어일 경우는 유니코드 도메인을 그대로 보여주고, 그렇지 않은 언어는 퓨니코드로 변환된 도메인을 보여준다.

- Safari: 특정 유니코드 문자가 포함된 도메인의 경우 퓨니코드로 변환된 도메인으로 보여준다.

- Firefox: 도메인 문자 조합이 여러 언어의 조합일 경우 퓨니코드로 변환된 도메인으로 보여준다.

### New Attack Vector?

글을 쓰는 도중 Hahwul 님의 블로그에서 새로운 방식의 IDN Homograph attack을 [다룬 글](https://www.hahwul.com/2018/10/lokidn-idn-homograph-attack.html)을 발견하여 간단하게 서술한다.

LOKIDN이라고 명명된 이 공격은 공격자가 의도적으로 정상 도메인과 동일하게 보이는 도메인을 만드는 기존 IDN Homograph attack과는 달리, 이 공격은 웹 사이트 제작자의 실수를 이용한다.

한국과 같이 영어를 국어로 사용하지 않는 나라의 경우 해당 국가의 공용어와 영어를 같이 사용할 수 있게끔 키보드를 구성하여 사용한다. (한/영키를 눌러 한국어와 영어 키보드를 전환하는 것을 생각하면 된다.)

이 때, 웹사이트 제작자가 실수로 영어 도메인을 다른 언어로 오타를 내게 되면 공격이 가능해진다.

예를 들어, 독일인인 `https://www.mesutoezil.com/` 웹 사이트의 주인이, 이미지 파일을 가져오기 위해서 `<img src="https://www.mesutoezil.com/static/images/img.jpg" />` 위 HTML 구문을 삽입하려고 했다고 하자.

그러나 이 사람은 코딩을 하는 도중 실수로 `o` 대신, `ö`를 입력하여 `<img src="https://www.mesutöezil.com/static/images/img.jpg" />` 이와 같은 코드를 적어버렸다고 하자. 이 주소는 없는 주소이므로 당연히 이미지 파일 로딩에 실패한다(404 not found).

이 때, 공격자가 이러한 실수를 탐지하여, `https://www.mesutöezil.com` 도메인을 자신이 생성하고 악의적인 파일을 업로드하면 정상적인 사이트에 임의의 사진, 나아가 스크립트 삽입이 가능해진다. 즉 XSS가 발생하는 것이다.

---

### Reference

> https://hackerone.com/reports/29491

> https://en.wikipedia.org/wiki/IDN_homograph_attack

> https://en.wikipedia.org/wiki/Punycode

> https://blog.malwarebytes.com/101/2017/10/out-of-character-homograph-attacks-explained/

> https://www.hahwul.com/2018/10/lokidn-idn-homograph-attack.html