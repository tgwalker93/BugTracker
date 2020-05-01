import React from "react";

export const TextArea = props =>
    <div className={props.formgroupclass}>
        <label htmlFor="bugDescriptionField">{props.label}</label>
        <textarea className="form-control" id="bugDescriptionField" rows="5" {...props}></textarea>
        {props.isvalid === "true" ? "" : <span className="help-block">{props.fielderror}</span>}
    </div>;
