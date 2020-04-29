import React from "react";

export const Container = props =>
  <div id={props.id} className={`container${props.fluid === "true"  ? "-fluid" : ""}`} {...props}>
    {props.children}
  </div>;
