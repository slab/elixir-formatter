defmodule ElixirFormatterWeb.FormatterChannel do
  use ElixirFormatterWeb, :channel

  def join("formatter", payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (formatter:lobby).
  # def handle_in("shout", payload, socket) do
  #   broadcast socket, "shout", payload
  #   {:noreply, socket}
  # end

  def handle_in("format", %{"code" => code} = payload, socket) do
    try do
      parse_options(payload["options"] || %{})
    rescue
      _ ->
        {
          :reply,
          {:error, %{
            "error" => "Unknown",
            "description" => "Could not parse the `:locals_without_parens` options."
          }},
          socket
        }
    else
      options -> handle_formatting(socket, code, options)
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end

  defp parse_options(options) do
    locals = options["locals_without_parens"]

    options =
      if not is_nil(locals) do
        locals =
          locals
          |> String.trim()
          |> String.split(~r(,?\n), trim: true)
          |> Enum.map(fn local ->
               [name, arity] = String.split(local, ~r/:\s?/)
               {String.to_atom(name), String.to_integer(arity)}
             end)

        Map.merge(options, %{"locals_without_parens" => locals})
      else
        options
      end

    Enum.map(options, fn {key, value} -> {String.to_atom(key), value} end)
  end

  defp handle_formatting(socket, code, options) do
    try do
      result = code |> Code.format_string!(options) |> Enum.join()
      {:reply, {:ok, %{"result" => result}}, socket}
    rescue
      error in [SyntaxError, TokenMissingError, CompileError] ->
        {
          :reply,
          {:error, %{
            "error" => error.__struct__ |> Module.split() |> Enum.join("."),
            "description" => error.description,
            "line" => error.line
          }},
          socket
        }
    end
  end
end
