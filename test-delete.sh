#!/bin/bash

# Test script for project deletion transaction
# Verifies that deleting a project also deletes associated daily reports

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "\n${CYAN}====================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}====================================================${NC}"
}

# 1. Login
print_header "Logging in as Admin"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin69@construction.com",
        "password": "password123"
    }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}Login failed. Make sure you have seeded the database.${NC}"
    exit 1
fi
echo -e "${GREEN}Logged in successfully.${NC}"

# 2. Create a temporary project for testing deletion
print_header "Creating Test Project"
PROJECT_NAME="Deletion Test Project $(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"name\": \"$PROJECT_NAME\",
        \"startDate\": \"2024-01-01\",
        \"status\": \"PLANNED\"
    }")

PROJECT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')

if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Failed to create project.${NC}"
    echo $CREATE_RESPONSE | jq .
    exit 1
fi
echo -e "${GREEN}Project created with ID: $PROJECT_ID${NC}"

# 3. Add a Daily Progress Report to the project
print_header "Adding Daily Progress Report"
DPR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects/$PROJECT_ID/dpr" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "date": "2024-01-01T12:00:00Z",
        "workDescription": "Test work for deletion verification",
        "workerCount": 10
    }')

DPR_ID=$(echo $DPR_RESPONSE | jq -r '.data.id')

if [ "$DPR_ID" == "null" ] || [ -z "$DPR_ID" ]; then
    echo -e "${RED}Failed to add DPR.${NC}"
    echo $DPR_RESPONSE | jq .
    exit 1
fi
echo -e "${GREEN}DPR created with ID: $DPR_ID${NC}"

# 4. Attempt to delete the project (Should now work due to transaction)
print_header "Attempting Project Deletion"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/projects/$PROJECT_ID" \
    -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo $DELETE_RESPONSE | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}SUCCESS: Project and associated reports deleted successfully!${NC}"
    echo $DELETE_RESPONSE | jq .
else
    echo -e "${RED}FAILURE: Deletion failed.${NC}"
    echo $DELETE_RESPONSE | jq .
    exit 1
fi

print_header "Transaction Verification Complete"
