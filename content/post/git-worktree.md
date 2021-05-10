---
date: "2021-05-10T00:00:01+09:00"
title: Git worktree 소개
description: Git worktree 명령어를 소개합니다.
summary: Git worktree 명령어를 소개합니다.
draft: false
categories:
- Miscellaneous
---

__TL;DR__

> - 새로운 작업트리: git worktree add \<path>
> - 작업트리 목록: git worktree list
> - 작업트리 삭제: git worktree remove \<worktree>



## 언제 `git worktree`가 필요할까

git 레포지토리에서 어떠한 작업을 하는 중에,
먼저 처리해야 할 다른 일이 생기는 경우가 있습니다.
대표적으로는 급한 버그를 잡는 일이 있죠.

지금 하던 작업이 완료되었다면 커밋을 하고 다른 브랜치로 넘어가면 되겠지만,
아직 한창 작업하는 중이었다면 커밋을 하기가 애매합니다.

이런 경우에 많이들 사용하는 해결책은 `git stash` 커맨드를 이용해서 현재 작업중이던 내용을 임시 공간에 push하고 나중에 다시 가져와서 사용하는 것입니다.

그러나 버그가 발생하는 경우가 너무 잦아서 매일 수차례 `stash`를 하게 된다면? 나아가서는 한 버그를 잡다가 더 급한 다른 버그를 고치기 위해 다시 `stash`를 하게 된다면? 작업 환경이 엉망이 될 수도 있겠죠.

그렇다면 다른 방법으로, 주 작업용 레포지토리는 따로 놔두고, 버그 픽스용으로 같은 레포지토리를 추가로 clone해서 사용하는 방법은 어떨까요. 이렇게 하면 각 디렉토리에서 작업중인 파일은 그대로 유지가 되겠지만, 여러 개의 레포지토리를 유지하다가 헷갈리기라도 하는 순간에는 분명 귀찮은 실수가 발생할겁니다.

이러한 상황에서 유용하게 사용할 수 있는 커맨드가 `git worktree`입니다. 이 글에서는 한 번 기억해두면 종종 쏠쏠하게 써먹을 수 있는 `git worktree`를 소개합니다.

## `git worktree`?

git worktree는 한 레포지토리에서 여러 개의 작업트리를 관리하기 위해서 사용하는 명령어입니다.

작업트리라는 단어가 낯설텐데요. 일반적인 경우에서는 한 레포지토리 안에 있는 여러 브랜치를 각각의 작업트리라고 생각할 수 있습니다. [^1]

한 레포지토리의 각 브랜치는 보통 특정한 기능 구현이나 버그 수정과 같은 **작업**을 기준으로 나누게 되는데요.
이러한 각 작업 단위(브랜치)를 동시에 보고 관리할 수 있게 해주는 명령어가 git worktree입니다.

[^1]: 이해를 돕기 위한 설명으로 엄밀하게는 worktree != branch 입니다. 자세한 내용은 [git-worktree 공식 문서](https://git-scm.com/docs/git-worktree)를 참고하세요.

## `git worktree` 명령어

> 대표적인 명렁어만을 소개합니다. 상세한 사용법은 [공식 문서](https://git-scm.com/docs/git-worktree)를 참고하세요.

### add

`git worktree add <path>` 는 path의 위치에 최근 커밋(HEAD) 내용으로 새로운 작업트리를 생성합니다.

예를 들면서 살펴보겠습니다. 현재 디렉토리 구조는 아래와 같습니다.

```sh
# 디렉토리 구조
📂 project
 ┣ 📂 main
 ┃ ┣ 📂 .git (HEAD: master)
 ┗ ┗ 📜 file1 (CONTENT: new)
```

`project` 디렉토리안에 `main` 이라는 레포지토리를 clone하여 작업하고 있습니다.

```sh
/project/main$ git status
On branch master
Changes not staged for commit:
        ...
        modified:   file1

/project/main$ cat file1
new

/project/main$ git diff file1
...
-old
+new
```

현재 우리는 master 브랜치에서 작업중이고, file1이 수정(`old --> new`)되었지만 아직 커밋은 되지 않은 상태입니다.

이 상태에서 버그 수정을 해야할 일이 생겼습니다. 새로운 작업트리를 만들어보겠습니다. `git worktree add ../bugfix` 를 실행하여 상위 디렉토리에 bugfix라는 작업트리를 만들어보겠습니다.


```sh
/project/main$ git worktree add ../bugfix
Preparing worktree (checking out 'bugfix')
HEAD is now at 6796293 Initial commit
```

```sh
📂 project
 ┣ 📂 main
 ┃ ┣ 📂 .git (HEAD: master)
 ┃ ┗ 📜 file1 (CONTENT: new)
 ┣ 📂 bugfix
 ┃ ┣ 📜 .git (HEAD: bugfix)
 ┗ ┗ 📜 file1 (CONTENT: old)
```

현재 폴더는 유지된 채로 상위 디렉토리에 bugfix 폴더가 생성됩니다.
bugfix 폴더의 내용물을 살펴봅시다.

```sh
/project/bugfix$ ls
file1

/project/bugfix$ cat file1
old
```

file1이 기존에 작업하던 내용의 최근 커밋의 내용을 가지고 있는 것을 확인할 수 있습니다.

```sh
/project/bugfix$ git status
On branch bugfix
nothing to commit, working tree clean

/project/bugfix$ git branch -l
* bugfix
* master
```

bugfix 폴더의 HEAD는 `bugfix` 브랜치를 가리키고 있고, `master` 와 `bugfix` 두개의 브랜치가 존재하는 것을 확인할 수 있습니다.

이제 두 개의 브랜치를 따로 따로 작업할 수 있게 되었습니다! 서로 영향을 주는 일도 없구요:horray:

```sh
/project/bugfix$ echo aaaa > fix && git add fix && git commit -m "fix"
[bugfix e35561a] fix
 1 file changed, 1 insertion(+)
 create mode 100644 fix

/project/bugfix$ cd ../main && git merge bugfix
Updating b6b873a..e35561a
Fast-forward
 fix | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 fix
```

```sh
📂 project
 ┣ 📂 main
 ┃ ┣ 📂 .git (HEAD: master)
 ┃ ┃ 📜 file1 (CONTENT: new)
 ┃ ┗ 📜 fix (CONTENT: aaaa)
 ┣ 📂 bugfix
 ┃ ┣ 📜 .git (HEAD: bugfix)
 ┃ ┃ 📜 file1 (CONTENT: old)
 ┗ ┗ 📜 fix (CONTENT: aaaa)
```

bugfix 폴더에서 버그를 수정하고 `bugfix` 브랜치에 커밋한 뒤,
main 폴더에서 `bugfix` 브랜치를 `master` 브랜치에 머지해보았습니다.

### list

`git worktree list`로 현 레포지토리에 존재하는 작업트리 목록을 볼 수 있습니다.

```sh
/project/main$ git worktree list
[...]/project/main    e35561a [master]
[...]/project/bugfix  e35561a [bugfix]
```

각 작업트리가 어떤 커밋과 브랜치를 가리키고 있는지도 나타납니다.
위의 예에서는 `master`에 `bugfix`를 머지한 상황이라 두 작업트리 모두 같은 커밋을 가리키고 있고, 브랜치는 다른 것을 확인할 수 있습니다.

### remove

`git worktree remove <name>`으로 필요없어진 작업트리를 삭제할 수 있습니다.

```sh
/project/main$ git worktree remove bugfix

/project/main$ ls ..
main
```

```sh
📂 project
 ┣ 📂 main
 ┃ ┣ 📂 .git (HEAD: master)
 ┃ ┃ 📜 file1 (CONTENT: new)
 ┗ ┗ 📜 fix (CONTENT: aaaa)
```

## `git worktree` 활용 용도

`git worktree`의 대표적인 활용 용도는 글 초반부에서 언급한 것처럼 여러 개의 작업 트리(브랜치)를 병렬로 운용하면서,
상황에 맞춰서 적절한 작업트리에서 개발을 하는 것입니다.
이러한 작업방식에 익숙해지면 `git stash`나 `git checkout -b`를 쓰는 일 자체가 거의 없어지지 않을까 싶기도 하네요.

다른 활용 용도로, 한 [트위터리안]()은 파이썬의 소스코드을 버전 별로 나눠넣고 비교하는데 작업트리를 사용한다고 밝혔구요.

또 가능할 법한 한가지 용도로는, 작업트리를 네트워크나 usb와 같은 이동식 저장장치를 통해서 공유하는 `lock`과 같은 서브커맨드가 존재하는데, 원격 저장소를 활용할 수 없는 특수한 환경에서 git 레포지토리를 공유하여 사용하는데에도 활용할 수 있지 않을까 하는 생각이 듭니다.

## 고급 명령어

기본적인 커맨드 외에 유용할 수 있는 몇가지 커맨드를 더 소개합니다.

- `git worktree add <path> -b <branch>`
  - 작업트리 브랜치 이름을 `-b <branch>` 옵션으로 지정할 수 있습니다.
- `git worktree add <path> <commit-ish>`
  - 현재 커밋이 아니라 `<commit-ish>`에 해당하는 커밋으로 작업트리를 checkout합니다.
- `git worktree add <path> --detach`
  - TODO
- `git worktree move <worktree> <newpath>`
  - 작업트리의 위치를 `<newpath>`로 이동시킵니다.


## 알아두면 도움 될지도 모르는 특징들

- 같은 branch를 가리키는 복수의 worktree 생성 불가
- worktree 디렉토리의 .git 파일 내용

### References

- https://git-scm.com/docs/git-worktree
- https://levelup.gitconnected.com/git-worktrees-the-best-git-feature-youve-never-heard-of-9cd21df67baf