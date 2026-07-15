# Get a token
TOKEN=$(curl -s -X POST "http://localhost:8081/realms/nexora/protocol/openid-connect/token" \
-d "client_id=nexora-client" \
-d "username=student_user" \
-d "password=student_user" \
-d "grant_type=password" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

curl -i -v -H "Origin: http://localhost:3000" -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/medical/medicines
