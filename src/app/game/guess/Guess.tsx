"use client"

import React from "react";
import { Card, CardBody } from "@nextui-org/card";

const Guess = (props: any) => {
    return  <Card className="max-w-full flex flex-1 justify-between px-8 py-4 bg-opacity-30 bg-gray-800 text-white h-[56px]">
                <CardBody>
                    <div className="flex justify-between">
                        <div><p className="text-sm">{props.book} {props.chapter}</p></div>
                        <div className="text-right"><p className="text-sm">{props.closeness}</p></div>
                    </div>
                </CardBody>
            </Card>
}

export default Guess;