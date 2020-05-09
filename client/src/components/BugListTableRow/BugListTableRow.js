import React from "react";
import "./BugListTableRow.css";

export const BugListTableRow = props => (
    <tr className="bugViewTable_tr" >
        <td className="bugViewTable_td"></td>
        <td className="bugViewTable_td"></td>
        <td className="bugViewTable_td"></td>
        <td id="editColumn" className="bugViewTable_td">
        </td>

        <td id="deleteColumn" className="bugViewTable_td"></td>
    </tr>
);