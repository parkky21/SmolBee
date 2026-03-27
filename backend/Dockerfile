FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Install uv for package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set work directory
WORKDIR /app/backend

# Copy backend dependencies
COPY pyproject.toml uv.lock ./

# Install backend dependencies
RUN uv sync --frozen --no-cache

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 8000

# Start backend via uv run (as in start.sh)
CMD ["uv", "run", "server.py"]
