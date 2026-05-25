FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Python packages if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies first for better caching
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source files
COPY backend ./backend

# Expose port
EXPOSE 8080

# Use the PORT environment variable from Railway if available
CMD ["/bin/sh", "-lc", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
