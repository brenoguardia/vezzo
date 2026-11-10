#!/usr/bin/env node
// Servidor Node de produção: serve dist/client e as rotas de API (dist/server).
// Build: `bun run build:server` · Start: `bun run start:server`
const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("expo-server/adapter/express");

process.env.NODE_ENV = "production";

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(express.static(path.join(process.cwd(), "dist/client"), { maxAge: "1h", extensions: ["html"] }));
app.use(morgan("tiny"));
app.all("/{*all}", createRequestHandler({ build: path.join(process.cwd(), "dist/server") }));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Vezzo server em http://localhost:${port}`));
