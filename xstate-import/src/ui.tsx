import React, { useState } from "react";
import { render } from "react-dom";
import "./style.css";

function App() {
  const [state, setState] = useState({ count: 0, spacing: 0 });

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    setState(s => ({ ...s, [name]: value }));
  }

  function handleSubmit() {
    const { count, spacing } = state;

    parent.postMessage(
      {
        pluginMessage: {
          type: "create-rectangles",
          count,
          spacing
        }
      },
      "*"
    );
  }

  return (
    <div>
      <h2>Let's make some rectangles</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="count">Count</label>
        <input
          type="text"
          id="count"
          name="count"
          value={state.count}
          onChange={handleChange}
        />
        <label htmlFor="spacing">Spacing</label>
        <input
          type="text"
          id="spacing"
          name="spacing"
          value={state.spacing}
          onChange={handleChange}
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

render(<App />, document.getElementById("app"));
