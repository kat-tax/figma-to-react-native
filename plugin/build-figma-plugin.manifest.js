module.exports = (manifest) => ({
  ...manifest,
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
