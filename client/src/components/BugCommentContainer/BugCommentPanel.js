import React from "react";

export const BugCommentPanel = props => (
    <div className='panel panel-default'>
        <div className='panel-body note-panel'>
            <p className="comment-text"> {props.text} </p>
            {props.children}
            <p className="date-text">{props.date}</p>
        </div>
    </div>
);
