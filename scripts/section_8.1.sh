

url=$(echo ${THEEYE_API_URL} | jq . -r)

counter=${1}

curl -X PATCH \
	--header 'Content-Type: application/json' \
  --data "{\"value\":${counter}}" \
	"${url}/indicator/${INDICATOR_ID}?access_token={$ACCESS_TOKEN}"

