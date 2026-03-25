# MongoDB Setup Guide

Your backend needs MongoDB to run. Choose one of these options:

## ✅ Option 1: Docker (Easiest - Recommended)

### Prerequisites
- Docker Desktop installed

### Setup
```bash
# From project root directory
docker-compose up -d

# Verify MongoDB is running
docker ps | grep mongodb

# Stop MongoDB when done
docker-compose down
```

MongoDB will be available at: `mongodb://127.0.0.1:27017/ai-interview`

---

## ✅ Option 2: MongoDB Atlas (Cloud)

### Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview
   ```

---

## ✅ Option 3: Local MongoDB (Manual Installation)

### macOS
```bash
# Install if not already installed
brew install mongodb-community

# Start MongoDB
mongod --dbpath /opt/homebrew/var/mongodb
```

### Linux
```bash
# Install
sudo apt-get install mongodb

# Start
sudo systemctl start mongod
```

---

## Testing Connection

Once MongoDB is running, start your backend:
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected: 127.0.0.1
📊 Database: ai-interview
Backend server running on http://localhost:5001
```

---

## Troubleshooting

If you still see `connect ECONNREFUSED`:
- Make sure MongoDB is actually running
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017: `netstat -an | grep 27017`
