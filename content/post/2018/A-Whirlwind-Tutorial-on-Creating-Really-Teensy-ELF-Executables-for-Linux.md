---
date: "2018-11-05T00:00:00Z"
categories:
- Linux
title: (번역) 초소형 ELF 바이너리 만들기
summary: " "
---

> [원문 링크: A Whirlwind Tutorial on Creating Really Teensy ELF Executables for Linux](http://www.muppetlabs.com/~breadbox/software/tiny/teensy.html)

2005년도에 올라온 벌써 10년도 넘은 글. gcc 컴파일 결과 나오는 ELF 바이너리의 크기가 과도하게 크다고 느낀 저자가 한계까지 바이너리의 크기를 줄여가는 과정을 담은 글이다.

---

너무나 비대해진 소프트웨어를 관리하는 데에 지친 프로그래머라면 이 글을 주목하길 바란다.

이 글은 간단한 프로그램에서 추가적인 바이트를 최대한 덜어내는 방법을 담고있다. (좀 더 실용적인 목적으로 이 글을 읽고 싶다면 ELF 파일의 구조와 리눅스 OS를 이해하는 용도로 사용해도 된다. 하지만 그 과정에서 덤으로 초소형 ELF 바이너리를 만드는 방법도 알 수 있기를 바란다.)

이 글에 쓰인 정보와 예제들은 대부분 Intel-386 아키텍쳐에서 돌아가는 특정한 ELF 바이너리를 기준으로 작성되었다. 아마 어느 정도는 다른 플랫폼의 ELF에도 적용이 될거라고 생각하지만, 확신할 수는 없다.

또, 만약 어셈블리 언어에 익숙하지 않은 독자라면 이 글을 읽는 데에 어려움을 느낄 수 있으니 주의를 바란다. (이 글에 나오는 어셈블리 코드들은 [Nasm](http://www.nasm.us/)을 이용하여 작성되었다.)

---

자, 우선 프로그램이 하나 필요하다. 어떤 프로그램이던 상관 없지만, 간단할 수록 좋다. 왜냐면 우리는 그 프로그램을 최대한 작게 만드는 데에 관심이 있으니까.

우리가 만들 프로그램은 아주 간단하다. 아무것도 하지않고, OS에 숫자 하나를 리턴하는 프로그램이다. 이미 0과 1을 리턴하는 프로그램은 존재하니까(`true`, `false`), 우리는 42를 리턴하도록 하자.

첫번째 버전은 이렇게 만들었다.

```c
/* tiny.c */
int main(void) { return 42; }
```

이 프로그램을 아래와 같이 컴파일하자.

```sh
$ gcc -Wall tiny.c
$ ./a.out ; echo $?
42
```

잘 동작한다. 이제 이 프로그램의 크기를 살펴보면, 내 컴퓨터에서는 아래와 같은 결과가 나온다.

```sh
$ wc -c a.out
   3998 a.out
```

(아마 직접 해보면 약간 다른 값이 나올 것이다.) 제법 작은 프로그램이긴 한데, 그럼에도 불구하고 너무 크다는 생각이 든다.

크기를 줄이는 첫 단계는 심볼을 모두 제거하는 것이다.

```sh
$ gcc -Wall -s tiny.c
$ ./a.out ; echo $?
42
$ wc -c a.out
   2632 a.out
```

확실하게 크기가 줄어들었다. 다음에는, 최적화를 해보면 어떨까?

```sh
$ gcc -Wall -s -O3 tiny.c
$ wc -c a.out
   2616 a.out
```

크기가 줄어들긴했지만, 큰 효과는 없다. 사실 아무것도 하지 않는 프로그램이니까 최적화할 것도 없는게 정상이다.

겨우 한줄짜리 C 프로그램을 더 줄일 수 있는 방법은 없을 것 같다. 그러므로 이제는 C를 포기하고 어셈블리를 직접 사용해보자. 어셈블리를 직접 사용하면 C 프로그램이 자동으로 추가하는 오버헤드(overhead)를 없앨 수 있을 것이다.

두번째 버전은 아래와 같다. main()에서 42를 리턴하는 단순한 코드다. 어셈블리에서는 accumulator 레지스터인 eax에 42를 넣고 리턴하면 된다.

```
; tiny.asm
BITS 32
GLOBAL main
SECTION .text
main:
              mov     eax, 42
              ret
```

이제 nasm을 이용해서 아래와 같이 빌드하고 테스트한다.

```sh
$ nasm -f elf tiny.asm
$ gcc -Wall -s tiny.o
$ ./a.out ; echo $?
42
```

(어셈블리어가 이렇게 쉽습니다 여러분!) 이제 크기를 살펴보면,

```sh
$ wc -c a.out
   2604 a.out
```

아무래도 겨우 12 바이트만큼을 덜어낸 모양이다.

문제는 우리가 main() 인터페이스를 사용함으로 인해서 큰 오버헤드를 발생시키고 있다는 점에 있다. 링커(linker)가 main()을 호출하는 OS로의 인터페이스를 삽입하는 것이다. 이걸 없애려면 어떻게 해야할까?

링커가 디폴트로 사용하는 엔트리 포인트(entry point) 심볼은  `_start`다. gcc를 사용하여 링크를 할때는 gcc가 자동으로 `_start` 루틴을 추가하고, argc와 argv를 설정하고, 그 외에 다른 것들을 처리한 뒤에 main()을 호출한다.

이러한 과정을 제거하기 위해서 직접 `_start` 루틴을 만들어보자.

```
; tiny.asm
BITS 32
GLOBAL _start
SECTION .text
_start:
              mov     eax, 42
              ret
```

과연 gcc가 의도한 대로 동작해줄까?

```sh
$ nasm -f elf tiny.asm
$ gcc -Wall -s tiny.o
tiny.o(.text+0x0): multiple definition of '_start'
/usr/lib/crt1.o(.text+0x0): first defined here
/usr/lib/crt1.o(.text+0x36): undefined reference to 'main'
```

잘 안 된다. 사실 우리가 원하는 것을 하려면 추가해줘야 하는 것이다.

gcc에는 `-nostartfiles`라는 옵션이 있다. gcc 설명 페이지에 따르면, 이 옵션을 추가하면 링크시에 스탠다드 시스템을 사용하지 않는다고 한다.

```
-nostartfiles
Do not use the standard system startup files when linking. The standard libraries are used normally.
```

아하! 그럼 이 옵션을 추가해보자.

```sh
$ nasm -f elf tiny.asm
$ gcc -Wall -s -nostartfiles tiny.o
$ ./a.out ; echo $?
Segmentation fault
139
```

gcc에서 문제는 발생하지 않았지만, 프로그램은 제대로 동작하지 않는다. 무엇이 문제일까?

문제가 발생한 부분은 `_start`를 C 함수처럼 생각해서 값을 리턴하려고 했다는 점에 있다. `_start`는 실제로는 함수가 아니고 단순히 링커가 프로그램의 엔트리 포인트를 정하는 데에 사용되는 심볼에 불과하다. 따라서 단순히 프로그램이 실행될 때에 처음 실행되는 부분이다. 프로그램 시작 직후의 메모리를 살펴보면, 스택(stack)의 끝에 있는 것은 숫자 1로, 주소에 해당하지 않는다(따라서 해당 주소로 리턴하려고하면 에러가 발생한다.). 이는 실제로는 argc값이며, 그 이후에 argv 배열과 끝을 알리는 NULL, 그 이후에 envp의 값들이 순서대로 들어있다. 스택에 리턴 주소는 존재하지 않는다.

그러면 `_start`는 어떻게 종료를 할까? 바로 exit() 함수를 호출한다! 당연히 그러라고 있는 함수니까.

사실은 거짓말이다. 정확히는 \_exit() 함수를 호출한다. exit() 함수는 프로세스 대신 뒷정리를 하는 부분이 포함되어있는데, 이 프로그램은 그러한 부분이 필요하지 않다. 왜냐하면 우리는 라이브러리 startup 코드를 실행하지 않았으니까. 따라서 라이브러리 shutdown 코드를 실행할 필요가 없고, 바로 os가 프로세스를 shutdown하도록 하면 된다.

자, 다시 프로그램을 고쳐보자. \_exit()는 정수 아규먼트(argument)하나를 필요로 한다. 따라서 숫자 하나를 스택에 푸시하고 함수를 호출하자.

```
; tiny.asm
BITS 32
EXTERN _exit
GLOBAL _start
SECTION .text
_start:
              push    dword 42
              call    _exit
```

이제 다시 빌드하고 테스트해보면,

```sh
$ nasm -f elf tiny.asm
$ gcc -Wall -s -nostartfiles tiny.o
$ ./a.out ; echo $?
42
```

드디어 성공했다! 과연 크기는?

```sh
$ wc -c a.out
   1340 a.out
```

거의 절반 크기로 줄어들었다. 음... gcc에 살펴볼만한 다른 흥미로운 옵션들이 있을까?

사실 문서를 살펴보면 `-nostartfiles` 다음에 바로 흥미로운 옵션이 있다.

```
-nostdlib
Don't use the standard system libraries and startup files when linking. Only the files you specify will be passed to the linker.
```

이 옵션을 사용하면 스탠다드 라이브러리들을 링크하지 않는다고 한다. 시도해볼 가치가 있어보인다.

```sh
$ gcc -Wall -s -nostdlib tiny.o
tiny.o(.text+0x6): undefined reference to '_exit'
```

앗... \_exit()도 라이브러리에 포함된 함수였다.

흠, 근데 프로그램을 종료하기 위해서 꼭 libc의 도움이 필요할까?
분명 아니다. 이식성을 포기하면 굳이 다른 라이브러리와 링크하지 않더라도 프로그램을 끝낼 방법이 존재할 것이다. 이를 위해서 먼저 리눅스에서 시스템 콜을 발생시키는 방법을 알아보자.

---

대부분의 OS들과 마찬가지로, 리눅스는 시스템 콜을 통해서 OS에서 실행되는 프로그램들에게 기본적인 기능을 제공한다. 이러한 기능들에는 파일을 열거나, 파일에 읽고 쓰거나 하는 것이 있다. 물론 프로세스를 끄는 일도 포함된다.

리눅스의 시스템 콜 인터페이스는 하나의 인스트럭션 `int 0x80` 이다. 모든 시스템 콜은 이 인터럽트(interrupt)를 통해서 이루어진다. 시스템 콜을 발생시키기 위해서는 eax 레지스터에 발생시키고자하는 시스템 콜의 번호를 넣고, 다른 레지스터에 아규먼트들을 넣어주어야 한다. 만약 아규먼트가 한 개라면 ebx를, 두개라면 ebx와 ecx를 사용한다. 세 개, 네 개, 다섯 개라면 edx, esi, edi를 각각 사용한다. 시스템 콜의 리턴 값은 eax에 들어간다. 에러가 발생하면 eax는 음수이고, 절댓값이 에러 번호를 의미한다.

시스템 콜의 번호는 `/usr/include/asm/unistd.h` 에 기록되어 있다. 해당 파일을 살펴보면 우리가 원하는 exit 시스템 콜의 번호는 1이다. C의 exit()함수와 마찬가지로 이 시스템 콜은 하나의 아규먼트를 필요로한다. 따라서 ebx 레지스터를 사용하면 된다.

이제 필요한 모든 것을 알았으니 세번째 버전을 만들자. 이제는 외부 함수를 더이상 필요로 하지 않는다.

```
; tiny.asm
BITS 32
GLOBAL _start
SECTION .text
_start:
              mov     eax, 1
              mov     ebx, 42  
              int     0x80
```

빌드해보면,

```sh
$ nasm -f elf tiny.asm
$ gcc -Wall -s -nostdlib tiny.o
$ ./a.out ; echo $?
42
```

잘된다. 크기는?

```sh
$ wc -c a.out
    372 a.out
```

거의 이전 버전의 1/4로 줄어들었다!

음... 더 작게 만들 수 있는 방법은 없을까?

인스트럭션을 더 작게 만들어보는 건 어떨까?

어셈블리 코드를 살펴보면 아래 부분이 있는데,

```
00000000 B801000000        mov        eax, 1
00000005 BB2A000000        mov        ebx, 42
0000000A CD80              int        0x80
```

사실 ebx를 전체 다 초기화화할 이유가 없다. OS는 ebx의 마지막 바이트만 사용하니까 bl만 설정해줘도 충분하다. 이를 통해 5 바이트를 2 바이트로 줄일 수 있다.

또한 eax를 1로 설정하기 위한 방법으로 eax를 xor하여 0으로 만들고 1을 더해주는 방법으로 2 바이트를 더 줄일 수 있다.

```
00000000 31C0              xor        eax, eax
00000002 40                inc        eax
00000003 B32A              mov        bl, 42
00000005 CD80              int        0x80
```

이보다 프로그램의 크기를 더 줄일 수 있는 방법은 없는 것 같다.

추가적으로, 이제 굳이 gcc를 사용해서 링크할 필요가 없다. 우린 gcc의 아무런 추가적 기능도 사용하지 않으니까, 그냥 링커인 `ld`를 사용해서 링크해주면 된다.

```sh
$ nasm -f elf tiny.asm
$ ld -s tiny.o
$ ./a.out ; echo $?
42
$ wc -c a.out
    368 a.out
```

4 바이트가 추가로 줄어들었다.

엥, 5바이트 아니었냐고? ELF의 alignment 조건 때문에 4 바이트의 배수 크기를 맞추기 위해 1 바이트 패딩(padding)이 추가로 삽입되었다.

그래서... 이제 더 이상 줄일 수 있는 방법이 없는 걸까?

흠, 우리가 만든 프로그램의 길이는 7 바이트에 불과한데, ELF 바이너리가 361 바이트나 되는 오버헤드를 정말로 필요로 하는 걸까? 대체 무엇이 그만한 크기를 차지하는 것일까?

파일의 내용물을 `objdump`로 살펴보자.

```sh
$ objdump -x a.out | less
```

이상한 것이 많이 출력될텐데, 섹션 리스트에 주목해보자.

```
Sections:
Idx Name          Size      VMA       LMA       File off  Algn
  0 .text         00000007  08048080  08048080  00000080  2**4
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  1 .comment      0000001c  00000000  00000000  00000087  2**0
                  CONTENTS, READONLY
```

`.text` 섹션의 크기는 7 바이트로 앞서 얘기한 바와 동일하다. 우리가 짠 어셈블리 코드에 한해서는 추가로 건드릴 부분이 없다고 할 수 있겠다.

그런데, `.comment` 섹션은 대체 왜 있는 것일까? 심지어 28 바이트나 크기를 차지한다! 이 섹션에 무슨 내용이 들어있는지는 모르겠지만 우리 프로그램에 필수적일 것이라고는 생각되지 않는다.

`.comment` 섹션은 offset 0x00000087 에서부터 시작되는데, 이 부분을 덤프해서 살펴보면,

```
00000080: 31C0 40B3 2ACD 8000 5468 6520 4E65 7477  1.@.*...The Netw
00000090: 6964 6520 4173 7365 6D62 6C65 7220 302E  ide Assembler 0.
000000A0: 3938 0000 2E73 796D 7461 6200 2E73 7472  98...symtab..str
```

아 이런이런, 설마 Nasm이 우리의 일을 방해하고 있을 것이라고는 생각지도 못했다. Nasm을 버리고 AT&T 문법으로 어셈블리 코드를 재작성해보자...

```
; tiny.s
.globl _start
.text
_start:
              xorl    %eax, %eax
              incl    %eax
              movb    $42, %bl
              int     $0x80
```

...그러고 나서 빌드해보면,

```sh
$ gcc -s -nostdlib tiny.s
$ ./a.out ; echo $?
42
$ wc -c a.out
    368 a.out
```

...똑같다!

사실 내용물에서는 차이가 있다. 다시 `objdump`로 내용을 살펴보면,

```
Sections:
Idx Name          Size      VMA       LMA       File off  Algn
  0 .text         00000007  08048074  08048074  00000074  2**2
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  1 .data         00000000  0804907c  0804907c  0000007c  2**2
                  CONTENTS, ALLOC, LOAD, DATA
  2 .bss          00000000  0804907c  0804907c  0000007c  2**2
                  ALLOC
```

`.comment` 섹션은 사라졌지만 아무 값도 담고있지 않은 쓸모없는 두 섹션이 생겨버렸다. 섹션의 길이가 0인데도 불과하고 오버헤드를 발생시켜서 파일의 크기를 증가시키고 있다.

그럼, 질문. 1) 이 오버헤드들은 대체 무엇이고, 2) 어떻게 없앨 수 있을까?

이를 해결하기 위해서는 ELF 포맷에 대해서 이해할 필요가 있다.

---

Intel-386 아키텍쳐의 ELF 포맷에 대해서 설명하는 고전 문서는 [여기](http://refspecs.linuxbase.org/elf/elf.pdf)서 확인할 수 있다. 혹시 txt 버전이 보고 싶다면 [여기](http://www.muppetlabs.com/~breadbox/software/ELF.txt)를 보아도 좋다. 아주아주 긴 문서이므로, 전부 다 읽기가 귀찮다고 하더라도 이해한다. 기본적으로, 알아야 하는 부분은 다음와 같다.

모든 ELF 파일은 ELF 헤더 구조체(structrue)로 시작한다. 이 구조체는 52 바이트 길이이고, 파일의 내용을 설명하는 기능을 한다.

예를 들어, 첫 16 바이트는 "identifier"라고 하는데, 4 바이트 파일 시그니쳐 (`7F 45 4C 46`)와 32-bit or 64-bit, little-endian or big-endian을 구분하는 1 바이트짜리 플래그 여러 개를 포함한다. ELF 헤더의 다른 부분은 타겟 아키텍쳐에 대한 정보를 포함한다. 즉, ELF 파일이 실행 파일(executable)인지, 오브젝트 파일(object file)인지, 공유 라이브러리(shared-object library)인지 나타내고, 프로그램 헤더 테이블(program header table), 섹션 헤더 테이블(section header table)의 시작 주소도 담고 있다.

이 두 테이블은 파일의 어디에나 존재할 수 있는데, 일반적으로는 전자는 ELF 헤더 바로 뒤에, 후자는 파일의 맨 끝에 존재한다.

섹션 헤더 테이블은 각 컴포넌트들이 파일의 어디에 위치하는가를 알려주는 기능을 하고, 프로그램 헤더 테이블은 각 컴포넌트들이 메모리에 로드될 때에 어디에 위치하는가를 알려주는 기능을 한다. 즉, 섹션 헤더 테이블은 컴파일러와 링커가 사용하고, 프로그램 헤더 테이블은 프로그램 로더가 사용한다. 그러므로 프로그램 헤더 테이블은 오브젝트 파일에는 옵셔널(optional)하고, 그래서 현실에서는 오브젝트 파일에 프로그램 헤더 테이블이 존재하는 경우가 없다. 마찬가지로 섹션 헤더 테이블은 실행 파일에는 옵셔널하다. 그런데? 섹션 헤더 테이블은 거의 **언제나** 존재한다!

자, 이게 첫번째 질문에 대한 답이다. 우리 프로그램에 남아있던 오버헤드는 필요없는 섹션 헤더 테이블이고, 우리 프로그램에 필요하지 않은 몇몇 섹션들도 남아있을 수 있다.

그럼 이제 두번째 질문으로 넘어가서, 대체 이 녀석들을 어떻게 없앨 수 있을까?

안타깝게도, 여기서부터는 우리의 힘으로 직접 만들어나가야 한다. 어떠한 표준 도구들도 섹션 헤더 테이블 없는 실행 파일을 만드는 기능을 제공하지 않는다.

물론 hex editor를 열어서 실행 파일을 바이트 하나하나 고쳐야 한다는 소리는 아니다. 오래된 Nasm은 단순 바이너리 포맷(flat binary format)으로 결과값을 내보낼 수 있어서, 이걸 사용하면 된다. 우리가 해야할 일은 빈 ELF 실행파일을 준비하고, 내용물을 우리 프로그램으로 채우면 된다. 우리 프로그램 말고 다른 쓸모없는 것들은 다 빼고 말이다.

ELF 스펙과 `/usr/include/linux/elf.h`, 그리고 다른 ELF 실행 파일을 직접 분석해보면 빈 ELF 실행 파일이 어떻게 생겼는지 알 수 있다. 굳이 찾아보기 귀찮다면, 여기 내가 준비한 것을 봐도 된다.

```
  BITS 32
  
                org     0x08048000
  
  ehdr:                                                 ; Elf32_Ehdr
                db      0x7F, "ELF", 1, 1, 1, 0         ;   e_ident
        times 8 db      0
                dw      2                               ;   e_type
                dw      3                               ;   e_machine
                dd      1                               ;   e_version
                dd      _start                          ;   e_entry
                dd      phdr - $$                       ;   e_phoff
                dd      0                               ;   e_shoff
                dd      0                               ;   e_flags
                dw      ehdrsize                        ;   e_ehsize
                dw      phdrsize                        ;   e_phentsize
                dw      1                               ;   e_phnum
                dw      0                               ;   e_shentsize
                dw      0                               ;   e_shnum
                dw      0                               ;   e_shstrndx
  
  ehdrsize      equ     $ - ehdr
  
  phdr:                                                 ; Elf32_Phdr
                dd      1                               ;   p_type
                dd      0                               ;   p_offset
                dd      $$                              ;   p_vaddr
                dd      $$                              ;   p_paddr
                dd      filesize                        ;   p_filesz
                dd      filesize                        ;   p_memsz
                dd      5                               ;   p_flags
                dd      0x1000                          ;   p_align
  
  phdrsize      equ     $ - phdr
  
  _start:
  
  ; your program here
  
  filesize      equ     $ - $$
```

이 파일이 Intel-386 실행 파일이라는 것을 알려주는 ELF 헤더가 있고, 섹션 헤더 테이블은 존재하지 않고, 프로그램 헤더 테이블만 존재한다.

코드는 프로그램 섹션 테이블 직후에 위치한 `_start`에서 시작한다. .data도, .bss도 commentary도 없이 딱 필요한 것만 존재한다.

이제 여기에 우리 프로그램을 추가하자.

```
  ; tiny.asm
                org     0x08048000
  
  ;
  ; (위와 같음)
  ;


  _start:
                mov     bl, 42
                xor     eax, eax
                inc     eax
                int     0x80
  
  filesize      equ     $ - $$
```

빌드해보면,

```sh
  $ nasm -f bin -o a.out tiny.asm
  $ chmod +x a.out
  $ ./a.out ; echo $?
  42
```

진짜 밑바닥에서부터 실행 파일을 만드는 데에 성공했다! 이제 크기를 살펴보자.

```
  $ wc -c a.out
       91 a.out
```

**91 바이트**. 저번보다 1/4 이하로 줄어들었고, 처음보다 1/40 이하로 줄어들었다!

이제 더 할 수 있는 것이 있을까? 우리는 이 프로그램에 존재하는 바이트 하나하나를 다 설명할 수 있게 되었다. 그러므로 더 이상 할 수 있는 것은 없다.

<br />

*...정말로?*

---

역자:

이하의 내용은 테이블 주소를 겹친다거나 하는 방식으로 파일 크기를 줄여나가고, 최종적으로 45 바이트까지 크기를 줄이는 데에 성공합니다. 사실상 곡예에 가까운 방식이고 일반화할 수 없는 테크닉이므로 따로 번역하지 않았습니다.

글쓴이가 마지막까지 어떻게 크기를 줄여나갔는지 알고싶으신분은 [원문](http://www.muppetlabs.com/~breadbox/software/tiny/teensy.html)을 읽어주세요 :)

### Reference

> http://www.muppetlabs.com/~breadbox/software/tiny/teensy.html