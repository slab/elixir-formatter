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

  def handle_in("format", %{"code" => code}, socket) do
    result = code |> Code.format_string!() |> Enum.join()
    {:reply, {:ok, %{"result" => result}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
