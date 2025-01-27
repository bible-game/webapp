"use client"

import React from "react";

const Leaf = (props: any) => {
    const [hidden, setHidden] = React.useState(false); // true

    // onClick={(): void => setHidden(!hidden)}

    return <div className="m-2 p-2 bg-blue-950 cursor-pointer h-[2.5rem] rounded-full text-center">
        {hidden ? "" : props.content}
    </div>
}

export default Leaf;