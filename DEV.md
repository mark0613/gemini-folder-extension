# Dev Notes

## 啟動
1. 安裝套件
    ```bash
    yarn install
    ```
2. 啟動
    ```bash
    yarn dev
    ```
3. 打開 chrome://extensions/
4. 打開右上角的 "開發者模式"
5. 點擊 "載入已解壓縮的扩展"
6. 選擇 `dist/` 資料夾


## Lint
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
