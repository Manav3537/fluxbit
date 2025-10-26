#!/bin/bash

echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT

wait