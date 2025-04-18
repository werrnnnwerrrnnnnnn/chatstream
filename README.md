#  Ruby on Rails Boilerplate with Docker

By : **Tatiya Seehatrakul**

---

## 📍 Pre-requisites

- [Docker](https://www.docker.com/)
- [Ruby](https://www.ruby-lang.org/en/)
- [Rails](https://rubyonrails.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

## 📍 Database Setup

To start the PostgreSQL database server:

1. Navigate to the `db` directory:

   ```bash
   cd db
   ```

2. Run the database container:

   ```bash
    docker compose down --remove-orphans
    docker compose up --build -d
    docker compose up -d
   ```

    <div style="background-color: #fff9c4; padding: 10px; border-radius: 8px; border-left: 6px solid #fbc02d;">
    <strong>Note:</strong> Local database server will be available at: <strong>http://localhost:8088</strong>
    </div>   
    <br> 

3. Login to PgAdmin Server
    - PGADMIN_DEFAULT_EMAIL: **admin@admin.<area>com**
    - PGADMIN_DEFAULT_PASSWORD: **admin123**
        <p align="left">
            <img src="/app/figures/pgadmin-login.png" width="800" style="border-radius: 10px;">
        </p>
        <br> 

4. Connect to database
    - Register a new server: Servers &rarr; Register &rarr; Server
        <p align="left">
            <img src="app/figures/register-server-1.png" width="800" style="border-radius: 10px;">
        </p>
        <br> 

    - Set configuration
        - host: **app_db**
        - database: **app_development**
        - POSTGRES_USER=**admin**
        - POSTGRES_PASSWORD=**password**
        <p align="left">
            <img src="app/figures/server-config-1.png" width="380" style="border-radius: 10px; display: inline-block; margin-right: 2%;">
            <img src="app/figures/server-config-1.png" width="380" style="border-radius: 10px; display: inline-block;">
        </p>

    - Successfully connected to database
        <p align="left">
            <img src="app/figures/db-connected.png" width="800" style="border-radius: 10px;">
        </p>      

---

## 📍 Running the Rails Application

1. Navigate to the Rails app directory:

   ```bash
   cd app
   ```

2. On the first run, build the app image:

   ```bash
   docker compose build
   ```

3. Start the Rails container:

   ```bash
   docker compose up
   docker compose up -d
   ```
    <div style="background-color: #fff9c4; padding: 10px; border-radius: 8px; border-left: 6px solid #fbc02d;">
    <strong>Note:</strong> Local Rails server will be accessible at: <strong>http://localhost:3003</strong>
    </div>
    <br>   
4. All databases will be automatically generated when Rails application is created
    <p align="left">
        <img src="app/figures/db-created-rails.png" width="800" style="border-radius: 10px;">
    </p>   

---

## 📍 Accessing the Rails Container

To run Rails commands (e.g., generate models, migrate DB):

1. Enter the running container:

   ```bash
   docker exec -it students-app bash
   ```

2. To generate a new scaffold (example):

   ```bash
   ./bin/rails generate scaffold course name:string credits:integer
   ```

3. To apply database migrations:

   ```bash
   bundle exec rake db:migrate
   ```

4. Exit the container:

   ```bash
   exit
   ```

---

## 📍 Stopping All Containers

From the directory where your `docker-compose.yml` is located, run:

```bash
docker compose down --remove-orphans
```

This will shut down all containers and remove unused ones.

---