"use client"

import React from "react";

const Leaf = (props: any) => {
    const [hidden, setHidden] = React.useState(true);

    return <div className="m-2 p-2 bg-blue-950 cursor-pointer h-[2.5rem]" onClick={(): void => setHidden(!hidden)}>
        {hidden ? "" : props.content}
    </div>
}

export default Leaf;