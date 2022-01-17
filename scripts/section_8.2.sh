

url=$(echo ${THEEYE_API_URL} | jq . -r)

curl -X PATCH "${url}/indicator/${INDICATOR_ID}/decrease?access_token={$ACCESS_TOKEN}"

