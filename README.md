# Backend (TypeScript - Express - PostgreSQL - Redis)

Follow API Documentation [here](https://documenter.getpostman.com/view/2877358/2sAYQfEVKd)
You can fetch, insert, update and delete data using the endpoints that are provided there.

## Getting Started

To get started, follow these steps:

1. Clone this repository to your local machine
2. Run `docker-compose up --build` to start all the services and install the required dependencies
3. Run below command or you can use any client database app to create a new database and user

```
docker exec -it postgres psql -U postgres -c "CREATE DATABASE db_test;"
docker exec -it postgres psql -U postgres -c "CREATE USER user_test SUPERUSER PASSWORD '123456789';"
docker exec -it postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE db_test TO user_test;"
```

4. Create `.env` file, copy the variables from `.env.example` and edit the values accordingly
5. To restart run `docker-compose down` then `docker-compose up --build`
6. It will run on localhost:4000
