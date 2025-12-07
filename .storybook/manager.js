import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming';

addons.setConfig({
  theme: {
    ...themes.dark,
    brandTitle: 'Terminal Window',
    brandUrl: 'https://github.com/ProfPowell/terminal-window',
    brandImage: undefined,
    colorPrimary: '#50fa7b',
    colorSecondary: '#50fa7b',
  },
});
