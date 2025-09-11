# Types Updater

# Accept a list of packages and versions and do the following for each package:
# 1. run `npm pack <package_name>@<version>` to create a tarball
# 2. extract the tarball and go to package root directory
# 3. delete all non .d.ts/.ts files and entire folders if empty
# 4. delete extraneous data from package.json and similar
# 5. delete common unused files like LICENSE, README, etc.
# 6. zip the package with each package root in a subdirectory by it's registry name

# ## Usage

# 1. Create a text file with package specifications (one per line):

# **packages.txt** (default filename):
# ```
# @types/react=18.2.0

# # Comments are supported (lines starting with #)
# # Empty lines are ignored
# ```

# 2. Run the PowerShell script:

# ```powershell
# .\update.ps1
# ```

# The script will:
# - Read packages from `packages.txt` (one package=version per line)
# - Download each package using `npm pack`
# - Extract and clean the package (keeping only .d.ts/.ts files)
# - Clean up package.json to keep only essential fields
# - Create a timestamped zip file with all processed packages organized by registry name

# ### File Format
# - One package per line in format: `package=version`
# - Comments supported (lines starting with `#`)
# - Empty lines are ignored
# - Supports scoped packages (e.g., `@types/node=20.10.0`)



# Function to clean up a directory by removing non-.d.ts/.ts files
function Remove-NonSourceFiles {
  param([string]$Path)
  Write-Host "Cleaning up non-TypeScript files in: $Path"

  # Remove entire src directory if it exists (not needed for types-only packages)
  $srcDir = Join-Path $Path "src"
  if (Test-Path $srcDir) {
    Write-Host "Removing entire src directory: $srcDir"
    Remove-Item -Path $srcDir -Recurse -Force
  }

  # Get all remaining files recursively
  $allFiles = Get-ChildItem -Path $Path -Recurse -File
  foreach ($file in $allFiles) {
    $shouldDelete = $false

    # Special handling for package.json - only keep the root one and clean it
    if ($file.Name -eq 'package.json') {
      $isRootPackageJson = $file.DirectoryName -eq $Path
      if ($isRootPackageJson) {
        Update-PackageJson -Path $file.FullName
        continue
      } else {
        # Delete nested package.json files
        Write-Host "Deleting nested package.json: $($file.FullName)"
        Remove-Item -Path $file.FullName -Force
        continue
      }
    }

    # Delete source TypeScript files (keep only .d.ts)
    if ($file.Extension -eq '.ts' -and $file.Name -notlike '*.d.ts') {
      $shouldDelete = $true
    }
    # Delete common unused files
    elseif ($file.Name -in @('LICENSE', 'LICENSE.txt', 'LICENSE.md', 'README.md', 'README.txt', 'CHANGELOG.md', 'CHANGELOG.txt', '.npmignore', '.gitignore')) {
      $shouldDelete = $true
    }
    # Delete non-TypeScript files (except .d.ts)
    elseif ($file.Extension -notin @('.ts') -or ($file.Extension -eq '.ts' -and $file.Name -notlike '*.d.ts')) {
      $shouldDelete = $true
    }

    if ($shouldDelete) {
      Write-Host "Deleting file: $($file.FullName)"
      Remove-Item -Path $file.FullName -Force
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
    $packageDir = Split-Path -Parent $Path

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

    # Generate exports field only if the original package.json had one
    if ($packageJson.exports) {
      $exports = [ordered]@{}

      # Find all .d.ts files recursively in the package directory
      $allDtsFiles = Get-ChildItem -Path $packageDir -Filter "*.d.ts" -Recurse | ForEach-Object {
        # Get relative path from package root
        $relativePath = $_.FullName.Substring($packageDir.Length + 1).Replace('\', '/')
        $cleanName = $_.Name -replace '\.d\.ts$', ''

        # Calculate directory path relative to package root
        $dirPath = [System.IO.Path]::GetDirectoryName($relativePath).Replace('\', '/')
        if ($dirPath -eq '.') { $dirPath = '' }

        return @{
          FileName = $cleanName
          RelativePath = "./$relativePath"
          FullPath = $_.FullName
          DirPath = $dirPath
          IsRoot = ($dirPath -eq '')
        }
      }

      # Find the main entry point from the types field
      $mainTypesPath = $packageJson.types
      if ($mainTypesPath) {
        # Normalize the path (remove leading ./)
        $mainTypesPath = $mainTypesPath -replace '^\./', ''

        # Find the main file
        $mainFile = $allDtsFiles | Where-Object { $_.RelativePath -eq "./$mainTypesPath" }
        if ($mainFile) {
          $exports["."] = [ordered]@{
            types = $mainFile.RelativePath
          }
        }
      }

      # For files in the same directory as the main types file, create individual exports
      if ($mainTypesPath) {
        $mainDir = [System.IO.Path]::GetDirectoryName($mainTypesPath).Replace('\', '/')
        if ($mainDir -eq '.') { $mainDir = '' }

        # Find other .d.ts files in the same directory as the main types file
        $siblingFiles = $allDtsFiles | Where-Object {
          $_.DirPath -eq $mainDir -and $_.FileName -ne "index"
        } | Sort-Object FileName

        foreach ($file in $siblingFiles) {
          $exportKey = "./$($file.FileName)"
          $exports[$exportKey] = [ordered]@{
            types = $file.RelativePath
          }
        }
      }

      # Add exports for subdirectories with index.d.ts files
      $subdirIndexFiles = $allDtsFiles | Where-Object {
        $_.FileName -eq "index" -and $_.DirPath -ne "" -and $_.DirPath -ne $mainDir
      }

      foreach ($file in $subdirIndexFiles) {
        # Use the directory name as the export key
        $dirName = [System.IO.Path]::GetFileName($file.DirPath)
        $exportKey = "./$dirName"
        $exports[$exportKey] = [ordered]@{
          types = $file.RelativePath
        }
      }

      # Add the exports field
      $cleanedPackage.exports = $exports
    }

    # Add dependencies if they exist (fourth priority)
    if ($packageJson.dependencies) {
      $cleanedPackage.dependencies = $packageJson.dependencies
    }

    # Add peerDependencies if they exist (fifth priority)
    if ($packageJson.peerDependencies) {
      $cleanedPackage.peerDependencies = $packageJson.peerDependencies
    }

    # Convert to JSON with compress (single line, no formatting)
    $jsonContent = $cleanedPackage | ConvertTo-Json -Depth 10 -Compress:$true
    # Fix Unicode escaping for common symbols
    $jsonContent = $jsonContent -replace '\\u003e', '>'
    $jsonContent = $jsonContent -replace '\\u003c', '<'
    $jsonContent = $jsonContent -replace '\\u0026', '&'
    # Write with UTF8 encoding without BOM
    [System.IO.File]::WriteAllText($Path, $jsonContent, [System.Text.UTF8Encoding]::new($false))

    Write-Host "Cleaned package.json successfully with LF line endings and exports field"
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

# Use script directory as base, with packages subdirectory for output
$packagesDir = Join-Path $ScriptDir "packages"
# Create packages directory if it doesn't exist
if (-not (Test-Path $packagesDir)) {
  New-Item -ItemType Directory -Path $packagesDir -Force | Out-Null
}
$outputDir = $packagesDir

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

  # Step 6: Create zip file with the entire packages directory
  if (Test-Path $packagesDir) {
    $packageDirs = Get-ChildItem -Path $packagesDir -Directory
    if ($packageDirs.Count -gt 0) {
      $zipPath = Join-Path $ScriptDir "types-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
      Write-Host "`nCreating final zip: $zipPath"
      Write-Host "Including packages directory with $($packageDirs.Count) package directories"
      # Create zip with the entire packages directory
      Compress-Archive -Path $packagesDir -DestinationPath $zipPath -Force
      Write-Host "Created zip file: $zipPath"
      Write-Host "Package folders written to: $packagesDir"
      Write-Host "Packaged directories: $($packageDirs.Name -join ', ')"
      Write-Host "Types update completed successfully!"
    } else {
      Write-Warning "No packages were successfully processed"
    }
  } else {
    Write-Warning "Packages directory was not created"
  }
}
finally {
  # Clean up temporary directory
  if (Test-Path $tempDir) {
    Write-Host "Cleaning up temporary files..."
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
  # Note: We keep the packages directory with cleaned packages for user access
}

Write-Host "`nScript completed."
