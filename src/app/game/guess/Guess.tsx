"use client"

import React from "react";
import { Card, CardBody } from "@nextui-org/card";

const Guess = (props: any) => {
    return  <Card className="max-w-full flex justify-center mt-1 px-8 py-4 bg-opacity-40 bg-gray-800 text-white">
                <CardBody>
                    <div className="flex justify-between">
                        <div><p>{props.book}</p></div>
                        <div><p>{props.title}</p></div>
                        <div><p>{props.closeness}</p></div>
                    </div>
                </CardBody>
            </Card>
}

export default Guess;