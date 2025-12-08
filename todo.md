# Terminal Window - Production Readiness Checklist

# For the LLM (Claude) to Do or Advise on
[ ] Correct the focus issue for Storybook, as when making changes in controls, the focus goes back to the terminal window constantly. I think we have a problem with aggressive event capture.  Could this also happen with the component on a page that has other interactive features?
[ ] Get the demo, docs, etc., deployed to Github pages properly
[ ] Write a quickstart guide for the component.  This will just add it to a page and the command it will run will be to echo "hello world I am a fun terminal simulator" and it then cats (the unix command) a file that contains a message that says "Hopefully I am useful web component for you if you are building educational materials or demos!"
[ ] Create integration information on this component for 
 [ ] React
 [ ] Vue
 [ ] Svelte
 [ ] Astro 
 [ ] 11ty

Demos may be necessary for these things, but we need to be careful about committing all the dependencies we just want to prove out all of these are correct and create the helloworld demo for each and provide notes, wrappers, etc. to make sure it is smooth.

# For Me to Do
[ ] Enable Chromatic visual regression testing:
1. Sign up at https://www.chromatic.com
2. Create a project and get your project token
3. Add CHROMATIC_PROJECT_TOKEN to your GitHub repository secrets

[ ] Determine how to relate this to the other developer components I made
[ ] Determine how to use it to promote ZingGrid since I can claim it is sponsored by them given they paid me to do this
[ ] Write a blog piece about "Made in China, Designed in California" comparing it to how I designed this and used Claude very heavily to make this component 
[ ] Create a prompt and skeleton repo of all the possible things here so that way we can move it to other projects easily

[ ] Stackblitz links
Needs Manual Action - StackBlitz Examples:

To create working StackBlitz demos, you'll need to:

1. Go to https://stackblitz.com
2. Create a new project for each framework
3. Install terminal-window (npm install terminal-window)
4. Add the example code from each integration guide
5. Update the links in both demo/integrations.html and demo/integrations/*.html files

The code examples in each integration page can be copied directly into StackBlitz. For example, the React demo should
contain:

import { useEffect, useRef } from 'react';
import 'terminal-window';

function App() {
const terminalRef = useRef(null);

    useEffect(() => {
      terminalRef.current.registerCommand('react', () => 'Hello from React!');
    }, []);

    return <terminal-window ref={terminalRef} theme="dark" prompt="$ " autofocus />;
}

