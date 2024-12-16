# Smart Agriculture Monitoring System - Backend

This is the backend service for the Smart Agriculture Monitoring System, built with Spring Boot.

## Prerequisites

- JDK 11 or later
- Maven 3.6.3 or later
- MySQL 5.7 or later
- IntelliJ IDEA (recommended)

## Setup Instructions

1. Clone the repository
2. Open the project in IntelliJ IDEA
   - File -> Open -> Select the `backend` folder
   - Wait for Maven to download dependencies

3. Configure Database
   - Create a MySQL database named `20221060219`
   - The application is configured to use:
     - Username: 20221060219
     - Password: 20221060219
     - URL: jdbc:mysql://localhost:3306/20221060219

4. Run the Application
   - Run `SmartAgriApplication.java`
   - The server will start on port 8080

## API Documentation

### Greenhouse Monitoring

- GET `/api/monitoring/greenhouses` - List all greenhouses
- GET `/api/monitoring/greenhouses/{boxNo}/sensors` - Get sensor data for a greenhouse
- GET `/api/monitoring/greenhouses/{boxNo}/camera` - Get camera feed for a greenhouse

### External API Integration

The system integrates with:
- Fbox360 API for sensor data
- YS7 API for camera feeds

Configuration for these services is in `application.yml`
