# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Features
- Support for remote development environments.
- Option to open perfetto ui in browser as an alternate to embedded within vscode.

### Project infrastructure
- Write extension tests to verify most ways to launch and close traces.
- Configure bundling with esbuild.
- Automate tests with ci.

## [0.2.9] - 2025-04-15

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