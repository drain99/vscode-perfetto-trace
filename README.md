# Perfetto UI Extension for Visual Studio Code (Unofficial)

A VS Code extension that adds the ability to open and view perfetto-compatible trace files within VS Code.

## Features

Provides following commands to open a trace file in [Perfetto UI](https://ui.perfetto.dev/) within VS Code.
- `Open Trace For Active Editor`
  - Opens a new perfetto ui tab & loads active editor content.
- `Open Trace For File`
  - Opens pop up to select file to open & loads it in a new perfetto ui tab.

This primary motivation is to automate the following remote profiling workflow:
- generate trace file on remote
- copy trace file to local (scp or manual copy to notepad & save)
- open [Perfetto UI](https://ui.perfetto.dev/) in browser
- open local trace file

See [CHANGELOG](CHANGELOG.md) for more details and upcoming feature releases.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
