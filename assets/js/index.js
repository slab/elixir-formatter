import ace from "brace";
import "brace/mode/elixir";
import "brace/theme/tomorrow";

import Clipboard from "clipboard";
import { Socket } from "phoenix";
import sample from "./sample_code";

function getChannel() {
  const socket = new Socket("/socket");
  socket.connect();

  const channel = socket.channel("formatter");
  channel.join();

  return channel;
}

function getEditor(id) {
  const editor = ace.edit(id);
  editor.getSession().setMode("ace/mode/elixir");
  editor.setTheme("ace/theme/tomorrow");
  editor.setOptions({
    fontFamily: "Inconsolata, 'SF Code', Menlo, monospace",
    fontSize: "14px"
  });

  return editor;
}

function configCopyButton(selector, sourceEditor) {
  const button = document.querySelector(selector);
  const clipboard = new Clipboard(selector, {
    text: () => sourceEditor.getValue()
  });
  const originalLabel = button.innerHTML;

  const changeHandler = () => {
    sourceEditor.off("change", changeHandler);
    button.innerHTML = originalLabel;
    button.style.width = "auto";
  };

  clipboard.on("success", ({ trigger }) => {
    const label = trigger.innerHTML;
    trigger.style.width = trigger.clientWidth + "px";
    trigger.innerText = "Copied!";

    sourceEditor.on("change", changeHandler);
  });

  return clipboard;
}

function configOptions(selector, modalSelector) {
  const button = document.querySelector(selector);
  const modal = document.querySelector(modalSelector);
  const inputs = modal.querySelectorAll("input, textarea");
  const options = {};
  let isOpen = null;

  function updateOptions() {
    for (const input of inputs) {
      const { name, type, value } = input;

      if (value === "") {
        delete options[name];
      } else {
        options[name] = type === "number" ? parseInt(value, 10) : value;
      }
    }
  }

  function setIsOpen(newState) {
    isOpen = newState;
    modal.style.display = isOpen ? "block" : "none";
    updateOptions();
    updateResult();
  }

  button.addEventListener("click", () => {
    setIsOpen(!isOpen);
  });

  document.addEventListener("click", e => {
    const { target } = e;
    if (
      target !== button &&
      target !== modal &&
      !modal.contains(target) &&
      isOpen
    ) {
      setIsOpen(false);
    }
  });

  setIsOpen(false);
  return options;
}

function formatError({ error, description, line }) {
  const lineInfo = line ? `line ${line}:\n  ` : "";
  return `${lineInfo}${error}: ${description}`;
}

function updateResult() {
  const code = inputEditor.getValue();
  channel
    .push("format", { code, options })
    .receive("ok", ({ result }) => {
      outputEditor.setValue(result, 1);
    })
    .receive("error", error => {
      outputEditor.setValue(formatError(error), 1);
    });
}

const channel = getChannel();
const inputEditor = getEditor("input");
const outputEditor = getEditor("output");
outputEditor.setReadOnly(true);

const options = configOptions("#options-button", "#options-window");

inputEditor.getSession().on("change", () => {
  updateResult();
});

configCopyButton("#copy-button", outputEditor);
inputEditor.setValue(sample, 1);
