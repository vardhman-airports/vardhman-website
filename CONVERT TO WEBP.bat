@echo off
title Convert Images to WebP
color 0A
echo.
echo  ==============================================
echo   Vardhman Website - Image Converter to WebP
echo  ==============================================
echo.
echo  This will convert all JPG and PNG images
echo  in the website to WebP format (smaller size,
echo  faster loading). Your original files are kept.
echo.
echo  Press any key to start...
pause >nul

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Node.js is not installed on this computer.
    echo  Please contact your developer to run this.
    echo.
    pause
    exit /b
)

:: Go to the project folder (same folder as this .bat file)
cd /d "%~dp0"

:: Install sharp if not already installed
echo.
echo  Checking dependencies...
node -e "require('sharp')" >nul 2>&1
if %errorlevel% neq 0 (
    echo  Installing image converter (first time only, may take a minute)...
    npm install sharp --save-dev
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Could not install dependencies.
        echo  Please contact your developer.
        echo.
        pause
        exit /b
    )
)

echo.
echo  Converting images... please wait.
echo.
node scripts/convert-webp.js

echo.
echo  ==============================================
echo   Done! Check the results above.
echo   Your original images are still there.
echo  ==============================================
echo.
pause
