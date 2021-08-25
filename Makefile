CARGO_BUILD := cargo build --features "use-vcpkg"
TARGET := deno_sdl2

RUST_SOURCE := src/main.rs

$(TARGET): $(RUST_SOURCE)
	$(CARGO_BUILD) \
	&& cp target/debug/$(TARGET) .

fmt:
	deno fmt --ignore=target/

lint: fmt
	deno lint --ignore=target/

test: fmt lint
	deno test tests/

clean:
	rm -rf deno_sdl2

.PHONY: fmt lint test

