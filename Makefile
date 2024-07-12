.PHONY: up
up:
	docker-compose up --build --remove-orphans

.PHONY: down
down:
	docker-compose down

.PHONY: clean
clean:
	docker stop $$(docker ps -qa) 2> /dev/null || exit 0
	docker system prune -f
	docker system prune -f -a
#	docker rmi -f $$(docker images -qa) 2> /dev/null || exit 0
