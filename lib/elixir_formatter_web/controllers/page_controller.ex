defmodule ElixirFormatterWeb.PageController do
  use ElixirFormatterWeb, :controller

  def index(conn, _params) do
    conn
    |> assign(:elixir_version, System.version())
    |> render("index.html")
  end
end
