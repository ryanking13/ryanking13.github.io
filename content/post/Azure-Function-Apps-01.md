---
date: "2019-02-18T00:00:00Z"
description: Azure Functions 시작하기 1
categories:
- Cloud
title: Azure Functions 시작하기 1
summary: Azure의 서버리스 프레임워크인 Functions를 소개하는 글입니다.
---

그간 AWS나 Azure를 단순히 원격 서버용으로만 써오다가 최근 간단한 웹훅(Webhook)을 만들거나 주기적 작업을 해야 하는 일이 생겼다. 이 참에 Azure에서 제공하는 Functions 기능을 사용해보고 있는데, 공식 문서 이외에는 한글로 된 튜토리얼을 찾아보기 힘들어 처음 Functions 기능을 써보면서 고생한 내용을 정리해보고자 한다.

## 준비

> 이하의 내용은 아래 환경에서 테스트 되었음
> - Windows 10 x64
> - Python 3.6.6
> - Node.js 8.5.0
> - .NET Core SDK 2.2.102
> - Azure Functions Core Tools 2.3.199
> - azure-cli 2.0.54

먼저, Azure Functions 사용을 위해서는 당연히 [Azure](https://portal.azure.com/) 계정이 필요하다. Azure는 처음 가입할 경우 30일동안 사용할 수 있는 무료 credit을 준다. 이미 크레딧을 소진한 경우라도, Functions의 경우는 한달 1,000,000회 까지 무료로 요청이 가능하니 요금 부담 없이 기능을 테스트해볼 수 있다. (AWS Lambda와 동일, 상세한 요금제는 [이곳](https://azure.microsoft.com/is-is/pricing/details/functions/)을 참고)

#### Azure CLI

먼저, Azure를 처음 사용한다면 Azure와 상호작용하기 위한 CLI 도구를 설치하자. (Windows 10 외의 환경에서의 설치는 [이 곳](https://docs.microsoft.com/ko-kr/cli/azure/install-azure-cli?view=azure-cli-latest)을 참고)

[이 링크](https://aka.ms/installazurecliwindows)를 통하여 Azure CLI 설치 관리자를 다운로드 받아 설치하자.

설치가 성공적으로 완료되면 cmd나 powershell에서 `az` 명령어를 사용할 수 있게 된다.

```sh
$ az -v
azure-cli (2.0.54)
$ az login
```

`az login` 명령어를 통하여 웹 인터페이스를 통하여 Azure에 로그인할 수 있다.

#### Azure Functions Core Tools

다음으로, Azure Functions 개발도구인 Azure Functions Core Tools를 설치하자. (Windows 10 외의 환경에서의 설치는 [이 곳](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-run-local#v2)을 참고)

Azure Functions Core Tools는 .NET 기반 런타임을 사용하기 때문에 먼저 .NET Core를 설치해야 한다. [이 링크](https://dotnet.microsoft.com/download)에서 다운로드 받을 수 있다. 본 글 작성일 기준 2.1 버전 이상을 요구하니 이미 설치한 경우라도 버전이 낮다면 업데이트하여야 한다.

이후, Node.js의 패키지 매니저인 `npm`을 이용하여, 아래 명령어로 Azure Functions Core Tools를 설치한다.
(Node.js가 설치되어 있지 않다면 [Node.js 홈페이지](https://nodejs.org/) 에서 설치해주자. Azure에서는 8.5 버전 이상을 요구한다.)

```sh
npm install -g azure-functions-core-tools
```

정상적으로 설치가 완료되었다면, `func` 명령어를 사용할 수 있게 된다.

```sh
$ func

                  %%%%%%
                 %%%%%%
            @   %%%%%%    @
          @@   %%%%%%      @@
       @@@    %%%%%%%%%%%    @@@
     @@      %%%%%%%%%%        @@
       @@         %%%%       @@
         @@      %%%       @@
           @@    %%      @@
                %%
                %

Azure Functions Core Tools (2.3.199 Commit hash: fdf734b09806be822e7d946fe17928b419d8a289)
Function Runtime Version: 2.0.12246.0
```

#### Function Apps 개발에 사용할 언어 선택

Azure Functions (2.x 기준)가 지원하는 언어들은 [이 링크](https://docs.microsoft.com/ko-kr/azure/azure-functions/supported-languages)에서 확인할 수 있다. 각 언어별로 지원되는 버전이 다르기 때문에 확인하여 개발환경을 구성하여야 한다.

본 글에서는 __파이썬 3.6__ 버전을 사용한다.

## Azure Functions 시작하기

아래와 같은 주기적인 작업을 수행하는 앱을 Azure Functions으로 구현해보자.

> 매일 아침 미세먼지 정보를 읽어들여 미세먼지 농도가 높을 경우 메일로 주의 메세지를 보내는 앱

최종적으로 완성된 앱의 전체 코드는 [이 곳](https://github.com/ryanking13/daily-dust-alert)에서 볼 수 있다.

### 기본 기능 구현

미세먼지 정보를 받아오는 부분과 이메일을 보내는 부분을 먼저 파이썬으로 작성하자.

이 부분은 Azure Functions 사용과는 무관하므로 코드만 간략히 정리한다.


#### dust.py

```python
import json
import requests
try:
    from .config import api_key
except:
    api_key = ''

api_url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty'

grade2str = {
    1: '좋음',
    2: '보통',
    3: '나쁨',
    4: '매우나쁨',
}


def get_dust_information(station_name='관악구'):
    # '?stationName=종로구&dataTerm=month&pageNo=1&numOfRows=10&ServiceKey=서비스키&ver=1.3'
    params = {
        'stationName': station_name,
        'dataTerm': 'daily',
        'pageNo': '1',
        'numOfRows': '5',
        'ServiceKey': api_key,
        'ver': '1.3',
        '_returnType': 'json',
    }

    r = requests.get(url=api_url, params=params)
    data = r.json()

    # pm10: 미세먼지
    # pm2.5: 초미세먼지
    pm10 = int(data['list'][0]['pm10Value'])
    pm25 = int(data['list'][0]['pm25Value'])
    pm10_grade = int(data['list'][0]['pm10Grade'])
    pm25_grade = int(data['list'][0]['pm25Grade'])

    return {
        'pm10': pm10,
        'pm10_grade': pm10_grade,
        'pm10_grade_str': grade2str[pm10_grade],
        'pm25': pm25,
        'pm25_grade': pm25_grade,
        'pm25_grade_str': grade2str[pm25_grade],
    }

```

dust.py 파일에서는 미세먼지 데이터를 읽어온다. 데이터는 [공공데이터포털](https://www.data.go.kr/)에서 제공하는 API를 사용하여 구하도록 하였다.
`api_key`에 API 키 값을 넣고 `get_dust_information()` 함수를 실행하면 미세먼지 정보를 반환한다.
직접 API 키를 발급받아 테스트하기 귀찮다면 아래 dummy 함수를 대신 사용하자.

```python
def get_dust_information_dummy():
    return {
        'pm10': 72,
        'pm10_grade': 2,
        'pm10_grade_str': grade2str[2],
        'pm25': 37,
        'pm25_grade': 2,
        'pm25_grade_str': grade2str[2],
    }
```

#### mail.py

```python
# code adapted from: http://pythonstudy.xyz/python/article/508-%EB%A9%94%EC%9D%BC-%EB%B3%B4%EB%82%B4%EA%B8%B0-SMTP

import smtplib
from email.mime.text import MIMEText
try:
    from .config import from_address, to_address, password
except:
    from_address = ''  # 미세먼지 알림을 보낼 메일 계정
    password = ''  # 위 계정의 패스워드
    to_address = ''  # 미세먼지 알림을 받을 메일 계정


def send_mail(content, smtp_server='smtp.gmail.com:587'):
    msg = MIMEText(content)
    msg['Subject'] = '미세먼지 주의!!!!'

    gmail_smtp_server = smtp_server
    smtp = smtplib.SMTP(gmail_smtp_server)
    smtp.starttls()
    smtp.login(from_address, password)
    smtp.sendmail(from_address, to_address, msg.as_string())
    smtp.quit()
```

mail.py 파일에서는 `send_mail()` 함수를 호출하여 메일을 보낸다.

두 함수가 잘 작동하는 것을 아래와 같이 확인할 수 있다.

```sh
>>> import dust, mail
>>> dust.get_dust_information()
{'pm10_grade': 2, 'pm10_grade_str': '보통', 'pm10': 72, 'pm25_grade': 2, 'pm25_grade_str': '보통', 'pm25': 37}
>>> mail.send_mail('TEST MAIL')
```

<br/>

![](../../../assets/post_images/dustalert01.PNG)


### Azure Functions 앱 생성

앱에 필요한 기본 기능은 모두 만들었다. 이제 Azure Functions용 앱을 생성하여 완성된 기능을 붙이기만 하면 된다.

파이썬으로 Azure Functions 앱을 작성하는 경우 파이썬 3.6 버전 virtualenv 환경에서 작업해야 한다.

```sh
$ python --version
Python 3.6.6
$ virtualenv venv
$ call venv/scripts/activate
```

virtualenv 환경 생성하고 실행한 뒤, `func init <project_name>` 명령어를 통해 앱을 생성하자. 프로젝트 이름을 명시하지 않을 경우 현재 디렉토리를 그대로 사용한다.

```sh
$ func init
Select a worker runtime:
dotnet
node
python (preview)
java
powershell
```

터미널에서 인터랙티브하게 언어를 선택할 수 있다. 우리는 파이썬을 사용할 것이니, 파이썬을 선택해주자.

파이썬을 선택하면 자동으로 필요한 패키지들이 설치되고, 아래와 같이 기본적인 파일들을 생성해준다. VSCode 사용을 권장하는 마이크로소프트답게 `.vscode` 폴더도 생성된다. (VScode를 사용하면 본 글에서 콘솔로 실행하는 부분들을 Azure 확장 프로그램을 통해서 작업할 수 있다.)

```sh
$ ls # dir
.  ..  .funcignore  .gitignore  .vscode  host.json
local.settings.json  requirements.txt  venv
```

하나의 앱은 여러개의 Function으로 구성되며, 각 Function은 각각 하나의 기능을 담당한다. 예를 들어, Azure Function을 웹훅 용도로 사용한다면 여러개의 API를 서로 다른 Function으로 구성하게 된다. 우리는 정기적으로 미세먼지 알림을 보내는 한 가지 기능만 필요하므로 하나의 Function이면 충분하다.

`func new` 명령어를 통해 새로운 Function을 만들어주자.

```sh
$ func new
Select a template:
Azure Blob Storage trigger
Azure Cosmos DB trigger
Azure Event Grid trigger
Azure Event Hub trigger
HTTP trigger
Azure Queue Storage trigger
Azure Service Bus Queue trigger
Azure Service Bus Topic trigger
Timer trigger
```

Function의 용도에 따라 여러가지 트리거를 선택할 수 있는데, 주기적인 작업을 하는 용도에는 Timer trigger가 적합하다.

```sh
Select a template: Timer trigger
Function name: [TimerTrigger] DustAlert
...
The function "DustAlert" was created successfully from the "Timer trigger" template.
```

트리거의 이름(DustAlert)을 정해주면 기본적인 Timer trigger 템플릿을 바탕으로 아래와 같이 DustAlert 디렉토리와 뼈대 파일들이 생성된다.

```
$ ls
__init__.py  function.json  readme.md  sample.dat
```

자동으로 생성된 `function.json` 파일과 `__init__.py` 파일을 살펴보자.

__function.json__

```json
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "name": "mytimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 */5 * * * *"
    }
  ]
}
```

`function.json` 파일은 각 Function의 여러가지 설정 정보를 담고있는 파일이다. 예를 들어, 파이썬에서는 `scriptFile` 값과 `entryPoint` 값을 통하여 어떤 파일의 어떤 함수가 엔트리포인트가 될 지를 지정할 수 있다. (`entryPoint` 디폴트 값은 main() 함수)

`name`은 곧 살펴볼 엔트리포인트 함수에 전달되는 파라미터명이다. `type`과 `direction` 값은 Timer Trigger임을 명시하는 값이다.

`schedule`은 [cron 표현식](https://www.leafcats.com/94)을 사용하여 Function이 실행되는 주기를 지정한다.

functions.json 파일 작성에 관한 더 상세한 정보를 알고싶다면 [이 곳](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-triggers-bindings)을 참고하자.

__\_\_init\_\_.py__

```python
import datetime
import logging

import azure.functions as func


def main(mytimer: func.TimerRequest) -> None:
    utc_timestamp = datetime.datetime.utcnow().replace(
        tzinfo=datetime.timezone.utc).isoformat()

    if mytimer.past_due:
        logging.info('The timer is past due!')

    logging.info('Python timer trigger function ran at %s', utc_timestamp)
```

`__init__.py` 파일에서는 실행될 때마다 실행된 시간을 로깅하는 main() 함수가 작성되어 있다.

우선 잘 작동하는 지 확인해보자.

`functions.json` 파일에서 schedule 값을 */10 * * * * * 로 바꾸어 10초마다 한번씩 Function이 실행되도록 고친 뒤, `func host start` 명령으로 앱을 실행해보자.

```sh
$ func host start
...
[2019-01-22 오전 9:17:31] Host started (292ms)
[2019-01-22 오전 9:17:31] Job host started
...
[2019-01-22 오전 9:17:40] Python timer trigger function ran at 2019-01-22T09:17:40.118537+00:00
[2019-01-22 오전 9:17:40] Executed 'Functions.DustAlert' (Succeeded, Id=7c3b41da-ca63-41ed-b05a-1114f5f68f0c)
[2019-01-22 오전 9:17:50] Executing 'Functions.DustAlert' (Reason='Timer fired at 2019-01-22T18:17:50.0116314+09:00', Id=d555a4a3-8b06-47f4-8e58-a9c8213c9142)
[2019-01-22 오전 9:17:50] Python timer trigger function ran at 2019-01-22T09:17:50.022065+00:00
[2019-01-22 오전 9:17:50] Executed 'Functions.DustAlert' (Succeeded, Id=d555a4a3-8b06-47f4-8e58-a9c8213c9142)
...
```

10초 단위로 Function이 실행되는 것을 확인할 수 있다.

### 기능 붙이기

Azure Function이 어떻게 구성되어있는 지 확인했고, 잘 실행되는 것도 확인하였다. 그렇다면 이제 우리가 앞서 만든 기능을 달아주기만 하면 된다.

#### __init__.py

```python
import datetime
import logging

import azure.functions as func
from .dust import get_dust_information
from .mail import send_mail


def is_dust_severe(d, threshold=1):
    return True
    if d['pm25_grade'] >= threshold or d['pm10_grade'] >= threshold:
        return True


def format_mail_content(d):
    content = '오늘의 미세먼지 정보입니다.\n\n'
    content += f'미세먼지 - {d["pm10"]} ㎍/㎥ ({d["pm10_grade_str"]})\n'
    content += f'초미세먼지 - {d["pm25"]} ㎍/㎥ ({d["pm25_grade_str"]})\n'
    return content


def main(mytimer: func.TimerRequest) -> None:
    d = get_dust_information()
    if is_dust_severe(d):
        send_mail(format_mail_content(d))
        logging.info('Mail Sent at ' + str(datetime.datetime.now()))
```

Function이 실행되면, `get_dust_information()` 함수를 호출하여 미세먼지 정보를 받은 뒤, 기준 치 이상인 경우 `send_mail()` 함수를 호출하여 메일을 보내도록 만들었다.

<br/>

![](../../../assets/post_images/dustalert02.PNG)

다시 `func host start`로 실행해보면, 정상적으로 메일이 전송되는 것을 확인할 수 있다. 앱이 완성되었다!

### 앱 배포하기

이제 마지막 일만 남았다. 만들어진 앱을 Azure에 배포하여야 한다.

먼저 Azure Portal에 접속하여 Function App을 생성하자. `az` 명령어를 사용하여 콘솔로도 생성이 가능하지만 이 부분은 포털에서 작업하는 쪽이 편리하다.

<p align="center"> 
<img src="../../../assets/post_images/azure01.PNG">
</p>

<p align="center"> 
<img src="../../../assets/post_images/azure02.PNG">
</p>

Create a Resource에서 Serverless Function App을 선택한다.

<p align="center"> 
<img src="../../../assets/post_images/azure03.PNG">
</p>

앱 이름과 서버의 위치, 비용 플랜등을 선택한다. 앱 이름은 앱 URL로도 사용되므로 유니크해야 한다.

Create를 클릭하고 잠시 기다리면 앱 생성이 완료된다.

이제 우리가 만든 Function을 업로드하자.

(혹시 `functions.json` 파일의 schedule 부분을 테스트를 위해 고쳐놓고 잊어버렸다면 제대로 바꾸어놓자.)

```sh
$ pip freeze > requirements.txt
$ func azure functionapp publish <APP_NAME>
```

`func azure functionapp publish` 명령어로 앱을 업로드한다. (아직 로그인하지 않았다면 `az login`을 입력하여 먼저 로그인해주자) `<APP_NAME>` 부분에는 포털에서 앱 생성 당시에 입력한 앱 명을 적어준다. 업로드 할 때에 모든 파이썬 모듈을 합쳐서 패키징하게 되는데, `pip freeze > requirements.txt` 명령어로 requirements.txt 파일에 패키지 리스트를 미리 만들어주어야 한다.

다시 Azure Portal로 돌아가서 Function App 카테고리를 클릭해보면, 업로드가 완료되었다.

<p align="center"> 
<img src="../../../assets/post_images/azure04.PNG">
</p>

지정한 시간이 되면 미세먼지 알림이 오는 것도 확인할 수 있다 :)

<p align="center"> 
<img src="../../../assets/post_images/dustalert03.PNG">
</p>

### What's Next?

다음 포스트에서는 Azure Functions을 사용하여 간단한 웹훅을 제작하고 깃헙을 통해 자동으로 앱을 배포하는 내용을 다루도록 하겠다.

---

### Reference

> https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-reference-python