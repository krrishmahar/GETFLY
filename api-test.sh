#!/bin/bash

# API Test Script for GETFLY Backend
# Requires: curl, jq

BASE_URL="http://localhost:3000"
TOKEN=""

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

# 1. Health Check
print_header "Testing Health & About"
curl -s "$BASE_URL/health" | jq .
curl -s "$BASE_URL/about" | jq .

# 2. Authentication
print_header "Testing Authentication (Registration & Login)"

RANDOM_ID=$((RANDOM % 9000 + 1000))
EMAIL="testuser$RANDOM_ID@example.com"
PASSWORD="password123"

echo -e "Registering user: $EMAIL"
REG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test User $RANDOM_ID\",
        \"email\": \"$EMAIL\",
        \"phone\": \"+919876543210\",
        \"password\": \"$PASSWORD\",
        \"role\": \"ADMIN\"
    }")

echo $REG_RESPONSE | jq .

echo -e "\nLogging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
    }")

echo $LOGIN_RESPONSE | jq .

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to acquire token. Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}Token acquired!${NC}"

# 3. Project Management
print_header "Testing Project Management"

echo -e "Creating a new project with full details..."
CREATE_PROJ_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"name\": \"API Test Project $RANDOM_ID\",
        \"description\": \"Created via automated test script with full fields\",
        \"startDate\": \"2024-03-20\",
        \"endDate\": \"2024-12-31\",
        \"budget\": 7500000,
        \"location\": \"Testing Zone A\",
        \"status\": \"PLANNED\"
    }")

echo $CREATE_PROJ_RESPONSE | jq .
PROJECT_ID=$(echo $CREATE_PROJ_RESPONSE | jq -r '.data.id')

if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Failed to create project. Exiting.${NC}"
    exit 1
fi

echo -e "\nListing all projects..."
curl -s -X GET "$BASE_URL/api/projects" \
    -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\nGetting project details (ID: $PROJECT_ID)..."
curl -s -X GET "$BASE_URL/api/projects/$PROJECT_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\nUpdating project status and budget..."
curl -s -X PUT "$BASE_URL/api/projects/$PROJECT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"status\": \"ACTIVE\",
        \"budget\": 8000000
    }" | jq .

# 4. Daily Progress Reports (DPRs)
print_header "Testing Daily Progress Reports"

echo -e "Adding a DPR entry with full details..."
curl -s -X POST "$BASE_URL/api/projects/$PROJECT_ID/dpr" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"date\": \"2024-03-21T00:00:00.000Z\",
        \"workDescription\": \"Automated API testing complete summary with detailed field validation\",
        \"workerCount\": 25,
        \"weather\": \"Partly Cloudy, 24°C\",
        \"challenges\": \"Coordinating multiple API calls simultaneously\",
        \"materialsUsed\": \"Virtual bits, Logic gates, Network packets\",
        \"equipmentUsed\": \"Curl, JQ, Bash\",
        \"safetyIncidents\": \"Zero logical errors detected\",
        \"nextDayPlan\": \"Analyze test results and polish backend documentation\"
    }" | jq .

echo -e "\nListing DPRs for project..."
curl -s -X GET "$BASE_URL/api/projects/$PROJECT_ID/dpr" \
    -H "Authorization: Bearer $TOKEN" | jq .

print_header "All tests completed successfully!"
