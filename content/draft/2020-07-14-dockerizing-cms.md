---
date: "2020-07-14T00:00:00Z"
description: 프로그래밍 대회 플랫폼 도커라이징 후기
draft: true
tags:
- Container
title: 프로그래밍 대회 플랫폼 도커라이징 후기
---

![CMS Logo](http://cms-dev.github.io/cms.svg)

> 전체 코드는 [ryanking13/oneshot-cms-deploy](https://github.com/ryanking13/oneshot-cms-deploy)에서 볼 수 있습니다.

## 발단

지난 3월, 코로나 사태로 인해 대학교들이 온라인 개강을 하면서,
지인으로부터 프로그래밍 과제용 사이트를 구축해달라는 요청을 받았습니다.

시중에 다양한 온라인 저지/프로그래밍 대회 플랫폼이 오픈소스로 존재해서
사이트를 구축하는 것 자체는 어렵지 않았지만,
문제는 당시에 제가 기초군사훈련을 앞두고 있어 지속적인 사이트 관리가 어려운 상황이었습니다.
사이트 구축을 요청하신 분께서 이슈에 일일이 대응하는 것은 불가능했구요.

그래서 떠올린 해결책이 전체 서비스를 도커라이징해서 쉽게 배포할 수 있게 만들고,
문제가 발생하면 그냥 인스턴스를 날려버리고 재실행할 수 있게 제공하는 것이었습니다.

마침 늘 이미지를 받아 쓰기만 하던 도커를 제대로 살펴보고 싶다는 생각도 있어서,
일 반 공부 반으로 작업을 시작했습니다.

> 👨: 문제 생기면 그냥 날리고 다시 시작 오케이? <br/>
👦: ㅇㅋ

## ⚒️ 플랫폼 선정

먼저 사이트 구축에 사용할 오픈소스 프로그래밍 대회 플랫폼으로는 [CMS](http://cms-dev.github.io/)를 골랐습니다.

CMS를 선택한 이유는 10년 넘게 관리되고 있는 안정적인 프로젝트라는 점[^1],
그리고 사실 제가 학부 조교를 할 당시에 구축해서 사용해본 적이 있는 플랫폼이기 때문입니다.👀

깃헙에서 CMS보다 훨씬 많은 스타를 받고 있는 [칭따오 대학의 OnlineJudge](https://github.com/QingdaoU/OnlineJudge)도 고려해보았습니다만,
개인적인 생각으로 중국 쪽 프로젝트의 인기에는 허수가 있다고 생각했고,
이슈 등이 전부 중국어로 작성되어 있어 문제가 발생했을 때 해결하기가 어려울 것으로 판단하여 선택하지 않았습니다.

## 🧱 구조 설계

CMS는 웹 서비스, 채점 서비스, 로깅 서비스 등의 마이크로 서비스로 구성되어 서비스 간 통신이 이루어지는 아키텍쳐이고, DBMS로는 PostgreSQL을 사용합니다.

이상적인 구조는 각 서비스를 모두 분리하여 도커화하는 것이겠습니다만,
서비스 간의 의존성이 강하고 코드도 분리가 어렵게 작성되어 있어서,
전체 서비스를 하나의 컨테이너로 묶고, DB만 별도로 구성하기로 결정하였습니다.

<div style="text-align: center;">
	<div><img src="/assets/post_images/cms_structure1.png" /></div>
	<br/>
</div>

여기서 CMS 쪽 컨테이너는 한 컨테이너에서 CMS의 여러 서비스를 실행하고 관리해야 하기 때문에 [Supervisor](http://supervisord.org/)를 활용하기로 했습니다.

## 🐳 Dockerfile 작성

이제 앞서 생각한 구조를 바탕으로 Dockerfile을 작성합니다.
PostgreSQL은 [공식 이미지](https://hub.docker.com/_/postgres)가 Docker Hub에 있으므로 그대로 사용하기로 하고, CMS 컨테이너 쪽만 작성하면 됩니다.

```dockerfile
FROM ubuntu:18.04

# ... skipped

# CMS 다운로드 및 설치

ARG CMS_DIR=cms
ARG CMS_TAR=${CMS_DIR}.tar.gz
RUN wget https://github.com/cms-dev/cms/releases/download/v1.4.rc1/v1.4.rc1.tar.gz -O ${CMS_TAR} && \
    tar -xvf ${CMS_TAR} && \
    cd ${CMS_DIR} && \
    python3 prerequisites.py --as-root install && \
    usermod -a -G cmsuser root && \
    pip3 install -r requirements.txt && \
    python3 setup.py install

COPY wait-for-it.sh /cms
COPY run-cms.sh /cms

# Supervisor 설치 및 실행

RUN pip3 install supervisor
COPY conf/supervisord.conf /usr/local/etc/supervisord.conf

EXPOSE 8888 8889 9001
WORKDIR /cms
CMD supervisord
```

> _전체 Dockerfile은 [여기](https://github.com/ryanking13/oneshot-cms-deploy/blob/master/cms-docker/Dockerfile)에서 볼 수 있습니다._

Dockerfile에는 CMS를 설치하는 부분, 그리고 Supervisor를 설치하고 실행하는 부분이 들어갑니다.

[supervisord.conf](https://github.com/ryanking13/oneshot-cms-deploy/blob/master/cms-docker/conf/supervisord.conf)파일은 supervisor가 실행할 프로세스를 지정하는 설정 파일로, CMS 구동에 필요한 서비스들이 등록되어 있습니다.

`wait-for-it.sh`와 `run-cms.sh`는 DB 컨테이너와 충돌이 발생하지 않도록 하는 스크립트로, 다음 장에서 살펴보겠습니다.

## 🐙 docker-compose.yml 작성

이제 

### References

> [http://supervisord.org/](http://supervisord.org/)

[^1]: 국제정보올림피아드, 한국정보올림피아드에서도 사용된 적이 있습니다.