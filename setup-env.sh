#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Please backup your current .env file before proceeding."
    exit 1
fi

# Copy .env.example to .env
cp .env.example .env

echo "✅ Environment file created successfully!"
echo "📝 Please edit the .env file with your actual values."
echo "🔒 Remember to never commit the .env file to version control." 