@echo off
echo =====================================================================
echo         STARTING PAYSYNAPSE COMPLETE 3-APP ECOSYSTEM
echo =====================================================================
echo [1/3] Starting PaySynapse Core Reconciler on http://localhost:3000...
start cmd /k "npm run dev"

echo [2/3] Starting CyberDeck Merchant Store on http://localhost:3001...
start cmd /k "cd merchant-store && npm run dev"

echo [3/3] Starting Apex Nodal Bank Simulator on http://localhost:3002...
start cmd /k "cd bank-portal && npm run dev"

echo =====================================================================
echo  All 3 services are launching in separate terminal windows:
echo   - PaySynapse Engine:      http://localhost:3000
echo   - Merchant Store:         http://localhost:3001
echo   - Apex Nodal Bank Portal: http://localhost:3002
echo =====================================================================
pause
