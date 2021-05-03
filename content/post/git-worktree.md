---
date: "2021-05-10T00:00:01+09:00"
title: Git worktree 사용하기
description: Git worktree 명령어를 소개합니다.
summary: Git worktree 명령어를 소개합니다.
draft: false
categories:
- Miscellaneous
---

## Why `git worktree`

git 레포지토리에서 어떠한 작업을 하는 중에,
다른 일을 먼저 처리해야 하는 경우가 있습니다.
대표적으로는 버그를 잡는 일 같은 것이 있죠

지금 하던 일이 완료되었다면 커밋을 하고 다른 브랜치로 넘어가면 되겠지만,
아직 한창 작업하는 중이었다면 커밋을 할 수가 없습니다.

이런 경우에 흔히 사용하는 해결책은 `git stash` 커맨드를 이용해서 현재 작업중이던 내용을
임시 공간에 push하고 나중에 다시 가져와서 사용하는 것입니다.
그러나 그런 인터럽트가 너무 잦아서 매일 수차례 `stash`를 하게 된다면? 한 버그를 잡다가 더 급한 다른 버그를 고치기 위해 다시 `stash`를 하게 된다면? 작업 환경이 엉망이 될 수도 있겠죠.

다른 방법으로는 작업용 레포지토리는 놔두고, 버그 픽스용으로 같은 레포지토리를 계속 clone해서 사용하는 방법도 있겠습니다. 이렇게 하면 각 디렉토리에서 작업중인 파일은 그대로 유지가 되겠지만, 여러 개의 레포지토리를 유지하다가 헷갈리기라도 하는 순간에는 실수가 발생하겠죠.

이러한 상황에서 유용하게 사용할 수 있는 커맨드가 `git worktree`입니다. 이 글에서는 한 번 배워두면 더 이상 없이 살 수 없을 것이라고 장담하는 `git worktree`를 소개합니다.

## `git worktree`

git worktree는 한 레포지토리에서 여러 개의 작업트리를 관리하기 위해서 사용하는 명령어입니다.

작업트리라고 하면 단어가 익숙치 않을지도 모르지만,
여러 개의 브랜치를 유지하면서 각 브랜치에서 특정한 작업을 한다면 각각의 브랜치가 하나의 작업트리라고 볼 수 있습니다.

그런 의미에서 git worktree는 한 레포지토리의 여러 개의 브랜치를 동시에 보고 관리할 수 있는 도구라고 생각할 수 있습니다. [^1]

[^1]: 이해를 돕기 위한 설명으로 엄밀하게는 worktree != branch 입니다. 자세한 내용은 [git-worktree 공식 문서](https://git-scm.com/docs/git-worktree)를 참고하세요.

## 새로운 작업트리 만들기

`git worktree add <path>` 는 path의 위치에 새로운 worktree를 만듭니다.

이 때 path의 마지막 요소를 이름으로 하는 브랜치를 새로 생성하고 path의 위치에 새로운 작업트리 폴더를 생성합니다.

예를 들어, 현재 master 브랜치에서 작업중이고, file1이 수정되고 아직 커밋되지 않은 상태입니다.

```sh
$ ls
file1

$ git status
On branch master
Changes not staged for commit:
        ...
        modified:   file1

$ git diff file1
...
-original
+modified
```

여기서 git worktree add ../bugfix 를 실행하면, 현재 폴더는 유지된 채로 상위 디렉토리에 bugfix 폴더가 생성됩니다.

```sh
$ git worktree add ../bugfix
Preparing worktree (checking out 'bugfix')
HEAD is now at 6796293 Initial commit

$ ls
file1

$ ls ../bugfix
file1

$ cat ../bugfix/file1
original

$ cd ../bugfix && git status
On branch bugfix
nothing to commit, working tree clean
```

bugfix 디렉토리에는 마지막 커밋된 상태로 새로운 `bugfix` 브랜치가 만들어져있습니다.

## 삭제

`git worktree remove <name>`

## 기타 고급 활용법

- detach
- list
- move

### Reference

- https://git-scm.com/docs/git-worktree
- https://levelup.gitconnected.com/git-worktrees-the-best-git-feature-youve-never-heard-of-9cd21df67baf