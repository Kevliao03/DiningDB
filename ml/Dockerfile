# Base image
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Expose the port for the Flask API
EXPOSE 5000

# Command to run the API
CMD ["python", "ml_api.py"]
