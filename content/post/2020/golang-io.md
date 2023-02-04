---
date: "2020-02-06T00:00:00Z"
description: Go 프로그래밍 I/O 미세 팁
categories:
- Go
title: Go 프로그래밍 I/O 미세 팁
summary: " "
---

__TL;DR__

> `fmt.Scanf` 보다는 `fmt.Scan` 보다는 `fmt.Fscan` <br>
`fmt.Fprintf`는 `fmt.Printf`보다 느릴 수 있다

Go의 문법은 C와 많이 닮아있기 때문에,
C 프로그래밍을 하다가 Go를 쓰다보면 `fmt.Printf`와 `fmt.Scanf`를 보고
아무 생각 없이 C-like한 I/O 문법으로 코드를 작성하고는 합니다.

Go의 I/O는 분명 C와 닮아있지만, 아무 생각없이 C처럼 쓰다가는
원하는 결과가 나오지 않거나 성능이 떨어지는 경우가 종종 있습니다.
이 글에서는 해당 내용을 정리해보려고 합니다.

## Input

#### Go의 `Scanf` 계열은 newline(`\n`)을 whitespace로 취급하지 않는다

> The handling of spaces and newlines differs from that of C's scanf family: in C, newlines are treated as any other space, and it is never an error when a run of spaces in the format string finds no spaces to consume in the input. [^1]

newline을 포함한 여타 whitespace 문자를 알아서 무시해주는 C의 scanf와 다르게 
Go의 scanf는 newline 문자를 무시하지 않습니다.
따라서 `fmt.Scanf`를 사용하여 여러 줄을 읽어들인다면,
예상과 다른 동작을 할 가능성이 높습니다.

```go
package main

import "fmt"

func main() {
	var a, b int
	/* [Input]
	1
	2
	*/
	fmt.Scanf("%d%d", &a, &b)
	fmt.Printf("%d %d\n", a, b)
}
```

위와 같은 코드를 C에서 작성했다면, 아래와 같은 결과를 기대하겠지만,

```
[Expected Output]
1 2
```

실제로 나오는 결과는 다음과 같습니다.

```
[Real Output]
1 0
```

`\n`을 무시하지 않고 읽어버려서 b에 값이 들어가지 않은 것입니다.

#### 여러 줄을 읽을 때는 `fmt.Scan`을 쓰자

```go
package main

import "fmt"

func main() {
	var a, b int
	/* [Input]
	1
	2
	*/
	fmt.Scan(&a, &b) 
	fmt.Printf("%d %d\n", a, b)

	/* [Output]
	1
	2
	*/
}
```

`fmt.Scanf` 대신 `fmt.Scan`을 쓰면,
파라미터의 타입에 맞추어 `\n`을 포함한 whitespace 문자를 무시하고 파싱을 해줍니다.

#### 대량의 입력을 받고자 한다면 `fmt.Fscan`을 쓰자

한편, 많은 줄을 읽어들여야 하는 경우라면 `fmt.Scan`은 버퍼링을 하지 않아 느립니다.

이 경우, `bufio` 패키지와 `fmt.Fscan`을 활용해주면 됩니다.

```go
r := bufio.NewReader(os.Stdin)
fmt.Fscan(r, &v)
```

`fmt.Fscan`은 위와 같은 형태로 사용합니다.
`NewReader`의 파라미터로 `os.Stdin`을 넣어주어 파일 대신 stdin에서 입력을 읽어오도록 하였습니다.

```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"time"
)

func main() {
    a := make([]int, 100000, 100000)
    /* [Input]
	1
    1
    ...
    1
	*/
	start := time.Now()
	for i := 0; i < 100000; i = i + 1 {
		fmt.Scan(&a[i])
	}
	fmt.Printf("fmt.Scan: %v\n", time.Since(start))

	start = time.Now()
	r := bufio.NewReader(os.Stdin)
	for i := 0; i < 100000; i = i + 1 {
		fmt.Fscan(r, &a[i])
	}
	fmt.Printf("fmt.Fscan: %v\n", time.Since(start))
}
```

```
fmt.Scan: 502.6522ms
fmt.Fscan: 28.924ms
```

10만 줄을 읽을 때, 버퍼링 하지 않은 `fmt.Scan`과 버퍼링한
`fmt.Fscan` 사이에 15배가 넘는 속도 차이를 확인할 수 있습니다.

#### (+) 한 줄 읽기

스페이스를 구분자로 사용하지 않는 한 줄 읽기는 아래와 같이 할 수 있습니다.

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	r := bufio.NewReader(os.Stdin)
	s, _ := r.ReadString('\n')
	fmt.Print(s)
}
```

## Output

그렇다면 출력도 입력과 같이 버퍼링을 이용하면 빠를까요?

답은, _언제나 그렇지는 않다_ 입니다.

출력도 입력과 마찬가지로 `bufio`를 활용하여 출력을 버퍼링할 수 있습니다. (`fmt.Printf` 대신 `fmt.Fprintf`)
그러나 newline(`\n`)이 많을 경우 flush 횟수가 많아져 오히려 `fmt.Fprintf`가 더 느릴 수 있습니다.

```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"time"
)

func main() {

	s1 := time.Now()
	for i := 0; i < 100000; i = i + 1 {
		fmt.Printf("1")
	}
	t1 := time.Since(s1)

	w := bufio.NewWriter(os.Stdout)
	s2 := time.Now()
	for i := 0; i < 100000; i = i + 1 {
		fmt.Fprintf(w, "1")
	}
	t2 := time.Since(s2)

	s3 := time.Now()
	for i := 0; i < 100000; i = i + 1 {
		fmt.Println("1")
	}
	t3 := time.Since(s3)

	ww := bufio.NewWriter(os.Stdout)
	s4 := time.Now()
	for i := 0; i < 100000; i = i + 1 {
		fmt.Fprintln(ww, "1")
	}
	t4 := time.Since(s4)

	fmt.Printf("fmt.Printf: %v\n", t1)
	fmt.Printf("fmt.Fprintf: %v\n", t2)
	fmt.Printf("fmt.Println: %v\n", t3)
	fmt.Printf("fmt.Fprintln: %v\n", t4)
}
```

10만개의 문자 (\n 제외)를 출력하는 코드입니다.

1. `fmt.Printf` 사용, 한 줄
2. `fmt.Fprintf` 사용, 한 줄
3. `fmt.Printf` 사용, 10만 줄
4. `fmt.Fprintf` 사용, 10만 줄

1, 2번은 한 줄에 10만 자를 모두 출력한 경우이고,
3, 4번은 한 글자를 출력할 때마다 `\n`을 넣어주었습니다.

```
1. fmt.Printf: 2.1709647s
2. fmt.Fprintf: 33.0269ms
3. fmt.Println: 3.0822985s
4. fmt.Fprintln: 14.1889089s
```

한 줄에 모두 출력한 경우는 버퍼링을 활용한 `fmt.Fprintf`가 월등히 빠른 것을 확인할 수 있지만,
줄 수가 늘어나는 경우는 오히려 `fmt.Printf`가 더 빠른 것을 확인할 수 있습니다.

## 결론

Go으로 다량의 파일 I/O를 한 번에 처리하는 경우가 아주 흔하지는 않겠습니다만,
간단하면서도 성능에 큰 영향을 주는 부분이니 머리 한 구석에 기억해두면 좋을 것으로 생각됩니다.

일상생활에서 알고리즘 문제를 풀 때에도 (Go로 문제를 푸는 사람이 얼마나 되겠습니까만은...) 생각해볼 수 있는 부분입니다.

[^1]: https://golang.org/pkg/fmt/#hdr-Scanning