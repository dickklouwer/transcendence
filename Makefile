.PHONY: up
up:
	docker-compose up --build --remove-orphans

.PHONY: down
down:
	docker-compose down

.PHONY: clean
clean:
	docker stop $$(docker ps -qa) 2> /dev/null || exit 0
	docker rm $$(docker ps -qa) 2> /dev/null || exit 0
	docker rmi -f $$(docker images -qa) 2> /dev/null || exit 0
	docker network rm $$(docker network ls -q) 2> /dev/null || exit 0
	docker builder prune -af