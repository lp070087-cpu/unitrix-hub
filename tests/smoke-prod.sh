#!/usr/bin/env bash
# Smoke test somente-leitura em produção (sem login, sem gravar dados).
B=${1:-https://unitrix-hub.vercel.app}
pass=0; fail=0
chk() { local name=$1 exp=$2 path=$3; local got; got=$(curl -s -o /dev/null -w "%{http_code}" "$B$path"); if [[ "$got" =~ ^($exp)$ ]]; then pass=$((pass+1)); echo "✔ $name ($got)"; else fail=$((fail+1)); echo "✘ $name esperado $exp obteve $got"; fi; }
chk "home" 200 /
chk "login" 200 /auth/login
chk "robots" 200 /robots.txt
chk "sitemap" 200 /sitemap.xml
chk "404" 404 /nao-existe-xyz
chk "admin anônimo → login" "302|303|307" /admin
chk "admin/financeiro anônimo → login" "302|303|307" /admin/financeiro
chk "cliente anônimo → login" "302|303|307" /cliente
chk "contrato anônimo → login/404" "302|303|307|404" /contrato/slug-inexistente
chk "apresentação inexistente" 404 /apresentacao/slug-inexistente
chk "cron sem token" "401|403" /api/cron/billing
chk "sessão" 200 /api/auth/session
curl -s "$B/" | grep -q "Tecnologia sob medida" && { pass=$((pass+1)); echo "✔ conteúdo da landing"; } || { fail=$((fail+1)); echo "✘ conteúdo da landing"; }
curl -sI "$B/" | grep -qi "x-content-type-options: nosniff" && { pass=$((pass+1)); echo "✔ headers de segurança"; } || { fail=$((fail+1)); echo "✘ headers de segurança"; }
echo "Produção: $pass ok, $fail falhas"; exit $fail
