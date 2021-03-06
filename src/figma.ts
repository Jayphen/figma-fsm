// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 600,
  height: 400
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-frames") {
    const value = JSON.parse(msg.value);
    console.log(value);
    const MACHINE_NAME = value.id;

    createAndSwitchToPage();
    const frames = await createArtboards(value.states, msg.spacing, {
      prefix: `STATE:`
    });

    const debugFrame = await createDebugArtboard(value);

    figma.viewport.scrollAndZoomIntoView([...frames, debugFrame]);

    figma.root.setPluginData("machine", JSON.stringify(value));
  }

  if (msg.type === "find-frames") {
    const currentMachine = JSON.parse(figma.root.getPluginData("machine"));

    let states = figma.currentPage
      .findAll(node => {
        return node.name.startsWith("STATE:");
      })
      .filter(state => {
        return state.type === "FRAME";
      });

    const stateNames = states.map(state => state.name.split(":")[1]);

    stateNames.forEach(name => {
      if (!(name in currentMachine.states)) {
        currentMachine.states[name] = {};
        figma.root.setPluginData("machine", JSON.stringify(currentMachine));
      }
    });

    const machineNames = Object.keys(currentMachine.states);
    machineNames.forEach(name => {
      if (!stateNames.includes(name)) {
        delete currentMachine.states[name];
      }
    });

    const debugFrame = figma.currentPage.findOne(node => node.name === "DEBUG");
    const debugText = figma.currentPage.findOne(
      node => node.name === "DEBUG_TEXT"
    );
    await figma.loadFontAsync({ family: "Menlo", style: "Regular" });
    (debugText as TextNode).characters = JSON.stringify(
      currentMachine,
      null,
      4
    );

    debugFrame.resize(debugFrame.width, debugText.height);

    figma.ui.postMessage(JSON.stringify(currentMachine, null, 4));
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

function valueOr(val: string, or: number) {
  const num = parseInt(val, 10);

  if (num < 1) {
    return or;
  }

  return num;
}

async function createArtboards(
  states: { [state: string]: any },
  spacing: number,
  opts: { prefix: string }
) {
  const frames: FrameNode[] = [];

  const allStates = Object.keys(states);

  for (let i = 0, prevWidth = 0; i < allStates.length; i++) {
    const frame = figma.createFrame();

    frame.clipsContent = false;

    frame.name = `${opts.prefix}${allStates[i]}`;

    const events = await printEvents(states[allStates[i]]);

    if (events) {
      frame.appendChild(events);
      if (events.width > frame.width) {
        frame.resize(events.width, frame.height);
      }
    }

    frame.x = prevWidth + spacing;

    prevWidth = frame.width + frame.x;

    figma.currentPage.appendChild(frame);
    frames.push(frame);
  }
  return frames;
}

async function printEvents(state: any) {
  // no events here
  if (!state.on) return null;

  const events = Object.keys(state.on);

  await figma.loadFontAsync({ family: "Roboto", style: "Regular" });

  const texts = events.map((event, index) => {
    const text = figma.createText();
    text.fills = [{ ...text.fills[0], color: { r: 1, b: 1, g: 1 } }];
    text.characters = event;
    text.y = text.y + 10;

    const button = figma.createRectangle();
    button.resize(text.width + 20, text.height + 20);
    button.fills = [{ type: "SOLID", color: { b: 0.5, g: 0.3, r: 0.3 } }];

    const frame = figma.createFrame();
    frame.backgrounds = [{ ...frame.backgrounds[0], opacity: 0 }];
    frame.clipsContent = false;
    frame.resize(button.width, button.height);
    frame.insertChild(0, button);
    frame.insertChild(1, text);

    text.x = button.x + 10;

    frame.y = (10 + button.height) * index;

    frame.name = `Event:${event}`;

    return frame;
  });

  const frame = figma.createFrame();

  texts.forEach(text => frame.appendChild(text));

  frame.name = "Events";

  return frame;
}

function createAndSwitchToPage() {
  const newPage = figma.createPage();
  const document = figma.root;
  document.appendChild(newPage);

  figma.currentPage = newPage;
}

async function createDebugArtboard(value: any) {
  const frame = figma.createFrame();

  frame.y = frame.height + frame.height / 2;

  frame.name = "DEBUG";

  console.log("loading menlo");

  await figma.loadFontAsync({ family: "Menlo", style: "Regular" });

  console.log("loaded menlo");

  const text = figma.createText();
  text.name = "DEBUG_TEXT";
  text.fontName = { style: "Regular", family: "Menlo" };
  text.characters = JSON.stringify(value, null, 4);

  frame.appendChild(text);
  frame.resize(text.width + 16, text.height);

  figma.currentPage.appendChild(frame);

  return frame;
}
