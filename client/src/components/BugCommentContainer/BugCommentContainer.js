import React from "react";


export const BugCommentContainer = ({ children }) => (
    <div id="wrapper">
        <div id="bugs">
            {children}
        </div>
        <div id="bugComments"></div>
    </div>
);
