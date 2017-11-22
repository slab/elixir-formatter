import { Socket } from "phoenix";
import ace from "brace";
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

  return editor;
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
