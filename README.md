#  Ruby on Rails Boilerplate with Docker

By : **Tatiya Seehatrakul**

---

## 📍 Prerequisites

- [Docker](https://www.docker.com/)

---

## 📍 Database Setup

To start the PostgreSQL database server:

1. Navigate to the `db` directory:

   ```bash
   cd db
   ```

2. Run the database container:

   ```bash
   docker compose up -d
   ```

The database server will be available at:  
**http://localhost:5432**

---

## 📍 Running the Rails Application

1. Navigate to the Rails app directory:

   ```bash
   cd students
   ```

2. On the first run, build the app image:

   ```bash
   docker compose build
   ```

3. Start the Rails container:

   ```bash
   docker compose up -d
   ```

The Rails app will be accessible at:  
**http://localhost:3000**

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