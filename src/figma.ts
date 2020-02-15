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

    const spacing = valueOrOne(msg.spacing);

    const frames = await createArtboards(value.states, spacing, {
      prefix: MACHINE_NAME
    });

    const debugFrame = await createDebugArtboard(value);

    figma.viewport.scrollAndZoomIntoView([...frames, debugFrame]);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

function valueOrOne(val: string) {
  const num = parseInt(val, 10);

  if (num < 1) {
    return 1;
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

  for (let i = 0; i < allStates.length; i++) {
    const frame = figma.createFrame();

    frame.x = i * (spacing + frame.width);

    frame.name = `${opts.prefix} - ${allStates[i]}`;

    const events = await printEvents(states[allStates[i]]);
    events && frame.appendChild(events);

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

  const text = figma.createText();
  text.characters = events.join(" / ");

  return text;
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
  text.fontName = { style: "Regular", family: "Menlo" };
  text.characters = JSON.stringify(value, null, 4);

  frame.appendChild(text);
  frame.resize(text.width + 16, text.height);

  figma.currentPage.appendChild(frame);

  return frame;
}
