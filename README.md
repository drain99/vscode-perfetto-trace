# Unofficial Perfetto UI Extension for Visual Studio Code

A VS Code extension that adds the ability to open and view perfetto-compatible trace files within VS Code.

## Features

Provides following commands to open a trace file in [Perfetto UI](https://ui.perfetto.dev/) within VS Code.
- `Open Trace For Active Editor`
  - Opens a new perfetto ui tab & loads active editor content.
- `Open Trace For File`
  - Opens pop up to select file to open & loads it in a new perfetto ui tab.

Additionally keeps a history of recently opened files and workspaces for quick access.

This primary motivation is to automate the following remote profiling workflow:
- generate trace file on remote
- copy trace file to local (scp or manual copy to notepad & save)
- open [Perfetto UI](https://ui.perfetto.dev/) in browser
- open local trace file

See [CHANGELOG](CHANGELOG.md) for more details and upcoming feature releases.

## Credits

Project icon from [google/perfetto project](https://github.com/google/perfetto)\
Copyright (c) 2017, The Android Open Source Project\
Licensed under the Apache License, Version 2.0, January 2004\
https://github.com/google/perfetto/blob/main/LICENSE

## License

This project is licensed under the MIT License and includes third-party components - see the [LICENSE](LICENSE) file for details.
