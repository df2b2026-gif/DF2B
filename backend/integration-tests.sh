#!/usr/bin/env bash
# Интеграционные тесты для API
# Запускается в корне /DF2B_лэндос/backend

API_URL="http://localhost:3001"
TOKEN="YOUR_SUPABASE_JWT_TOKEN_HERE"  # Получить из Supabase auth или из фронтенда через supabase.auth.session().access_token

if [ "${TOKEN}" == "YOUR_SUPABASE_JWT_TOKEN_HERE" ]; then
  echo "Установите TOKEN в файле и повторите запуск. Это тестовый placeholder."
  exit 1
fi

echo "1) тест POST /api/health/sync/google-fit (предполагается, что токен действителен)"
curl -s -X POST "${API_URL}/api/health/sync/google-fit" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"entries":[{"data_type":"steps","value":5600,"unit":"steps","recorded_at":"2026-03-16T08:00:00Z"},{"data_type":"heart_rate","value":102,"unit":"bpm","recorded_at":"2026-03-16T08:01:00Z"},{"data_type":"sleep","value":7.2,"unit":"hours","recorded_at":"2026-03-16T06:00:00Z"}]}'

echo "\n2) тест POST /api/health/sync/apple-health"
curl -s -X POST "${API_URL}/api/health/sync/apple-health" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"entries":[{"data_type":"steps","value":8000,"unit":"steps","recorded_at":"2026-03-16T09:00:00Z"},{"data_type":"heart_rate","value":110,"unit":"bpm","recorded_at":"2026-03-16T09:05:00Z"}]}'

echo "\n3) тест GET /api/user/metrics"
curl -s -X GET "${API_URL}/api/user/metrics" -H "Authorization: Bearer ${TOKEN}"

echo "\n4) тест GET /api/alerts"
curl -s -X GET "${API_URL}/api/alerts?unacknowledged=true" -H "Authorization: Bearer ${TOKEN}"
