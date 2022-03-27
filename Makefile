fmt:
	deno fmt --ignore=target/

lint: fmt
	deno lint --ignore=target/

test: fmt 
	deno run -A --unstable tests/mp3_flag.ts

.PHONY: fmt lint test
