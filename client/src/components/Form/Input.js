import React from "react";

export const Input = props =>
  <div className={props.formgroupclass}>

    <label htmlFor="inputField">{props.label}</label>
    <input className="form-control" id="inputField" {...props} />
    {props.isvalid === "true" ? "" : <span className="help-block">{props.fielderror}</span>}
  </div>;
