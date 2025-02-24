# Git Tracker

Git Tracker is a VS Code extension that automatically tracks your commit history across multiple repositories and pushes the logs to a dedicated Git repository.

## Features
- Tracks commit history for all repositories you work on.
- Stores commit logs in a global `.git_worklog.json` file.
- Pushes worklog data to a user-configured Git repository.
- Configurable worklog repository path and remote Git URL.
- Ensures no duplicate commits are logged.

## Installation
1. Clone this repository or download the latest release.
2. Open the project in VS Code.
3. Run `npm install` to install dependencies.
4. Press `F5` to launch the extension in a new VS Code window.

## Usage
1. Open a project with Git initialized.
2. Run `Git Worklog: Sync` from the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
3. The extension will automatically track and save commit logs.
4. Logs are pushed to the configured worklog Git repository.

## Configuration
This extension allows user-specific configurations:
- **`worklogGitRemote`**: The remote Git repository where worklogs are stored.
- **`worklogRepoPath`**: Local path where the worklog repository is cloned.

### Setting Up Configurations
1. Open VS Code settings (`Cmd+,` / `Ctrl+,`).
2. Search for `git-tracker`.
3. Configure `worklogGitRemote` and `worklogRepoPath` as needed.

## Development
To contribute or modify the extension:
1. Fork and clone the repository.
2. Run `npm install` to set up dependencies.
3. Press `F5` to start debugging in a new VS Code window.

## Known Issues
- Ensure the worklog repository is accessible before running sync.
- If the `.git_worklog.json` file is overwritten, verify the correct `worklogRepoPath` is set.

## Future Enhancements
- Add UI to configure settings instead of manually updating `settings.json`.
- Implement an automatic sync interval.
- Provide support for filtering repositories.

## License
This project is licensed under the MIT License. See `LICENSE` for details.

