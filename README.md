# Gemini Folder Extension

## Development Notes
- 如果你想手動修正 Coding Style:
    ```bash
    yarn lint --fix
    ```
- 自動修正 Coding Style (VSCode)，`settings.json` 加入:
    ```json
    {
        // javascript
        "[javascript]": {
            "editor.defaultFormatter": "vscode.typescript-language-features",
            "editor.codeActionsOnSave": {
                "source.fixAll": "explicit"
            }
        },
        "[javascriptreact]": {
            "editor.defaultFormatter": "vscode.typescript-language-features",
            "editor.codeActionsOnSave": {
                "source.fixAll": "explicit"
            }
        },

        // eslint
        "eslint.options": {
            "overrideConfigFile": "eslint.config.js"
        },
        "eslint.codeActionsOnSave.mode": "all",
        "eslint.format.enable": true,
    }
    ```
