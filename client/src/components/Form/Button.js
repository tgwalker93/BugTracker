import React from "react";

export const Button = props =>
  <button {...props} className="btn btn-pill btn-light btn-lg">
    {props.children}
  </button>;
