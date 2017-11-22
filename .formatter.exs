[
  inputs: [
    "lib/**/*.{ex,exs}"
  ],

  locals_without_parens: [
    # Formatter tests
    assert_format: 2,
    assert_format: 3,
    assert_same: 1,
    assert_same: 2,

    # Errors tests
    assert_eval_raise: 3,

    # Mix tests
    in_fixture: 2,
    in_tmp: 2,

    render: 2,
    plug: 1,
    plug: 2,

    # socket
    channel: 2,
    socket: 2,
    transport: 2,
  ]
]