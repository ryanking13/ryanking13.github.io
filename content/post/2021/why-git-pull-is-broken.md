---
date: "2021-10-15T00:00:01+09:00"
title: 왜 git pull은 망가졌는가? (번역)
description: 왜 git pull은 망가졌는가? (번역)
summary: git pull의 동작과 오해에 대해 설명합니다.
draft: true
categories:
- Miscellaneous
---

> 원문: [_"Why is git pull broken?"_ (Felipe Contreras)](https://felipec.wordpress.com/2021/07/13/why-is-git-pull-broken/)

이 글의 원작자인 Felipe Contreras는 한 때 git의 코어 개발자였으나 메인테이너인 Junio와의 갈등으로
현재는 git 메인 레포지토리에 기여하지 않는 개발자입니다.
그의 블로그에는 git 개발과 관련된 흥미로운 뒷얘기들이 몇 가지 있는데요.
그 중 짧고 재미있는 글을 하나 소개합니다.

이 글을 읽고 흥미가 생기셨다면,
이 글의 긴 버전이자 git pull과 관련한 13년간의 논의를 담은 글인
[git update: the odyssey for a sensible git pull](https://felipec.wordpress.com/2021/07/05/git-update/)을 읽어보시는 것을 추천합니다.

> **Note**: 이 글은 원문의 뉘앙스를 살리기 위해 가벼운 문체로 작성되었습니다.

## 들어가며

이 글의 결론은 다음과 같습니다.

> **git pull을 쓰지 마세요.**

진심입니다.

"아니 왜?" 라고 생각하셨다고요?
반갑습니다, 여러분은 이 글을 읽으셔야 합니다.

저를 포함한 몇몇 개발자들은 git pull이 망가져 있으며,
대다수의 유저들에게 있어 git pull은 쓰지 말아야 하는 명령어라는 것을 알고 있습니다.
그러나 많은 사람들은 그러한 사실을 모르고 계속 git pull을 사용하고 있습니다.

### git pull을 써도 되는 사람들

본론으로 들어가기 전에,
"대다수의 유저"가 git pull을 써서는 안 된다고 언급했습니다.
그럼 git pull을 써도 되는 사람은 누구일까요?
바로 여러분이 프로젝트의 메인테이너일 때입니다.

git pull은 메인테이너들을 위해서 만들어졌습니다.
프로젝트 참가자가 메인테이너에게 풀 리퀘스트(Pull Request)를 보내면,
메인테이너는 해당 풀 리퀘스트에 대해 git pull을 합니다.
이러한 용도로는 git pull은 아주 완벽하게 동작하고 있습니다.

그러나 여러분이 메인테이너가 아닌 개발자이고,
특정한 문제를 해결하기 위해 독립적인 브랜치에서 작업하고 있다면,
여러분은 git pull을 할 필요가 없습니다.

이 글은 그러한 메인테이너가 아닌 독자들을 대상으로 쓰여졌습니다.
(유감스럽게도 그러한 사람들이 대부분이죠.)

## 문제 1: git pull은 머지 커밋을 만듭니다

여러분이 git pull을 사용하는 주된 이유는
로컬 브랜치(e.g. master)의 상태를 대응되는
원격 브랜치(e.g. origin/master)와 동기화하기 위함일 것입니다.
동기화를 왜 하냐구요? 그렇게 하지 않으면 git push를 할 때 이런 에러가 발생할테니까요.

```sh
To origin
! [rejected] master -> master (non-fast-forward)
error: failed to push some refs to 'origin'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull …') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
``` 

익숙한 메세지죠?

이 메세지를 읽고 나면 보통 사람들은 자연스럽게 다음와 같이 생각할 것입니다.

> _'원격 브랜치에 변경사항이 있으니 그것을 로컬 브랜치에 통합해야 하는구나.'_
<br /><br />
> _'힌트에 git pull을 쓰라고 되어있네? git pull을 사용하면 되겠구나.'_
<br /><br />
> _'git push는 로컬 브랜치의 변경사항을 원격 브랜치에 반영하는 명령이지.'_
<br /><br />
> _'그렇다면 git pull은 git push에 "거울"처럼 대응되는, 원격 브랜치의 변경사항을 로컬 브랜치에 반영하는 명령어겠구나.'_

어떤가요?

안타깝게도 [틀렸습니다.](https://lore.kernel.org/git/7vpr8hlow9.fsf@alter.siamese.dyndns.org/)

git pull은 처음부터 그런 용도로 만들어지지 않았습니다.
git push의 거울상을 원한다고요? git pull이 아닌 git fetch를 사용해야 합니다.
git fetch는 원격 브랜치의 변경사항을 로컬로 단순히 가져오는 기능을 하며,
그것을 로컬 브랜치에 통합할지 말지는 여러분의 선택으로 남겨둡니다. [^mercurial]
한편, git pull은 원격 브랜치의 변경사항을 로컬로 가져올 뿐만 아니라,
이를 로컬 브랜치에 머지해버리죠.

[^mercurial]: 참고로, git과는 다른 버전 관리 소프트웨어인 Mercurial에서는 `hg pull` 명령어가 git fetch와 동등합니다. 
 즉 Mercurial에서는 hg push와 hg pull이 대칭적인데요. git은 그렇지 않습니다.

왜 그렇게 혼동되게 만들었지? 하고 궁금해하실 수 있습니다.
사족으로 말씀드리면, 분명 한 때는 git pull을 git push와 대칭적인 명령어로 만들려는 움직임이 있었습니다.
그러나 git 프로젝트의 메인테이너가 이를
["멍청한 정신적 자위행위"](https://lore.kernel.org/git/7vpr8hlow9.fsf@alter.siamese.dyndns.org/)라고 
일축해버렸습니다.
그러니 앞으로도 git pull이 git push와 대칭적인 명령어가 될 일은 없을 것입니다.
 
다시 본론으로 돌아와서,
git fetch를 통해서 원격 브랜치에서 변경사항을 로컬로 가져온 뒤,
로컬 브랜치와 원격 브랜치를 통합할 때는 두 가지 경우의 수가 있습니다.
fast-forward와 diverging입니다.
 
### fast-forward
 
 fast-forward는 아주 간단합니다.
 로컬 브랜치와 원격 브랜치의 커밋이 갈라지지 않은 경우죠.
 여러분이 로컬 브랜치에 새로 커밋을 하지 않은 상태에서
 원격 브랜치가 다른 사람에 의해 수정되었다면 fast-forward가 가능합니다.

<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/ff_0-2.png">
</div>

<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/ff_1-2.png">
</div>
 
 이 경우에는 단순히 로컬 브랜치를 원격 브랜치가 가리키는 위치로 업데이트 하게 됩니다.
 위의 예에서는, 로컬 브랜치인 "master" (A)가
 원격 브랜치가 가리키는 "origin/master" (C) 위치로 fast-forward 되는 것을 확인할 수 있습니다.
 
### diverging

<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/merge_0.png">
</div>

fast-forward는 아주 간단했습니다.
그러나 브랜치가 서로 다른 커밋으로 가지를 뻗어나간(diverging) 경우라면,
문제가 조금 복잡해집니다.

위의 경우 로컬 브랜치인 "master" (D)와 원격 브랜치인"origin/master" (C)가
(A)라는 부모 커밋에서 서로 갈라져 나온 상태입니다.
이 두 브랜치를 통합하는 데에 있어 선택지가 생깁니다. merge와 rebase입니다.
 
#### merge

<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/merge_1.png">
</div>
 
 merge 방식은 (C)와 (D)를 함께 부모로 하는, 새로운 머지 커밋 (E)를 만들고
 두 브랜치를 (E)로 일치시키는 방식입니다.
 
#### rebase

<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/rebase_1.png">
</div>
 
 rebase 방식은 두 브랜치가 갈라져나온 문제를 해결하기 위해
 새로운 커밋을 만들어 커밋 히스토리를 재작성합니다.

 위 사진에서 볼 수 있듯이 로컬 브랜치 "master" (D)의 커밋을
 원격 브랜치 "origin/master" (C) 위에 재작성 (D')하여,
 커밋 히스토리를 선형적으로 바꾸었습니다.
 (이 경우 마치 처음부터 브랜치가 갈라지지 않고 로컬 브랜치가 (C)에서 만들어진 것처럼 보이게 됩니다)
 
### 두 가지 선택지

  자, 앞선 예에서 볼 수 있듯이 두 브랜치의 커밋이 갈라졌을 경우
  우리에게는 merge와 rebase의 두 가지 선택지가 있습니다. 
  우리는 이 둘 중 어떤 것을 골라야 할까요? 정답은 _"그때 그때 다릅니다"_.
  
  어떤 프로젝트는 선형적인 커밋 히스토리를 선호합니다. 이 때는 반드시 rebase를 해야합니다.
  다른 프로젝트는 히스토리를 있는 그대로 남기고 싶어할 수 있습니다. 이 때는 merge를 해야합니다.
  대부분의 전문가들은 rebase를 선호합니다. 그러나 당신이 git 초심자라면 merge가 더 쉽습니다.
  
  아직 통일된 답은 없습니다. 그러니 상황에 맞추어 선택을 해야 합니다.
  그런데 사람들은 보통 정해진 답이 없을 때 어떻게 하나요? _**아무것도 안합니다**_.

  여기서 문제가 발생합니다. 기본적으로 git pull은 merge를 합니다.
  그러므로 대부분의 사람들은 무엇이 옳은 선택지인지 모른 채 무심결에 merge를 하게 됩니다.
  그게 옳은 것이 아닐 때도요.
  올바른 방식은 git pull 대신 git fetch를 사용하고
  merge를 할 지 rebase를 할 지를 직접 정하는 것입니다.
  
## 문제 2: 잘못된 머지 순서
 
 여기까지 글을 읽으신 분들은 다음과 같이 질문하실 수 있습니다.
 
 > "제가 참여하는 프로젝트는 rebase대신 merge를 해도 된다고 합니다.
 그럼 그냥 git pull을 해서 merge를 해도 되는 거 아닌가요?"
 
아니요. 틀렸습니다.
 
<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/merge_1.png">
</div>
 
아까 보여드렸던 위의 그림이 git pull 이 기본적으로 머지 커밋을 만드는 방식입니다.
그런데 보시면 원격 브랜치인 "origin/master" (C) 를 로컬 브랜치인 "master" (D)
에 머지하고 있는 것을 확인할 수 있습니다.
잘 생각해보시면, 분명 개발의 중심 가지가 되는 것은 원격 브랜치 쪽입니다.
그런데 마치 로컬 브랜치가 중심인 것처럼 동작하고 있네요.
 
 네, 순서가 잘못됐습니다.
 
<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/merge_good_1-1.png">
</div>
 
 이 그림이 올바른 머지 순서입니다. 로컬 "master" (D) 가 원격 "origin/master" (C)에 머지되어야 합니다.
 여러분이 로컬에서 임시 브랜치를 만들고, master 브랜치에 머지했을 때 일어나는 일을 생각해보시면
 이해가 쉬울 겁니다.
 
 git에서 머지 커밋은 둘 이상의 부모를 가지는 커밋이고, 순서가 중요합니다.
 위의 예에서는 E의 첫번째 부모는 C이고, 두번째 부모는 D입니다.
 각 부모를 가리키기 위해서 첫번째 부모는 master^1, 두번째 부모는 master^2를 사용하죠.
 
### 올바른 히스토리
 
이제 여러분은 이것을 질문하셔야 합니다.
"누가 첫번째 부모인지가 그렇게 중요한 문제인가요?"

물론 그렇습니다.

<div style="text-align: center;">
<img src="https://felipec.files.wordpress.com/2021/07/topics.png">
</div>
 
 왼쪽은 올바른 머지 순서, 오른쪽은 잘못된 머지 순서입니다.
 
 올바른 머지 히스토리에서는 서로 다른 토픽 브랜치들이
 중심이 되는 "master"(파란색) 브랜치에서 갈라져나와서
 다시 "master" 로 통합되는 것이 명백합니다.
 
 [gitk](https://git-scm.com/docs/gitk/)와 같은 시각화 도구는
 그런 히스토리를 아주 예쁘게 잘 보여주죠.
 또한 `git log --first-parent`와 같은 명령어를 사용하면 메인 커밋만 순회할 수 있습니다.
 
 그러나 잘못된 머지 히스토리에서는 머지 결과가 엉망이 됩니다.
 무엇이 어디로 머지되었는지도 불명확하고,
 시각화 도구로 보여지는 결과로 이상합니다.
 `git log --first-parent`의 결과는 잘못된 커밋(초록색)을 따라가게 될 것입니다.
 
아직도 설득력이 부족하다면, 머지 충돌(conflict)을 해결할 때를 생각해보세요.
여러분의 로컬 변경사항을 원격 브랜치("origin/master")에
통합하는 것이 반대 방향보다 논리적으로 적합합니다.

## 의견에 동의하는 사람들

많은 사람들의 팩트를 무시하고 제 의견을 믿지 못하는 것 같아
git pull이 잘못된 행동을 하고 있다는 것에 
동의하는 다른 개발자들의 목록을 가지고 왔습니다.

- [Linus Torvalds](https://lore.kernel.org/git/CA+55aFz2Uvq4vmyjJPao5tS-uuVvKm6mbP7Uz8sdq1VMxMGJCw@mail.gmail.com/)
- [Junio C Hamano](https://lore.kernel.org/git/7vli74baym.fsf@alter.siamese.dyndns.org/)
- [Jonathan Nieder](https://lore.kernel.org/git/20140430200146.GU9218@google.com/)
- [Richard Hansen](https://lore.kernel.org/git/5228A14B.3000804@bbn.com/)
- [Philip Oakley](http://lore.kernel.org/git/C439C0C76DA44AB5AAC91E7C0D2991BA@PhilipOakley)
- [Elijah Newren](https://lore.kernel.org/git/CABPp-BGrwNf9p6Ayu=A4CF9ydww8tQfvzFqFO1rNm-QG55yG6w@mail.gmail.com/)
- [Alex Henrie](https://lore.kernel.org/git/20200228215833.319691-1-alexhenrie24@gmail.com/)
 
## 결론
  
여러분이 git pull로 merge를 하고 있다면, 지금 잘못하고 있습니다.
git pull을 올바르게 하는 방법은 *언제나* rebase를 하도록 하는 것입니다.
그러나 많은 git 초심자들은 rebase가 무엇인지 모르니,
git pull이 rebase를 하게 한다고 해서 모두가 만족하지는 못할 것입니다.
  
더 적절한 해결책은 [제가 제시한 git update 명령어](https://felipec.wordpress.com/2021/07/05/git-update/) 입니다.
머지 커밋을 올바른 순서로 만들고, 문제가 없을 때는 fast-forward를 하고,
제대로 옵션 설정이 가능한 명령어죠.
  
이 글을 읽은 여러분은 git pull이 완전히 망가져있고
잘 모른 채 써서는 안 된다는 걸 아셨을 겁니다.
git pull은 일반 사용자가 아닌 메인테이너가 사용하기 위해서 만들어졌습니다.
  
git fetch를 사용하고, 어떻게 통합할지는 나중에 결정하세요.