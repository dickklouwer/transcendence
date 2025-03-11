.PHONY: up
up:
	cp ~/Desktop/.env .env
	cd apps/nestjs
	npm i
	cd ../react
	npm i
	cd ../../packages/db
	npm i
	npm run dev
	cd ../../
	npm i
	HOST_NAME="${shell hostname}" docker-compose up
.PHONY: build
build:
	cp ~/Desktop/.env .env
	cd apps/nestjs
	npm i
	cd ../react
	npm i
	cd ../../packages/db
	npm i
	npm run dev
	cd ../../
	npm i
	HOST_NAME="${shell hostname}" docker-compose up --build --remove-orphans

.PHONY: down
down:
	docker-compose down

.PHONY: clean
clean:
	docker stop $$(docker ps -qa) 2> /dev/null || exit 0
	docker system prune -f
	docker system prune -f -a
#	docker rmi -f $$(docker images -qa) 2> /dev/null || exit 0
