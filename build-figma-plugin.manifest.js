module.exports = (manifest) => ({
  ...manifest,
  networkAccess: {
    /*allowedDomains: [
      'unpkg.com',
      'ga.jspm.io',
      'cdn.jsdelivr.net',
      '*.highlight.io',
    ]*/
    allowedDomains: ['*'],
    reasoning: "Needed for Monaco Editor blob workers to load",
  },
  codegenLanguages: [
    {
      label: 'React Native',
      value: 'react-native',
    },
  ],
  codegenPreferences: [
    {
      label: 'Tab Size',
      itemType: 'select',
      propertyName: 'tab-size',
      options: [
        {label: '2', value: '2', isDefault: true},
        {label: '4', value: '4'},
        {label: '8', value: '8'}
      ],
    },
    {
      label: 'Quote Style',
      itemType: 'select',
      propertyName: 'quote-style',
      options: [
        {label: 'Single', value: 'single', isDefault: true},
        {label: 'Double', value: 'double'},
      ],
    },
    {
      label: 'White Space',
      itemType: 'select',
      propertyName: 'white-space',
      options: [
        {label: 'Spaces', value: 'spaces', isDefault: true},
        {label: 'Tabs', value: 'tabs'},
      ],
    },
    {
      label: 'React Import',
      itemType: 'select',
      propertyName: 'react-import',
      options: [
        {label: 'Enabled', value: 'on', isDefault: true},
        {label: 'Disabled', value: 'off'},
      ],
    },
    {
      label: 'Translate',
      itemType: 'select',
      propertyName: 'translate',
      options: [
        {label: 'Enabled', value: 'on'},
        {label: 'Disabled', value: 'off', isDefault: true},
      ],
    },
  ],
});
