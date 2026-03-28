// entry point of react app
// renders the main App component into the root div

var React = require("react");
var ReactDOM = require("react-dom/client");
var App = require("./App").default;

var root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
