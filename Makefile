.PHONY: up
up:
	docker-compose up --build --detach --remove-orphans

.PHONY: down
down:
	docker-compose down

.PHONY: clean
clean: rmvol
	docker stop $$(docker ps -qa) 2> /dev/null || exit 0
	docker rm $$(docker ps -qa) 2> /dev/null || exit 0
	docker rmi -f $$(docker images -qa) 2> /dev/null || exit 0
	docker network rm $$(docker network ls -q) 2> /dev/null || exit 0
	docker builder prune -

rmvol: down
	docker volume rm $$(docker volume ls -q) 2> /dev/null || exit 0
