import React from "react";
import "./BugListTableRow.css";

export const BugListTableRow = props => (
        <tr className="bugViewTable_tr">
            <td className="bugViewTable_td">{ props.BugTitle }</td>
            <td className="bugViewTable_td">{ props.BugDescription }</td>
            <td className="bugViewTable_td">{props.BugDescription}</td>
        </tr>
);