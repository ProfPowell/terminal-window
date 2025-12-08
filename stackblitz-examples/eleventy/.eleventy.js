module.exports = function(eleventyConfig) {
  // Copy terminal-window dist files to output
  eleventyConfig.addPassthroughCopy({
    'node_modules/terminal-window/dist': 'js/terminal-window'
  });

  // Terminal shortcode
  eleventyConfig.addShortcode('terminal', (options = {}) => {
    const {
      theme = 'dark',
      prompt = '$ ',
      enableVfs = false,
      id = 'terminal'
    } = options;

    return `
      <terminal-window
        id="${id}"
        theme="${theme}"
        prompt="${prompt}"
        ${enableVfs ? 'enable-vfs' : ''}
        autofocus
      ></terminal-window>
    `;
  });

  return {
    dir: {
      input: 'src',
      output: '_site'
    }
  };
};
