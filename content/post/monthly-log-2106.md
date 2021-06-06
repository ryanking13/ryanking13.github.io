---
date: "2021-06-30T01:01:00Z"
title: 월간 기술 스크랩 21/06
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 6월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2021년 6월)
draft: true
---

## ✍️ 글

### [리눅스 30주년 맞이 리누스 토발즈 인터뷰 번역](https://sjp38.github.io/ko/post/torvalds_interview_for_30th_anniversary_of_linux_kernel_part1/)

리눅스 탄생 30주년을 맞아 리누스 토르발즈와 진행한 인터뷰. 인터뷰어는 드루팔의 코어 개발자인 제레미 앤드류.

리눅스와 오픈소스에 대한 토르발즈의 많은 생각을 엿볼 수 있는 인터뷰입니다.
고맙게도 한국어로 번역을 해주셔서 전문을 다 읽어보시는 것을 추천드립니다.

흥미로웠던 사실은 토르발즈가 Git을 매력적이여서가 아니라 단순히 필요해 의해 만들었고,
오래 관리할 생각이 없어서 만든 다음 해애 바로 메인테이너를 넘겨줘버렸다는 점이네요.

또 리눅스 라이센스와 Git의 탄생 등에 있어서
토르발즈가 누구나 자유롭게 코드를 개발하고 배타적이지 않은 생태계를 구성하는 것을 굉장히 중요시 여긴다는 점을 알 수 있었습니다. (근데 왜 그렇게 말은 거칠게 하는지...)

### [Monetizing open-source is problematic](https://marak.com/blog/2021-04-25-monetizing-open-source-is-problematic)

오픈소스 라이브러리인 Faker.js가 지속적 개발에 금전적인 문제를 겪고 있었고,
이를 해결하기 위해 Faker.js에 도네이션을 하고 있는 Retool에 프로젝트를 매각하려다 실패한 이야기.

요약하면 위와 같은데, 본문의 뉘앙스는 좀 많이 다르니 본문을 읽어보시는게 좋습니다.

Retool이 (아마도 의도치 않게) Faker.js의 API를 재판매하는 서비스를 만들었고, 이에 대한 갑론을박이 [Hacker News 스레드](https://news.ycombinator.com/item?id=27252066)에서 있었는데요.
여론은 MIT 라이센스로 만들어놓고 이제와서 딴 소리냐, 가 많은 듯 합니다.

오픈소스로 돈을 버는 문제가 점점 이슈가 되고 있는데요.
과거에는 좋은 프로덕트를 만들면 사용하는 사람들이 그에 대한 충분한 보상을 해줄 것이다라는 믿음이 있었다면, 요즘은 클라우드 제공자들이 오픈 소스를 가지고 자기들만의 프로덕트를 만들어서 오히려 돈을 주고 파는 상황이 빈번해지고 있는데요. 그러다보니 [Elastic](https://www.elastic.co/kr/pricing/faq/licensing)이나 [MongoDB](https://www.zdnet.co.kr/view/?no=20181018170528)에서는 클라우드 제공자들이 자신들의 프로적트를 SaaS로 제공하는 것을 라이센스 변경으로 제한하기도 했죠.

오픈소스 개발자들이 노력한만큼의 합당한 보상을 받을 수 있는 시대가 올 수 있을까요? 요즘은 기대보다는 걱정이 많은 상황입니다.

+) Faker.js의 개발자 Marak은 지난 해 자신이 살던 집이 불타서 금전적 어려움을 겪으면서 [더 이상 무료로 Faker.js 개발을 하지 않겠다](https://github.com/Marak/faker.js/issues/1046)라고 말해 유명해지기도 했습니다.

## 📌 북마크

## 📰 기술 뉴스

### [Stack Overflow Sold to Tech Giant Prosus for $1.8 Billion](https://www.wsj.com/articles/software-developer-community-stack-overflow-sold-to-tech-giant-prosus-for-1-8-billion-11622648400)

개발자들의 영원한 친구 스택 오버플로우가 유럽의 거대 기술 투자사인 [Prosus](https://www.prosus.com/)에 매각되었습니다.

Prosus는 텐센트의 최대 주주로 유명하고, Udemy나 Codeacademy 같은 기술 교육 업체에도 많은 지분을 가지고 있는 것으로 알려져 있는데요.

앞으로도 스택 오버플로우가 독립적으로 잘 운영될 수 있을지,
혹은 많은 변화를 겪게될 지 궁금해지늰 상황입니다.

## ⚙️ 소프트웨어 / 프로젝트

### [DevBook](https://usedevbook.com/)

스택 오버플로우나 공식 문서를 빠르게 검색할 수 있게 해주는 데스크탑 애플리케이션.

단축키로 껐다 켤 수 있고 굉장히 빠르고 가볍습니다.

이런 식의 아이디어는 굉장히 여럿 봐왔는데 그 중에서 가장 깔끔하고 사용하기 좋게 만들어진 듯 합니다.

다만 이런 프로그램의 한계는 결국 복잡한 정보를 찾고 비교하려면 웹 브라우저를 써야한다는 것인데,
실생활에서 얼마나 유용하게 사용할 수 있을지는 다소 물음표네요.

### [Flat Data](https://octo.github.com/projects/flat-data)

깃헙에서 공개한 데이터 ETL 도구.

간단한 수준에서 주기적으로 데이터를 수집하고 저장해야할 필요가 있을 때,
Cron 형태로 동작하는 CI 도구와 깃헙은 꽤나 유용한 조합인데요.

깃헙에서 이러한 작업을 쉽게 개발할 수 있게 해주는 도구를 공개했습니다.

1. 정해진 API에서 데이터를 읽어오고 후처리한 후 깃헙에 업로드해주는 Github Actions
2. 업로드된 데이터를 브라우저상에서 볼 수 있게 해주는 도구

해당 도구를 공개한 Github OCTO는 깃헙 CTO인 Jason Warner를 중심으로
개발자들을 위한 도구를 개발하는 팀이라고 하는데요.

Flat Data를 시작으로 앞으로도 다양한 프로젝트가 공개될 듯한데 기대가 됩니다.

## 📙 책 / 강의

### [rustlings](https://github.com/rust-lang/rustlings)

컴파일 에러를 고쳐가며 배우는 러스트.

단순히 튜토리얼을 읽는 것보다 몰입감있게 러스트를 배울 수 있습니다.