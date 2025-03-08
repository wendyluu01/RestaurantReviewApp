# APAN All-in-One Docker Stack

This project is an implementation of a stack based on Docker (docker-compose) using MongoDB, PostgreSQL, Express JS (Node.js), Flask, Jupyter, and more.

## Features

- **MongoDB**: NoSQL database
- **PostgreSQL**: Relational database
- **Express JS (Node.js)**: Web framework for Node.js
- **Flask**: Micro web framework for Python
- **Jupyter**: Interactive computing environment
- **PgAdmin**: Web-based PostgreSQL administration tool
- **Adminer**: Database management tool
- **Streamlit**: Web app framework for Machine Learning and Data Science
- **Ollama**: AI model hosting and management
- **Ollama WebUI**: Web interface for managing AI models

## Building & Running

```sh
# Clone the repository
git clone https://github.com/hyper07/docker-mongo-postgres.git

# Move to the project directory
cd docker-mongo-postgres/

# Build and run the containers
docker-compose up -d

# Stop and remove the containers
docker-compose down
```

## Accessing Services

### MongoDB

- **Web Interface (Mongo Express)**: [http://localhost:8082](http://localhost:8082)
- **Connection String**:
  ```python
  from pymongo import MongoClient
  client = MongoClient('mongodb://admin:PassW0rd@apan-mongo:27017/')
  ```

### PostgreSQL

- **Web Interface (PgAdmin)**: [http://localhost:5080](http://localhost:5080)
- **Connection Details**:
  ```
  Hostname: apan-postgres
  Port: 5432
  Database: db
  Username: admin
  Password: PassW0rd
  ```

### Jupyter

- **Web Interface**: [http://localhost:8899](http://localhost:8899)

### Adminer

- **Web Interface**: [http://localhost:9080](http://localhost:9080)

### Flask App

- **Web Interface**: [http://localhost:5010](http://localhost:5010)

### Streamlit App

- **Web Interface**: [http://localhost:18501](http://localhost:18501)

### Ollama

- **API Endpoint**: [http://localhost:37869](http://localhost:37869)

### Ollama WebUI

- **Web Interface**: [http://localhost:38080](http://localhost:38080)

## Additional Information

- **Docker Network**: All services are connected via a custom Docker network `apan-net`.
- **Volumes**: Persistent data storage is managed using Docker volumes.

For more detailed information on each service, please refer to the respective documentation.
