# Types Updater

Accept a list of packages and versions and do the following for each package:
1. run `npm pack <package_name>@<version>` to create a tarball
2. extract the tarball and go to package root directory
3. delete all non .d.ts/.ts files and entire folders if empty
4. delete extraneous data from package.json and similar
5. delete common unused files like LICENSE, README, etc.
6. zip the package with each package root in a subdirectory by it's registry name

## Usage

1. Create a text file with package specifications (one per line):

**packages.txt** (default filename):
```
@types/react=18.2.0

# Comments are supported (lines starting with #)
# Empty lines are ignored
```

2. Run the PowerShell script:

```powershell
.\update.ps1
```

The script will:
- Read packages from `packages.txt` (one package=version per line)
- Download each package using `npm pack`
- Extract and clean the package (keeping only .d.ts/.ts files)
- Clean up package.json to keep only essential fields
- Create a timestamped zip file with all processed packages organized by registry name

### File Format
- One package per line in format: `package=version`
- Comments supported (lines starting with `#`)
- Empty lines are ignored
- Supports scoped packages (e.g., `@types/node=20.10.0`)
