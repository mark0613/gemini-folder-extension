/* eslint-disable no-underscore-dangle */
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintImport from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
});

export default [
    ...compat.extends('airbnb'),
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                chrome: true,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.3' } },
        plugins: {
            import: eslintImport,
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'simple-import-sort': simpleImportSort,
            'unused-imports': unusedImports,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,

            // Base
            'brace-style': ['error', 'stroustrup'],
            indent: ['error', 4, { SwitchCase: 1 }],
            'linebreak-style': 'off',
            'no-param-reassign': ['error', { props: false }],
            'object-curly-newline': [
                'error',
                {
                    ImportDeclaration: { multiline: true, minProperties: 4 },
                    ExportDeclaration: { multiline: true, minProperties: 4 },
                },
            ],
            'prefer-destructuring': ['error', { object: true, array: false }],

            // JSX & React
            'react/prop-types': 'off',
            'react/function-component-definition': [
                'error',
                { namedComponents: 'arrow-function' },
            ],
            'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],
            'react/jsx-indent': ['error', 4],
            'react/jsx-indent-props': ['error', 4],
            'react/jsx-one-expression-per-line': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],

            // Import
            'import/prefer-default-export': 'off',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            'import/no-unresolved': [
                'error',
                {
                    ignore: ['^@.+'],
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'react',
                            importNames: ['default'],
                        },
                    ],
                },
            ],
            'unused-imports/no-unused-imports': 'warn',
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['^react$'], // React
                        ['^@?\\w'], // Libraries
                        ['^\\u0000'], // Side effect
                        ['^(@|components)(/.*|$)'], // Internal packages
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // `../*`
                        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // `./*`
                        ['^.+\\.?(css)$'], // CSS
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
        },
    },
];
