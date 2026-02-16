.PHONY: build run dev start stop setup test lint clean web-build go-build secret \
	electron-setup electron-dev electron-build go-build-platforms \
	electron-package-mac electron-package-win electron-package-linux

build: web-build go-build

web-build:
	cd web && npm ci && npm run build

go-build:
	go build -o bin/mcplexer ./cmd/mcplexer

run: build
	-./bin/mcplexer daemon stop 2>/dev/null
	./bin/mcplexer daemon start

dev:
	go run ./cmd/mcplexer serve --mode=http --addr=:3333

start:
	./bin/mcplexer daemon start

stop:
	./bin/mcplexer daemon stop

setup:
	./bin/mcplexer setup

test:
	go test ./...

lint:
	golangci-lint run

secret:
	@if [ -z "$(SCOPE)" ] || [ -z "$(KEY)" ] || [ -z "$(VALUE)" ]; then \
		echo "Usage: make secret SCOPE=<scope-id> KEY=<key> VALUE=<value>"; \
		exit 1; \
	fi
	./bin/mcplexer secret put $(SCOPE) $(KEY) $(VALUE)

clean:
	rm -rf bin/ web/dist/

# Electron targets
electron-setup:
	cd electron && npm ci

electron-dev: electron-setup
	cd electron && npm run dev

electron-build: web-build go-build electron-setup
	cd electron && npm run build
	mkdir -p electron/resources/bin
	cp bin/mcplexer electron/resources/bin/
	cd electron && npm run package

# Cross-compile Go for all platforms
go-build-platforms:
	GOOS=darwin GOARCH=arm64 go build -o bin/darwin/arm64/mcplexer ./cmd/mcplexer
	GOOS=darwin GOARCH=amd64 go build -o bin/darwin/amd64/mcplexer ./cmd/mcplexer
	GOOS=linux GOARCH=amd64 go build -o bin/linux/amd64/mcplexer ./cmd/mcplexer
	GOOS=windows GOARCH=amd64 go build -o bin/windows/amd64/mcplexer.exe ./cmd/mcplexer

# Platform-specific electron packaging
electron-package-mac: web-build electron-setup
	GOOS=darwin GOARCH=arm64 go build -o electron/resources/bin/mcplexer ./cmd/mcplexer
	cd electron && npm run build && npm run package:mac

electron-package-win: web-build electron-setup
	GOOS=windows GOARCH=amd64 go build -o electron/resources/bin/mcplexer.exe ./cmd/mcplexer
	cd electron && npm run build && npm run package:win

electron-package-linux: web-build electron-setup
	GOOS=linux GOARCH=amd64 go build -o electron/resources/bin/mcplexer ./cmd/mcplexer
	cd electron && npm run build && npm run package:linux
