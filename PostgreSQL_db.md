# Connecting to pgAdmin and Setting Up a New Server

Once Docker is up and running, you can access pgAdmin by navigating to:
[localhost:5050](http://localhost:5050)

## Log In to pgAdmin

Log in using the credentials specified in your Docker environment:

- **Email**: Use the `PGADMIN_DEFAULT_EMAIL` defined in your `.env` file
- **Password**: Use the `PGADMIN_DEFAULT_PASSWORD` from the same configurations.

## Add a New Server in pgAdmin

To manage your PostgreSQL database, you'll need to set up a new server connection in pgAdmin:

1. **Name Your Server**:
   - **Name**: `TRANSCENDENCE` (or any name that helps you identify the server)

2. **Configure Connection Settings**:
   - **Host name/address**: Enter `db` as the host. Docker's internal DNS resolver automatically resolves this to the appropriate container IP address.
   - **Port**: Use the default PostgreSQL port `5432`.

3. **Authentication Details**:
   - **Username**: Specify the `POSTGRES_USER` from your `.env` file.
   - **Password**: Use the `POSTGRES_PASSWORD` also defined in the `.env` file.

By following these steps, you will be able to connect to your PostgreSQL database through pgAdmin and start managing your database effectively.
