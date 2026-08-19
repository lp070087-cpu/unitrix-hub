@echo off
echo ========================================
echo  UNITRIX HUB - Setup Completo
echo ========================================
echo.

cd /d "C:\Users\55819\Desktop\unitrix-hub"

echo [1/6] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
  echo ERRO no npm install. Verifique sua conexao.
  pause
  exit /b 1
)
echo OK.

echo.
echo [2/6] Gerando Prisma Client...
call npx prisma generate
echo OK.

echo.
echo [3/6] Criando banco de dados...
call npx prisma db push
echo OK.

echo.
echo [4/6] Populando com dados de exemplo...
call npm run db:seed
echo OK.

echo.
echo [5/6] Testando build...
call npm run build
echo OK.

echo.
echo [6/6] Inicializando Git...
call git init
call git add .
call git commit -m "Unitrix Hub v1.0 - Plataforma premium de relacionamento comercial"
echo OK.

echo.
echo ========================================
echo  UNITRIX HUB PRONTO!
echo ========================================
echo.
echo Para rodar: npm run dev
echo Acesse: http://localhost:3000
echo.
echo Admin: lo070087@gmail.com / unitrix2026
echo Cliente: ricardo@fintechpro.com.br / cliente123
echo.
echo Documentacao: DEPLOY.md
echo.
code .
pause
