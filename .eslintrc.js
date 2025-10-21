module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json', // Para analizar tipos con TypeScript
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:prettier/recommended', // Integra Prettier con ESLint
    ],
    rules: {
        // Reglas generales de ESLint
        'no-console': 'warn',
        'no-debugger': 'warn',

        // Reglas específicas de TypeScript
        '@typescript-eslint/explicit-function-return-type': 'off', // No obliga a declarar tipos de retorno
        '@typescript-eslint/no-explicit-any': 'warn', // Avisa sobre el uso de `any`
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignora variables que comienzan con "_"
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        // Reglas de estilo con Prettier
        'prettier/prettier': [
            'error',
            {
                semi: true, // Punto y coma obligatorio
                tabWidth: 4, // Indentación de 4 espacios
                useTabs: false, // Espacios en lugar de tabs
                singleQuote: true, // Comillas simples
                printWidth: 100, // Longitud máxima por línea
                trailingComma: 'es5', // Coma al final de objetos y arrays
                bracketSpacing: true, // Espacios dentro de llaves
            },
        ],

        // Reglas de importación
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json', // Ruta al archivo tsconfig.json
            },
        },
    },
};
