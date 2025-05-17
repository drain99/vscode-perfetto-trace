# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Project infrastructure
- Automate tests with ci.

## [1.1.0] - 2025-05-17

## Added
- Add explorer (ctrl+shift+E) context menu (right-click) item `Open Trace For File`.
This is equivalent to the command `Open Trace For File` and skips the file selection steps.

## [1.0.0] - 2025-05-02

## Changed
- Revert to `editor` terminology instead of `document` for `Open Trace For Active Editor`
- Mark extension as preview in marketplace for initial v1.0 release.

## [0.4.1] - 2025-04-20

### Fixed
- More error handling if file cannot be opened or read during trace launch.

## [0.4.0] - 2025-04-20

### Added
- `Open Trace For File` command now keeps a history of successfully opened files and shows them for fast reopen.
- `Open Trace For File` command now also efficiently handles multi-root workspaces.
- Handle more errors internally for a more stable implementation.

## Changed
- Changed command `Open Trace For Active Editor` to `Open Trace For Active Document` to be less technical.


## [0.3.0] - 2025-04-18

### Added
- Add project icon taken from [google/perfetto project](https://github.com/google/perfetto).
- Configure and add integration tests for features.
- More internal cleanup to target web support.

## [0.2.11] - 2025-04-18

### Added
- Improve project description.
- Add project keywords for better reachability.
- Internally move to webpack for a smoother support for web instances.

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