---
date: "2022-04-30T00:01:00"
title: 월간 기술 스크랩 22/04
categories:
- Newsletter
description: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 4월)
summary: 흥미롭게 읽은 글이나 새로 알게 된 기술 등을 소개합니다. (2022년 4월)
draft: true
---

## ✍️ 글

### [Balancing Safety and Velocity in CI/CD at Slack](https://slack.engineering/balancing-safety-and-velocity-in-ci-cd-at-slack/)

Slack에서 PR 머지 전에 수행하는 테스트가 점점 늘어감에 따라 테스트 시간이 너무 길어져서 생산성이 떨어지고,
다양한 이유로 실패하는 flaky한 테스트 때문에 머지가 지연되는 경우가 많았다고 합니다.

이를 개선하기 위해서 PR 단계에서는 크리티컬한 테스트만 수행하고, 머지 후에 나머지의 일부를 테스트 한 후에 배포하고,
그 후에 수시간이 걸리는 나머지 테스트를 수행하게끔 파이프라인을 바꾼 이야기입니다.

이렇게 바꾸다보면 배포 속도(velocity)는 올라가지만 아무래도 안정성(safety)는 상대적으로 떨어질 수밖에 없는데,
이를 개선하기 위해서 slack에서 했던 다양한 노력을 알 수 있습니다.

## 📌 북마크

## 📰 기술 뉴스

## ⚙️ 소프트웨어 / 프로젝트

## 📙 책 / 강의 / 영상
