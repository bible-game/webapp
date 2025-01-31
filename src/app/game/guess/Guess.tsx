"use client"

import React from "react";
import { Card, CardBody } from "@nextui-org/card";

const Guess = (props: any) => {
    return  <Card className="flex flex-1 px-6 py-4 justify-around bg-opacity-30 bg-gray-800 text-white h-[3.5rem]">
                <CardBody>
                    <div className="flex justify-between">
                        <div><p className="text-xs">{props.book} {props.chapter}</p></div>
                        <div className="text-right"><p className="text-xs">{props.closeness}</p></div>
                    </div>
                </CardBody>
            </Card>
}

export default Guess;