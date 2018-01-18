#!/usr/bin/env bash
npm install
npm run build
mix do deps.get, deps.compile, compile, phx.digest
