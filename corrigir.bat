@echo off
echo ========================================
echo  UNITRIX HUB - Correcao Completa
echo ========================================
echo.

cd /d "C:\Users\55819\Desktop\unitrix-hub"

echo [1/5] Removendo bcrypt nativo...
call npm uninstall bcrypt @types/bcrypt 2>nul
echo OK

echo.
echo [2/5] Instalando bcryptjs (JS puro, compatível com Edge)...
call npm install bcryptjs @types/bcryptjs
if %errorlevel% neq 0 ( echo ERRO na instalacao & pause & exit /b 1 )
echo OK

echo.
echo [3/5] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 ( echo ERRO no prisma generate & pause & exit /b 1 )
echo OK

echo.
echo [4/5] BUILD do projeto (etapa obrigatoria)...
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo ========================================
  echo  BUILD FALHOU - veja os erros acima
  echo ========================================
  pause
  exit /b 1
)
echo.
echo ========================================
echo  BUILD PASSOU - SUCESSO
echo ========================================

echo.
echo [5/5] Iniciando servidor de desenvolvimento...
start npm run dev
timeout /t 10 >nul

echo.
echo ========================================
echo  ROTAS PARA TESTAR:
echo ========================================
echo.
echo  http://localhost:3000/landing      (Landing Page - NOVA)
echo  http://localhost:3000/auth/login   (Login admin + cliente)
echo  http://localhost:3000/admin        (Dashboard Admin)
echo  http://localhost:3000/cliente      (Area do Cliente)
echo.
echo  Login admin:    lo070087@gmail.com / unitrix2026
echo  Login cliente:  ricardo@fintechpro.com.br / cliente123
echo.
echo ========================================
start http://localhost:3000/landing
pause
