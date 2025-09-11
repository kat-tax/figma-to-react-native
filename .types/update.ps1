# Function to clean up a directory by removing non-.d.ts/.ts files
function Remove-NonSourceFiles {
  param([string]$Path)
  Write-Host "Cleaning up non-TypeScript files in: $Path"
  # Get all files recursively
  $allFiles = Get-ChildItem -Path $Path -Recurse -File
  foreach ($file in $allFiles) {
    $shouldDelete = $false
    # Delete files that are not .d.ts or .ts files
    if ($file.Extension -notin @('.ts', '.d.ts') -or
      ($file.Extension -eq '.ts' -and $file.Name -notlike '*.d.ts')) {
      # Special handling for package.json - clean it instead of deleting
      if ($file.Name -eq 'package.json') {
        Update-PackageJson -Path $file.FullName
        continue
      }
      # Delete common unused files
      if ($file.Name -in @('LICENSE', 'LICENSE.txt', 'LICENSE.md', 'README.md', 'README.txt', 'CHANGELOG.md', 'CHANGELOG.txt', '.npmignore', '.gitignore')) {
        $shouldDelete = $true
      }
      # Delete non-TypeScript files
      elseif ($file.Extension -notin @('.ts')) {
        $shouldDelete = $true
      }
      if ($shouldDelete) {
        Write-Host "Deleting file: $($file.FullName)"
        Remove-Item -Path $file.FullName -Force
      }
    }
  }
  # Remove empty directories
  do {
    $emptyDirs = Get-ChildItem -Path $Path -Recurse -Directory | Where-Object {
      (Get-ChildItem -Path $_.FullName -Force | Measure-Object).Count -eq 0
    }

    foreach ($dir in $emptyDirs) {
      Write-Host "Removing empty directory: $($dir.FullName)"
      Remove-Item -Path $dir.FullName -Force
    }
  } while ($emptyDirs.Count -gt 0)
}

# Function to clean package.json, keeping only essential fields
function Update-PackageJson {
  param([string]$Path)
  Write-Host "Cleaning package.json: $Path"
  try {
    $packageJson = Get-Content -Path $Path -Raw | ConvertFrom-Json

    # Create ordered hashtable to ensure field order
    $cleanedPackage = [ordered]@{
      name = $packageJson.name
      version = $packageJson.version
    }

    # Add types field if it exists (third priority)
    if ($packageJson.types) {
      $cleanedPackage.types = $packageJson.types
    }
    # Add typings field if it exists (alternative to types)
    if ($packageJson.typings) {
      $cleanedPackage.typings = $packageJson.typings
    }

    # Add dependencies if they exist (fourth priority)
    if ($packageJson.dependencies) {
      $cleanedPackage.dependencies = $packageJson.dependencies
    }

    # Add peerDependencies if they exist (fifth priority)
    if ($packageJson.peerDependencies) {
      $cleanedPackage.peerDependencies = $packageJson.peerDependencies
    }

    # Convert to JSON with proper formatting and LF line endings
    $jsonContent = $cleanedPackage | ConvertTo-Json -Depth 10 -Compress:$false
    # Ensure LF line endings (not CRLF)
    $jsonContent = $jsonContent -replace "`r`n", "`n"
    # Write with UTF8 encoding without BOM and LF line endings
    [System.IO.File]::WriteAllText($Path, $jsonContent, [System.Text.UTF8Encoding]::new($false))

    Write-Host "Cleaned package.json successfully with LF line endings"
  }
  catch {
    Write-Warning "Failed to clean package.json: $($_.Exception.Message)"
  }
}

# Function to extract tarball
function Get-Tarball {
  param(
    [string]$TarballPath,
    [string]$ExtractPath
  )
  Write-Host "Extracting tarball: $TarballPath to $ExtractPath"
  # Create extraction directory if it doesn't exist
  if (-not (Test-Path $ExtractPath)) {
    New-Item -ItemType Directory -Path $ExtractPath -Force | Out-Null
  }
  # Use tar command (available in Windows 10+) to extract
  try {
    $result = & tar -xzf $TarballPath -C $ExtractPath 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "Tar extraction failed: $result"
    }

    # Look for package directory - try different possible names
    $packageDir = $null

    # First try 'package' (most common)
    $packageDir = Get-ChildItem -Path $ExtractPath -Directory | Where-Object { $_.Name -eq 'package' } | Select-Object -First 1

    # If not found, look for any directory containing package.json
    if (-not $packageDir) {
      $packageDir = Get-ChildItem -Path $ExtractPath -Directory | Where-Object {
        Test-Path (Join-Path $_.FullName "package.json")
      } | Select-Object -First 1
    }

    # If still not found, list what we have for debugging
    if (-not $packageDir) {
      Write-Host "Available directories after extraction:"
      Get-ChildItem -Path $ExtractPath -Directory | ForEach-Object { Write-Host "  - $($_.Name)" }
      Get-ChildItem -Path $ExtractPath -File | ForEach-Object { Write-Host "  - $($_.Name) (file)" }
      throw "Package directory not found after extraction"
    }

    Write-Host "Found package directory: $($packageDir.Name)"
    return $packageDir.FullName
  }
  catch {
    Write-Error "Failed to extract tarball: $($_.Exception.Message)"
    return $null
  }
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Read package list from packages.txt (in same directory as script)
$PackageFile = Join-Path $ScriptDir "packages.txt"
if (-not (Test-Path $PackageFile)) {
  Write-Error "Package file not found: $PackageFile"
  Write-Host "Please create a packages.txt file in the same directory as the script: $ScriptDir"
  Write-Host "Expected file path: $PackageFile"
  Write-Host "Example content:"
  Write-Host "react=18.2.0"
  Write-Host "@types/node=20.10.0"
  Write-Host "typescript=5.3.0"
  exit 1
}
Write-Host "Reading packages from: $PackageFile"
$PackageList = Get-Content -Path $PackageFile | Where-Object { $_.Trim() -ne "" -and -not $_.StartsWith("#") }
if ($PackageList.Count -eq 0) {
  Write-Error "No packages found in $PackageFile"
  Write-Host "Please add package specifications (one per line) in format: package=version"
  exit 1
}

# Main script logic
Write-Host "Starting types updater script..."
Write-Host "Processing $($PackageList.Count) packages from $PackageFile"

# Create temporary directory for processing
$tempDir = Join-Path $env:TEMP "types-updater-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Use script directory as output directory
$outputDir = $ScriptDir

try {
  foreach ($packageSpec in $PackageList) {
    Write-Host "`n=== Processing package: $packageSpec ==="

    # Convert = separator to @ for npm pack command
    $npmPackageSpec = $packageSpec.Replace('=', '@')

    # Create package-specific temp directory
    $packageTempDir = Join-Path $tempDir $packageSpec.Replace('=', '_').Replace('@', '_').Replace('/', '_')
    New-Item -ItemType Directory -Path $packageTempDir -Force | Out-Null

    try {
      # Step 1: Run npm pack
      Write-Host "Running npm pack for $npmPackageSpec..."
      $packResult = & npm pack $npmPackageSpec --pack-destination $packageTempDir 2>&1
      if ($LASTEXITCODE -ne 0) {
        Write-Error "npm pack failed for $packageSpec`: $packResult"
        continue
      }
      # Find the created tarball
      $tarball = Get-ChildItem -Path $packageTempDir -Filter "*.tgz" | Select-Object -First 1
      if (-not $tarball) {
        Write-Error "No tarball found for $packageSpec"
        continue
      }
      Write-Host "Created tarball: $($tarball.Name)"
      # Step 2: Extract tarball
      $extractDir = Join-Path $packageTempDir "extracted"
      $packageRoot = Get-Tarball -TarballPath $tarball.FullName -ExtractPath $extractDir
      if (-not $packageRoot) {
        Write-Error "Failed to extract package for $packageSpec"
        continue
      }
      Write-Host "Extracted to: $packageRoot"
      # Step 3+4: Clean up files
      Remove-NonSourceFiles -Path $packageRoot
       # Step 5: Copy cleaned package to output with registry name structure
       $registryName = $packageSpec
       if ($registryName.Contains('=')) {
         # Remove version specifier (everything after =)
         $equalIndex = $registryName.IndexOf('=')
         $registryName = $registryName.Substring(0, $equalIndex)
       }

       # Remove @types/ prefix if present
       if ($registryName.StartsWith('@types/')) {
         $registryName = $registryName.Substring(7)  # Remove '@types/' (7 characters)
       }
      $outputPackageDir = Join-Path $outputDir $registryName
      $outputPackageParent = Split-Path $outputPackageDir -Parent
      if (-not (Test-Path $outputPackageParent)) {
        New-Item -ItemType Directory -Path $outputPackageParent -Force | Out-Null
      }
      Write-Host "Copying cleaned package contents to: $outputPackageDir"
      # Copy contents of package directory, not the package directory itself
      Copy-Item -Path "$packageRoot\*" -Destination $outputPackageDir -Recurse -Force
      Write-Host "Successfully processed $packageSpec"
    }
    catch {
      Write-Error "Error processing $packageSpec`: $($_.Exception.Message)"
    }
    finally {
      # Clean up package temp directory
      if (Test-Path $packageTempDir) {
        Remove-Item -Path $packageTempDir -Recurse -Force -ErrorAction SilentlyContinue
      }
    }
  }

  # Step 6: Create zip file with only package directories
  # Get all package directories (exclude script files and other non-package items)
  $packageDirs = Get-ChildItem -Path $outputDir -Directory | Where-Object {
    $_.Name -notin @("node_modules") -and
    -not $_.Name.EndsWith(".zip") -and
    $_.Name -ne "types" -and
    (Test-Path (Join-Path $_.FullName "package.json"))
  }

  if ($packageDirs.Count -gt 0) {
    $zipPath = Join-Path $ScriptDir "types-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
    Write-Host "`nCreating final zip: $zipPath"
    Write-Host "Including $($packageDirs.Count) package directories in zip"
    # Create zip with only package directories
    $packagePaths = $packageDirs | ForEach-Object { $_.FullName }
    Compress-Archive -Path $packagePaths -DestinationPath $zipPath -Force
    Write-Host "Created zip file: $zipPath"
    Write-Host "Package folders written to script directory: $outputDir"
    Write-Host "Packaged directories: $($packageDirs.Name -join ', ')"
    Write-Host "Types update completed successfully!"
  } else {
    Write-Warning "No packages were successfully processed"
  }
}
finally {
  # Clean up temporary directory
  if (Test-Path $tempDir) {
    Write-Host "Cleaning up temporary files..."
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
  # Note: We keep the output directory (types) with cleaned packages for user access
}

Write-Host "`nScript completed."
