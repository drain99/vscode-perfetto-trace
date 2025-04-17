# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Features
- Bundle perfetto ui with the extension for local environments with no or restricted internet access.
- Keep a history of files selected with "Open Trace For File" command for fast access to reopen them.
- Enable fuzzy search (alike ctrl+p) with "Open Trace For File" command.
- Add extension support in web instances (e.g., https://vscode.dev/).
- Option to open perfetto ui in browser as an alternate to embedded within vscode.

### Project infrastructure
- Write extension tests to verify most ways to launch and close traces.
- Automate tests with ci.

## [0.2.10] - 2025-04-16

### Added
- Verified support for following remote development environments:
  - container, ssh, wsl, codespaces web & native
- Add single-file bundling to support web instances of VSCode.

## [0.2.9] - 2025-04-15

### Added
- First pre-release publish.

## [0.2.0] - 2025-04-13

### Added
- Show trace launch progress in notification for both "Open Trace" commands.
- Improve security with explicit content security policy.

## [0.1.1] - 2025-04-12

### Added
- Added command "Perfetto: Open Trace For File" to allow user to choose a trace file in workspace.

### Changed
- Renamed command "Perfetto: Open Trace" to "Perfetto: Open Trace For Active Editor".

## [0.1.0] - 2025-04-12

### Added
- Implement first iteration of "Perfetto: Open Trace" command.

## [0.0.1] - 2025-04-12

### Added
- Initial project template.