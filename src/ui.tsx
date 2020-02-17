import React, { useState, useRef } from "react";
import { render } from "react-dom";
import "./style.css";

function App() {
  const [state, setState] = useState(JSON.stringify(getMockMachine(), null, 4));
  const machine = useRef<HTMLTextAreaElement>();

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
          spacing: 20
        }
      },
      "*"
    );
  }

  function findExistingStates() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "find-frames"
        }
      },
      "*"
    );
    onmessage = event => {
      machine.current.value = event.data.pluginMessage;
      machine.current.select();
      document.execCommand("copy");
    };
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
          ref={machine}
        />

        <button type="submit">Create</button>
        <br />
        <button type="button" onClick={findExistingStates}>
          Copy machine to clipboard
        </button>
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
