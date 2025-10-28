import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: '🚀 Getting Started',
      collapsed: false,
      items: [
        'getting-started/environment-setup',
        'getting-started/first-plugin',
      ],
    },
    {
      type: 'category',
      label: '📚 Core Concepts',
      collapsed: false,
      items: [
        'core-concepts/architecture-overview',
        'core-concepts/action-development',
        'core-concepts/settings-persistence',
        'core-concepts/communication-protocol',
        'core-concepts/stream-deck-plus-deep-dive',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Development Guide',
      items: [
        'getting-started/environment-setup',
        'development-guide/build-and-deploy',
        'development-guide/debugging-guide',
        'development-guide/testing-strategies',
        'development-guide/localization',
        'development-guide/ci-cd-complete',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: '🎨 UI Components',
      items: [
        'ui-components/property-inspector-basics',
        'ui-components/form-components',
      ],
    },
    {
      type: 'category',
      label: '📝 Code Templates',
      items: [
        'code-templates/action-templates',
        'code-templates/manifest-templates',
        'code-templates/property-inspector-templates',
        'code-templates/common-patterns',
      ],
    },
    {
      type: 'category',
      label: '💡 Examples',
      items: [
        'examples/basic-counter-plugin',
        'examples/real-world-plugin-examples',
      ],
    },
    {
      type: 'category',
      label: '📖 API Reference',
      items: [
        'api-reference/api-reference',
        'api-reference/cli-commands',
        'api-reference/sdk-source-code-guide',
      ],
    },
    {
      type: 'category',
      label: '🚀 Advanced Topics',
      items: [
        'advanced-topics/network-operations',
        'advanced-topics/oauth-implementation',
        'advanced-topics/advanced-property-inspector',
        'advanced-topics/multi-action-coordination',
        'advanced-topics/managing-multiple-instances',
        'advanced-topics/device-specific-development',
        'advanced-topics/performance-profiling',
        'advanced-topics/analytics-and-telemetry',
        'advanced-topics/versioning-and-migrations',
      ],
    },
    {
      type: 'category',
      label: '🔒 Security & Legal',
      items: [
        'security/security-requirements',
        'security/compliance-guide',
      ],
    },
    {
      type: 'category',
      label: '🔧 Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/diagnostic-flowcharts',
      ],
    },
  ],
};

export default sidebars;
