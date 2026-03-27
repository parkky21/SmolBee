FROM node:20-slim

# Set work directory
WORKDIR /app/frontend

# Copy frontend dependencies
COPY package.json package-lock.json ./

# Install frontend dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Expose frontend port
EXPOSE 5173

# Start frontend (as in start.sh)
CMD ["npm", "run", "dev", "--", "--host"]
