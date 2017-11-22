defmodule ElixirFormatterWeb.FormatterChannelTest do
  use ElixirFormatterWeb.ChannelCase

  alias ElixirFormatterWeb.FormatterChannel

  setup do
    {:ok, _, socket} =
      socket("user_id", %{some: :assign})
      |> subscribe_and_join(FormatterChannel, "formatter")

    {:ok, socket: socket}
  end

  test "ping replies with status ok", %{socket: socket} do
    ref = push socket, "ping", %{"hello" => "there"}
    assert_reply ref, :ok, %{"hello" => "there"}
  end

  test "formatting", %{socket: socket} do
    ref = push socket, "format", %{"code" => ~s(%{"hello"=>"world"})}
    assert_reply ref, :ok, %{"result" => ~s(%{"hello" => "world"})}
  end
end
