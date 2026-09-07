import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

const tsFiles = ['**/*.ts', '**/*.tsx'];

const interactiveCtaElements = new Set(['a', 'button', 'Button', 'Link']);
const unsafeSlateBackground = /^bg-slate-(?:950|900|800|700)(?:\/[^\s]+)?$/;

function getLiteralAttributeValue(attribute) {
  if (!attribute?.value) {
    return null;
  }

  const { value } = attribute;

  if (value.type === 'Literal' && typeof value.value === 'string') {
    return value.value;
  }

  if (value.type !== 'JSXExpressionContainer') {
    return null;
  }

  const { expression } = value;

  if (expression.type === 'Literal' && typeof expression.value === 'string') {
    return expression.value;
  }

  if (
    expression.type === 'TemplateLiteral' &&
    expression.expressions.length === 0
  ) {
    return expression.quasis
      .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
      .join('');
  }

  return null;
}

function getJsxAttribute(openingElement, name) {
  return openingElement.attributes.find(
    (attribute) =>
      attribute.type === 'JSXAttribute' &&
      attribute.name.type === 'JSXIdentifier' &&
      attribute.name.name === name,
  );
}

function getClassNames(openingElement) {
  const className = getLiteralAttributeValue(
    getJsxAttribute(openingElement, 'className'),
  );

  return className?.trim().split(/\s+/).filter(Boolean) ?? [];
}

function getElementName(elementName) {
  if (elementName.type === 'JSXIdentifier') {
    return elementName.name;
  }

  if (elementName.type === 'JSXMemberExpression') {
    return elementName.property.name;
  }

  return null;
}

function isPrintableWorksheet(openingElement) {
  return (
    getLiteralAttributeValue(getJsxAttribute(openingElement, 'id')) ===
    'printable-worksheet-content'
  );
}

function isIntentionalCta(openingElement) {
  if (!interactiveCtaElements.has(getElementName(openingElement.name))) {
    return false;
  }

  const classNames = getClassNames(openingElement);
  const hasGradientBackground = classNames.some((className) =>
    className.startsWith('bg-gradient-to-'),
  );
  const hasDarkBackground = classNames.some((className) =>
    /^(?:bg-(?:slate-(?:950|900|800|700)|black)(?:\/[^\s]+)?)$/.test(className),
  );

  return hasGradientBackground || hasDarkBackground;
}

function hasAllowedContext(openingElement) {
  let currentNode = openingElement.parent;

  while (currentNode) {
    if (currentNode.type === 'JSXElement') {
      const ancestor = currentNode.openingElement;

      if (isPrintableWorksheet(ancestor) || isIntentionalCta(ancestor)) {
        return true;
      }
    }

    currentNode = currentNode.parent;
  }

  return false;
}

const themeGuardPlugin = {
  rules: {
    'no-unsafe-light-theme-utility': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Açık temada kontrastı bozabilen çıplak Tailwind renk yardımcılarını engeller.',
        },
        schema: [],
        messages: {
          unsafeUtility:
            '{{utility}} açık temada yalnızca aynı className içindeki uygun bir dark: eşlemesi veya yazdırılabilir/koyu CTA bağlamında kullanılabilir.',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (
              node.name.type !== 'JSXIdentifier' ||
              node.name.name !== 'className'
            ) {
              return;
            }

            const openingElement = node.parent;
            const classNames = getClassNames(openingElement);

            if (!classNames.length || hasAllowedContext(openingElement)) {
              return;
            }

            for (const className of classNames) {
              const isTextUtility = className === 'text-white';
              const isBackgroundUtility = unsafeSlateBackground.test(className);

              if (!isTextUtility && !isBackgroundUtility) {
                continue;
              }

              const hasDarkPair = classNames.some((candidate) =>
                isTextUtility
                  ? /^dark:text-/.test(candidate)
                  : /^dark:bg-/.test(candidate),
              );

              if (!hasDarkPair) {
                context.report({
                  node,
                  messageId: 'unsafeUtility',
                  data: { utility: className },
                });
              }
            }
          },
        };
      },
    },
  },
};

const config = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'data/**',
      'node_modules/**',
      'public/sw.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  {
    files: tsFiles,
    plugins: {
      'theme-guard': themeGuardPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-anonymous-default-export': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/tabindex-no-positive': 'warn',
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['error', 'warn'],
        },
      ],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/no-unescaped-entities': 'off',
      'theme-guard/no-unsafe-light-theme-utility': 'warn',
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    files: ['src/app/**/page.tsx'],
    rules: {
      'max-lines': [
        'warn',
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  prettier,
];

export default config;
