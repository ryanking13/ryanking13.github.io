---
date: "2018-10-02T00:00:00Z"
categories:
- Python
title: (번역) 드롭박스의 파이썬3 이식 이야기
summary: " "
---

> [원문 링크: Dropbox Tech Blog - How we rolled out one of the largest Python 3 migrations ever](https://blogs.dropbox.com/tech/2018/09/how-we-rolled-out-one-of-the-largest-python-3-migrations-ever/amp/?__twitter_impression=true)

---

드롭박스는 세계에서 가장 유명한 데스크탑 애플리케이션 중 하나입니다. 윈도우즈, macOS, 그리고 몇몇 리눅스 배포판에도 드롭박스 애플리케이션을 설치할 수 있죠. 그런데 혹시 드롭박스의 많은 부분이 파이썬으로 작성되어 있다는 사실은 알고 계셨나요? Drew[^1]가 처음 작성한 윈도우즈용 드롭박스는 pywin32와 같은 라이브러리를 사용하여 파이썬 코드로 작성되어 있었습니다.

드롭박스는 긴 시간동안 파이썬 2(최근에는 파이썬 2.7)를 사용해왔습니다만, 지난 2015년 파이썬 3으로의 이식을 시작했습니다. 지금은 모든 이식이 끝난 상태입니다. 즉, 당신이 지금 드롭박스 애플리케이션을 쓰고있다면, 그 애플리케이션은 우리가 개량한 파이썬 3.5를 사용합니다. 이 글은 우리가 어쩌면 세상에서 가장 복잡한 파이썬 3으로의 이식을 달성하기 위해서 어떻게 계획하고, 수행하고, 또 완성품을 배포했는지, 그 긴 일대기를 담은 첫 글입니다.

### 왜 파이썬 3을 필요로 했는가?

파이썬 3을 도입하는 것은 파이썬 커뮤니티의 대표적이고 오래된 토론 주제입니다. 아직 토론이 끝났다고는 할 수 없지만, 이제는 파이썬 3을 [충분히 많은 패키지](http://py3readiness.org/)에서 지원한다고 말할 수 있죠. 대표적으로 Django의 경우는 파이썬 2를 아예 지원하지 않기로 결정하기도 했습니다. 드롭박스의 경우는, 아래와 같은 요소들이 파이썬 3을 도입하는데에 주요한 영향을 끼쳤습니다.

#### 파이썬 3의 매력적인 새 기능들

파이썬 3은 아주 빠르게 진화해왔습니다. 흔히 알려진 [많은 기능](http://whypy3.com/) 외에도, 우리는 다음과 같은 기능들에 주목했습니다.

- __타입 추론(type annotation) 문법__: 드롭박스의 코드베이스는 어마어마하게 거대합니다. 그러므로 타입 추론 문법은 개발 생산성을 향상시키는 데에 있어 매우 중요합니다. 드롭박스는 [MyPy](http://mypy-lang.org/)를 적극적으로 사용하고 있기 때문에, 파이썬 3가 네이티브하게 지원하는 타입 추론 문법은 아주 매력적이었습니다.


- __코루틴(coroutine)__: 드롭박스는 액터 모델(Actor pattern)과 `Future`를 사용하여 구현된, 스레딩과 메세지 패싱 방식을 통해 많은 기능들을 만들었습니다. 파이썬 3의 `asyncio` 프로젝트에서 나온 `async/await` 문법은 콜백함수를 제거해서 더 깔끔한 코드를 작성할 수 있게합니다.

#### 낡아가는 툴체인(toolchains)

파이썬 2의 발전이 멈추면서, 한 때는 편리하고 사용하기 적합했던 툴체인들이 점점 구식의 것이 되어갔습니다. 그러한 요소들 때문에, 점점 커지는 프로젝트에서 파이썬 2를 사용하는 것이 큰 부담이 되었습니다.

- 오래된 컴파일러/런타임을 쓰는 것이 우리가 사용하는 중요한 디펜던시를 업데이트 하는 것을 제한했습니다.
  - 예를 들어, 드롭박스는 윈도우즈와 리눅스에서 Qt를 사용합니다. 그런데 최근 버전의 Qt를 QtWebEngine에서 Chromium을 사용하기 때문에 훨씬 최신 컴파일러를 요구합니다.

- 드롭박스는 점차적으로 각 OS와 깊게 통합하려는 시도를 하고있는데, 최신 툴체인을 사용할 수 없기 때문에 새로운 API들을 사용하기 위해서 추가적인 비용(cost)이 요구되었습니다.
  - 예를 들어, 파이썬 2을 빌드하기 위해서는 Visual Studio 2008이 [요구됩니다](http://stevedower.id.au/blog/building-for-python-3-5/). 이 버전은 더이상 마이크로소프트가 지원하지 않기 때문에 Windows 10 SDK와 호환되지 않습니다.


#### 프리저(freezer) 스크립트

드롭박스는 그간 `프리저(freezer)` 스크립트를 사용하여 각 플랫폼에 맞는 네이티브 어플리케이션을 만들었습니다. macOS의 Xcode과 같은 네이티브 툴체인을 사용하는 대신, 각 플랫폼에 맞는 바이너리를 생성할 수 있는 모듈을 사용했습니다. 윈도우즈의 경우는 `py2exe`, macOS의 경우는 `py2app`, 그리고 리눅스의 경우는 `bbfreeze`를 사용했죠. 이 빌드 시스템들은 `distutils`의 영향을 받은 것이고, 원래 드롭박스는 일종의 파이썬 패키지였기 때문에, 우리는 `setup.py`와 비슷한 스크립트 하나를 사용해서 빌드를 했습니다.

시간이 지나면서, 우리의 코드베이스는 점점 거대해지고 다양해졌습니다. 오늘날 파이썬은 더이상 드롭박스를 구성하는 유일한 언어가 아닙니다. 파이썬 외에도 TypeScript/HTML, Rust, Objective-C와 C++이 섞여있죠. 이러한 각각의 컴포넌트들을 함께 사용하기 위해서, 우리의 `setup.py` 스크립트(내부적으로는 `build-all.py` 부른 것)는 너무나도 커지고 난잡해져서 더이상 유지하기 힘들 정도가 되었습니다.

결국 변화를 결정하게 된 지점(tipping point)은 드롭박스를 OS와 통합하는 부분이었습니다. 첫째로, 드롭박스는 점점 고급 OS 익스텐션(extension)을 사용하기 시작했습니다. 예를 들면 Smart Sync[^2]를 위한 커널 컴포넌트와 같은 것이죠. 이들은 당연히 파이썬으로 작성할 수 없고 그래서는 안되는 것들입니다. 둘째로, 마이크로소프트나 애플과 같은 OS 벤더들이 해당 OS의 네이티브 애플리케이션을 배포하는 데에 있어 점점 새롭고 복잡한 요구사항들을 만들었습니다. (예를 들면, 코드 서명(code signing)과 같은 것들이죠.)  

예를 들어, macOS는 버전 10.10에서 Finder와 통합할 수 있는 새로운 애플리케이션 익스텐션인 [FinderSync](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Finder.html)를 내놓았습니다. FinderSync 익스텐션은 단순한 API가 아니라, 자체적인 라이프 사이클과 프로세스간 통신에 대한 엄격한 요구사항이 있는 완전한 애플리케이션 패키지(`.appex`)입니다. Xcode는 이러한 익스텐션을 쉽게 사용할 수 있게 해줬던 반면, `py2app`은 이를 지원하지 않았습니다.


요약하자면 다음과 문제점들이 있었습니다.

- 파이썬 2 때문에 새로운 툴체인들을 사용할 수 없었고, 이는 새로운 API를 사용하기 위한 비용을 점점 증가시켰다.
- 프리저 스크립트를 사용하는 것이 네이티브 애플리케이션을 배포하는 것에 들어가는 비용을 점점 증가시켰다.

이러한 문제들 때문에 우리 모두는 파이썬 3으로의 이식이 필요하다는 것에 동의했습니다. 이제 우리는 선택을 해야했는데요. 프리저 모듈을 직접 고쳐서 파이썬 3(및 여러 최신 컴파일러들)을 지원하게 하고, 또 각 OS에 맞는 기능들 (e.g. app extension)을 추가할 것이냐, 또는 프리저를 모두 버리고 파이썬 중심의 빌드 시스템에서 탈피하는 것이냐였죠. 우리는 후자를 선택했습니다.


> __`pyinstaller`에 대하여__: 프로젝트의 초기 단계에서 pyinstaller를 사용하는 것을 진지하게 고려했습니다만, 당시에는 파이썬 3을 지원하지 않았습니다. 그리고 pyinstaller 또한 앞서 언급한 문제들과 동일한 문제를 가지고 있었습니다. 이런 내용들과는 별개로, pyinstaller가 아주 인상적인 프로젝트임에는 틀림없습니다. 단지 우리의 필요와 맞지 않았을 뿐이죠.

#### 파이썬 임베딩(embedding)

우리는 빌드/배포 문제를 해결하기 위해서, 파이썬 런타임을 네이티브 애플리케이션에 임베딩 하기 위한 새로운 아키텍처를 구성하기로 결정했습니다. 기존에는 이 과정을 프리저가 담당했는데요. 대신 각 플랫폼에 맞는 툴(e.g. 윈도우즈의 Visual Studio)을 사용하여 여러 개의 엔트리 포인트(entry points)를 만들기로 했습니다. 또한, 파이썬 코드를 라이브러리 형태로 감싸서 다양한 언어를 섞어 사용(mixing and macthing)하기에 적절하도록 만들기로 했습니다.

이러한 변화는 우리가 각 플랫폼에 맞는 IDE/툴체인을 바로 사용할 수 있으면서도(e.g. macOS의 FinderSync), 애플리케이션 로직의 많은 부분을 편리하게 파이썬으로 작성할 수 있도록 해줄 것입니다.

즉 우리는 다음과 같은 구조를 구상했습니다.

- __네이티브 엔트리 포인트(Native entry points)__: 각 플랫폼별 애플리케이션 모델에 맞는 엔트리 포인트들.
  - 윈도우즈의 COM components, macOS의 app extension과 같은 애플리케이션 익스텐션 포함.

- __여러 언어(파이썬 포함)로 작성된 공유 라이브러리__

이러한 구조는 겉으로는 애플리케이션이 각 플랫폼에서 요구하는 모습에 부합하도록 하고, 속으로는 드롭박스의 개발자들이 프로그래밍 언어나 툴을 유연하게 선택할 수 있도록 합니다.

위 구조를 통해 모듈성(mudularity)이 높아지면서 생긴 중요한 사이드 이펙트 중 하나는, 파이썬 2용 라이브러리와 파이썬 3용 라이브러리를 함께 배포할 수 있게 되었다는 점입니다. 즉 파이썬 3으로 이식을 다음의 두 과정으로 나눌 수 있게 되었습니다. 먼저, 기존에 쓰던 파이썬 2를 사용해 새로운 아키텍쳐를 구성하고, 다음으로, 파이썬 2를 싹 파이썬 3으로 교체한다.

#### 1단계: "안티-프리즈"

우리가 가장 먼저 한 일은 프리저 스크립트의 사용을 중단한 것입니다. 당시 `bbfreeze`와 `pywin32`는 둘 다 파이썬 3을 제대로 지원하지 않았기 때문이죠.

__첫째로__, 우리는 파이썬 런타임을 구성하고 파이썬 스레드를 시작하는 부분을 따로 분리해서 `libdropbox_bootstrap`라는 새 라이브러리로 만들었습니다. 이 라이브러리는 원래 프리저 스크립트가 하던 일의 일부를 수행했습니다. 우리는 더 이상 프리저 스크립트 전체가 필요하지는 않았지만, 파이썬 코드를 실행하기 위해서 최소한의 기초가 되는 아래 부분들이 필요했습니다.

__on-device execution을 위한 코드 패키징__

이는 원 소스코드가 아닌 "바이트코드(bytecode)" 형태로 파이썬 코드를 배포하기 위해서 필요합니다. 기존에는 프리저 스크립트가 각 플랫폼에 맞는 포맷(on-disk format)으로 소스코드를 변환해주었는데요. 우리는 대신 모든 플랫폼에서 사용할 수 있는 하나의 포맷을 사용하기로 결정했습니다.

- 파이썬 바이트코드인 `.pyc`의 경우, 하나의 ZIP 압축 파일(e.g. `python-packages-35.zip`)에 모든 필요한 파이썬 모듈을 담아서 배포.

- 네이티브 익스텐션인 `.pyd/.so`[^3]의 경우, 각각 애플리케이션이 문제없이 로드할 수 있는 위치에 설치되도록 함.
  - 예를 들어, 윈도우즈의 경우 엔트리 포인트(`Dropbox.exe`)와 같은 디렉토리에 위치하도록 함.

- 패키징은 `modulegraph`[^4]를 사용함

__파이썬 인터프리터 격리(isolation)__

이는 우리 애플리케이션이 다른 온디바이스 파이썬 소스를 실행하는 것을 방지합니다. 파이썬 3에서는 이러한 임베딩을 간단하게 할 수 있도록 해주는데요. 예를 들어, [Py_SetPath](https://docs.python.org/3/c-api/init.html#c.Py_SetPath) 파이썬 2에서는 프리저 스크립트가 복잡한 과정을 거쳐서 해야했던 코드 격리를 아주 간단하게 할 수 있게 해줍니다. 이를 파이썬 2에서 사용하기 위해서, 우리는 드롭박스의 파이썬 커스텀 포크(fork)에 이 함수를 백포트(back-port)하였습니다.

__둘째로__, 우리는 `libdropbox_bootstrap` 라이브러리를 사용하여 각 플랫폼 별 엔트리 포인트를 만들었습니다. `Dropbox.exe`, `Dropbox.app`, 그리고 `dropboxd`를요. 이러한 엔트리 포인트들은 각각 플랫폼의 "표준(standard)" 도구를 사용하여 빌드하였습니다. distutils 대신 Visual studio, Xcode, 그리고 make를 사용했죠. 이러한 변화는 우리가 프리저 스크립트를 사용하기 위해서 무언가를 덕지덕지 추가적으로 붙여야했던 일들을 더 이상 하지않게 해주었습니다. 예를 들면, 윈도우즈에서 DEP/NX[^5]를 사용하는 것을 훨씬 더 간편하게 만들어주었죠.

> 윈도우즈에 관하여: 이 시점에서 Visual Studio 2008을 사용하는 데 들어가는 비용이 너무 컸습니다. 전환 과정에서 우리는 파이썬 2와 파이썬 3을 동시에 지원하는 버전이 필요했기 때문에, Visual Studio 2013을 사용하기로 했습니다. Visual Studio 2013을 사용하기 위해 우리는 Python 2의 커스텀 포크를 수정하여 해당 버전에서 빌드가 가능하도록 했습니다. 이러한 과정에서 들어간 많은 비용이 우리가 파이썬 3를 사용하기로 한 것이 옳은 결정이었다는 걸 확신하게 만들어주었죠.

#### 2단계: 하이브리드

드롭박스 규모의 애플리케이션에서 성공적으로 어떤 변화를 이루기 위해서는 점진적인 프로세스가 필요합니다. (드롭박스 애플리케이션은 백만줄이 넘는 파이썬 코드로 구성되어 있고 억 단위로 설치되어 있습니다!) 단순히 스위치를 on/off 하듯 한번의 릴리즈에 모든 변화를 적용할 수는 없죠, 특히 드롭박스는 2주에 한번씩 새로운 릴리즈를 발표하거든요. 파이썬 3으로 변환된 버전을 소규모의 유저에게만 미리 노출시켜서 버그가 발생했을 때 빠르게 패치할 수 있도록 하는 것이 필요합니다.

이를 위해서 우리는 드롭박스를 파이썬 2와 파이썬 3 중 어떤 것을 사용해서든 빌드할 수 있도록 만들기로 했습니다. 이를 위해선 다음과 같은 조건이 필요했죠.

- 파이썬 2와 파이썬 3 패키지를 각각 바이트코드 형태로 배포할 수 있어야 함
- 이식 과정 도중에는 파이썬 2와 파이썬 3에서 모두 잘 동작하는 하이브리드 문법을 작성하여야 함

여기서는 앞선 단계에서 우리가 적용하기로 한 임베딩 디자인을 잘 활용할 수 있었습니다. 파이썬 코드를 라이브러리/패키지로 만들어 추상화한 덕분에 쉽게 여러 개의 다른 버전을 만들 수가 있었습니다. 어떤 파이썬 버전을 사용할 지는 엔트리 포인트 (e.g. `Dropbox.app`)에서 초기화(initialization) 도중에 선택하도록 했습니다.

이는 엔트리 포인트에서 수동으로 `libdropbox_bootstrap`을 링크하도록 하여 구현했습니다. 예를 들어, macOS와 Linux에서는 `dlopen`/`dlsym`을 사용하여 사용할 파이썬 버전을 고르도록 했습니다. 윈도우즈에서는 `LoadLibrary`와 `GetProcAddress`를 사용했구요.

런타임 파이썬 인터프리터를 선택하는 것은 파이썬이 로드되기 이전에 이루어져야했습니다. 그래서 우리는 이 선택 과정을 커맨드라인 명령어를 주거나 (`/py3`), 디스크 상에(on-disk) 미리 설정을 저장해두고 사용할 수 있도록 했습니다. 전자는 개발 목적으로 사용하는 것이었고, 후자는 우리가 개발한 feature-gating 시스템인 [Stormcrow](https://blogs.dropbox.com/tech/2017/03/introducing-stormcrow/)에서 사용할 수 있도록 한 것이었습니다.

이를 통해서 우리는 드롭박스 클라이언트를 실행할 때 동적으로 파이썬 버전을 선택할 수 있게 되었습니다. 이는 CI 툴에서 파이썬 3을 타겟으로 한 유닛 테스트와 통합(integration) 테스트를 자동으로 수행하게 할 수 있게 되었음을 의미합니다. 이를 통해서 우리는 코드 커밋시에 자동으로 테스트를 수행하게 하여 파이썬 3 지원률을 떨어트리는 코드의 작성을 막도록 했습니다.

자동 테스팅을 통해서 어느 정도 안정성이 확보되고 나서, 우리는 파이썬 3을 사용한 버전을 실제 유저들에게 배포하기 시작했습니다. 처음에는 여러가지 이슈를 빠르게 잡아내고 고치기 위해서 드롭박스 직원들에게 배포했습니다. 그 이후에는 베타테스팅에 참여하는 유저들로 대상을 확대했습니다. 베타테스팅에 참여하는 유저에게 배포했다 함은, 아주 다양한 OS 버전에 대해서 테스트가 이루어진다는 뜻입니다. 최종적으로는 일반 유저들에게도 배포했습니다. 이러한 과정은 총 7개월에 걸쳐서 이루어졌습니다. 애플리케이션이 최대한 안정적으로 동작하게 하기 위해, 우리는 발견된 모든 버그를 반드시 완전히 분석해서 해결하고 난 뒤에 배포 대상 유저를 확대하도록 하였습니다.

![Gradual rollout on the Beta channel](https://dropbox.tech/cms/content/dam/dropbox/tech-blog/en-us/application/01-python-rollout-beta.png)

_베타 유저 파이썬 2, 파이썬 3 사용률 변화_

![Gradual rollout on the Stable channel](https://dropbox.tech/cms/content/dam/dropbox/tech-blog/en-us/2018/09/02-python-rollout-stable.png)

_일반 유저 파이썬 2, 파이썬 3 사용률 변화_

버전 52에서 모든 프로세스가 완료되었습니다. 파이썬 2는 드롭박스 클라이언트에서 완전히 사라졌습니다.

#### 이걸로 끝?

아직 할 이야기가 많이 남았습니다. 다음 글에서는 아래와 같은 내용에 대해서 다룰 것입니다.

- 어떻게 윈도우즈와 macOS에서 발생하는 크래시를 보고 받도록 했는지, 그것을 통해서 어떤게 파이썬 코드와 네이티브 코드를 함께 디버깅했는지.
- 어떻게 파이썬 2와 파이썬 3을 함께 지원하는 문법이 공존하도록 했는지, 어떤 도구들을 사용했는지.
- 파이썬 3 이식 과정에서 발생한 많은 버그와 일화들.

---

[^1]: Drew Houston, 드랍박스 공동설립자 겸 CEO
[^2]: 미리 파일을 동기화하는 것이 아니라 파일에 접근할 때 동기화하여 디스크 사용량을 조절하는 드롭박스의 기능
[^3]: pyd: 윈도우즈용 DLL, so: 리눅스용 DLL
[^4]: `py2app`과 `PyObjC`를 만든 Ronald Oussoren이 개발한 모듈
[^5]: 윈도우즈의 메모리 보호 기법 중 하나
