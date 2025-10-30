# PowerShell Deployment Script for Smart School Finder
# Run this script to build and prepare for deployment

Write-Host "🚀 Starting Production Build Process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env file exists
Write-Host "📋 Step 1: Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from .env.production..." -ForegroundColor Yellow
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env"
        Write-Host "✅ .env file created" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.production template not found!" -ForegroundColor Red
        Write-Host "Please create .env file with VITE_API_BASE_URL" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 2: Install dependencies if needed
Write-Host "📦 Step 2: Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Clean previous builds
Write-Host "🧹 Step 3: Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Cleaned dist folder" -ForegroundColor Green
} else {
    Write-Host "✅ No previous build found" -ForegroundColor Green
}
Write-Host ""

# Step 4: Build for production
Write-Host "🔨 Step 4: Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Production build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 5: Show build info
Write-Host "📊 Build Information:" -ForegroundColor Cyan
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   📁 Output directory: dist/" -ForegroundColor White
Write-Host "   📦 Total size: $([math]::Round($distSize, 2)) MB" -ForegroundColor White
Write-Host ""

# Step 6: Deployment instructions
Write-Host "✅ Build Complete! Ready for deployment" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Upload the 'dist' folder to your hosting service" -ForegroundColor White
Write-Host "   2. Or use one of these commands:" -ForegroundColor White
Write-Host ""
Write-Host "   Netlify: " -ForegroundColor Yellow -NoNewline
Write-Host "netlify deploy --prod --dir=dist" -ForegroundColor White
Write-Host ""
Write-Host "   Vercel:  " -ForegroundColor Yellow -NoNewline
Write-Host "vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "   Render:  " -ForegroundColor Yellow -NoNewline
Write-Host "Push to GitHub and connect via Render dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🔍 For detailed deployment guide, see PRODUCTION_DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Happy Deploying! ✨" -ForegroundColor Green
