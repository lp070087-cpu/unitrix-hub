@echo off
echo =========================================
echo  UNITRIX HUB — Finalizacao e Deploy
echo =========================================
echo.

cd /d "C:\Users\55819\Desktop\unitrix-hub"

echo [1/7] Removendo bcrypt nativo...
call npm uninstall bcrypt @types/bcrypt 2>nul
echo OK

echo.
echo [2/7] Instalando dependencias (bcryptjs + todas)...
call npm install
if %errorlevel% neq 0 ( echo ERRO & pause & exit /b 1 )
echo OK

echo.
echo [3/7] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 ( echo ERRO & pause & exit /b 1 )
echo OK

echo.
echo [4/7] Push do banco de dados...
call npx prisma db push
echo OK

echo.
echo [5/7] Populando dados de exemplo...
call npm run db:seed
echo OK

echo.
echo [6/7] BUILD COMPLETO...
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo =========================================
  echo  BUILD FALHOU - COPIE O ERRO E ME ENVIE
  echo =========================================
  pause
  exit /b 1
)
echo.
echo =========================================
echo  BUILD PASSOU COM SUCESSO!
echo =========================================

echo.
echo [7/7] Iniciando servidor...
start npm run dev
timeout /t 10 >nul

echo.
echo =========================================
echo  ROTAS PARA TESTAR:
echo =========================================
echo.
echo  Landing Page:     http://localhost:3000/landing
echo  Login:            http://localhost:3000/auth/login
echo  Admin Dashboard:  http://localhost:3000/admin
echo  Area Cliente:     http://localhost:3000/cliente
echo.
echo  Admin:    lo070087@gmail.com / unitrix2026
echo  Cliente:  ricardo@fintechpro.com.br / cliente123
echo.
echo =========================================
echo  PROJETO PRONTO PARA GITHUB E VERCEL
echo =========================================
start http://localhost:3000/landing
pause
