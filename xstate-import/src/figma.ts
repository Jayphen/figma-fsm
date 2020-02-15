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

    const frames = createArtboards(value.states, spacing, {
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

function createRectangles(count: number, spacing: number) {
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i++) {
    const rect = figma.createRectangle();
    rect.x = i * (spacing + rect.width);
    rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
    figma.currentPage.appendChild(rect);
    nodes.push(rect);
  }
  return nodes;
}
