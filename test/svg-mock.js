const React = require("react");
const { View } = require("react-native");

// SVG importado como componente (ver metro.config.js): no Jest vira uma View com as mesmas props.
module.exports = { __esModule: true, default: (props) => React.createElement(View, props) };
