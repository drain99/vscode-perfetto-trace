# VS Code Extension Release Guide

Short checklist for building, packaging, and publishing this extension.

---

## One-time setup

```bash
npm install
npm install -g @vscode/vsce
```

---

## Local development

```bash
npm run compile     # dev build
npm run watch       # dev build (watch)
npm test            # optional
```

---

## Release build

```bash
npm run clean
npm run package     # production webpack build
```

---

## Package (.vsix)

```bash
vsce package
code --install-extension *.vsix   # optional local test
```

---

## Publish

```bash
vsce publish
# or
vsce publish patch|minor|major # version bumped automatically
```

---

## Notes

* `vscode:prepublish` runs the production build automatically
* Use `vsce package --dry-run` to inspect published files
