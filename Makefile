.PHONY: bot api

TESTCMD = go test -run ^TestDatabaseInit$$ books/src -v -race

bot:
	cd bot && bun run .
api:
	cd api && go run -tags "icu" .
tests: 
	cd api && $(TESTCMD)
