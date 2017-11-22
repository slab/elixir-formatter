import ace from "brace";
import Clipboard from "clipboard";
import { Socket } from "phoenix";

require("brace/mode/elixir");
require("brace/theme/tomorrow");

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
  };

  clipboard.on("success", ({ trigger }) => {
    const label = trigger.innerHTML;
    trigger.innerText = "Copied!";

    sourceEditor.on("change", changeHandler);
  });

  return clipboard;
}

function formatError({ error, description, line }) {
  return `line ${line}:\n  ${description}`;
}

const channel = getChannel();
const inputEditor = getEditor("input");
const outputEditor = getEditor("output");
outputEditor.setReadOnly(true);

inputEditor.getSession().on("change", e => {
  const code = inputEditor.getValue();
  channel
    .push("format", { code })
    .receive("ok", ({ result }) => {
      outputEditor.setValue(result, 1);
    })
    .receive("error", error => {
      outputEditor.setValue(formatError(error), 1);
    });
});

configCopyButton("#copy-button", outputEditor);
