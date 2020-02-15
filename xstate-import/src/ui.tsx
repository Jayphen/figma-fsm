import React, { useState } from "react";
import { render } from "react-dom";
import "./style.css";

function App() {
  const [state, setState] = useState(JSON.stringify(getMockMachine(), null, 4));

  function handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;

    setState(value);
  }

  function handleSubmit() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "create-frames",
          value: state,
          spacing: 16
        }
      },
      "*"
    );
  }

  return (
    <>
      <h2>a clever name</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="machine">Pop your state machine in here please</label>
        <textarea
          id="machine"
          name="machine"
          value={state}
          onChange={handleChange}
        />

        <button type="submit">Create</button>
      </form>
    </>
  );
}

render(<App />, document.getElementById("app"));

function getMockMachine() {
  return {
    id: "package",
    initial: "invalid",
    context: {
      retries: 0,
      items: [{ valid: true }, { valid: true }]
    },
    states: {
      invalid: {
        on: {
          VALIDATE: [
            {
              target: "valid",
              cond: "productsAreValid"
            },
            { target: "invalid" }
          ]
        }
      },
      valid: {
        on: {
          FETCH_PRICE: "fetching_price"
        }
      },
      fetching_price: {
        on: {
          RESOLVE: "buyable",
          REJECT: "error"
        }
      },
      buyable: {
        on: {
          ADD_TO_CART: [
            {
              target: "added"
            },
            { target: "failed" }
          ]
        }
      },
      failed: {},
      added: {
        on: {
          VALIDATE: [
            {
              target: "valid",
              cond: "productsAreValid"
            },
            { target: "invalid" }
          ]
        }
      },
      error: {
        on: {
          RETRY: {
            target: "fetching_price"
          }
        }
      }
    }
  };
}
