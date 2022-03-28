fmt:
	deno fmt

lint: fmt
	deno lint

test: fmt 
	deno test -A --unstable

.PHONY: fmt lint test
