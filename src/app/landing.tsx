"use client"

import Background from "@/app/background";
import Menu from "@/app/menu";
import React from "react";
import Image from "next/image";
import {Card, CardHeader} from "@heroui/card";
import Link from "next/link";

export default function Landing(props: any) {

    return (
        <>
            <Background />
            <main>
                <Menu isLanding={true} info={props.info} />
                <section className="flex items-center justify-center">
                    <div className="w-full">
                        <Link href="/play/today">
                            <Card isPressable className="panel h-[128px] w-full mt-8">
                                <CardHeader className="absolute z-10 top-1 flex-col items-start!">
                                    <p className="text-tiny text-white/60 uppercase font-bold">Play Daily</p>
                                    <h4 className="text-white font-medium text-large">Play...</h4>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href="/read">
                            <Card isPressable className="panel h-[128px] w-full mt-8">
                                <CardHeader className="absolute z-10 top-1 flex-col items-start!">
                                    <p className="text-tiny text-white/60 uppercase font-bold">Read</p>
                                    <h4 className="text-white font-medium text-large">Read and track...</h4>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href="/study">
                            <Card isPressable className="panel h-[128px] w-full mt-8">
                                <CardHeader className="absolute z-10 top-1 flex-col items-start!">
                                    <p className="text-tiny text-white/60 uppercase font-bold">Study</p>
                                    <h4 className="text-white font-medium text-large">Study...</h4>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href="/stats">
                            <Card isPressable className="panel h-[128px] w-full mt-8">
                                <CardHeader className="absolute z-10 top-1 flex-col items-start!">
                                    <p className="text-tiny text-white/60 uppercase font-bold">Statistics</p>
                                    <h4 className="text-white font-medium text-large">Stats...</h4>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href="/guess-who">
                            <Card isPressable className="panel h-[128px] w-full mt-8">
                                <CardHeader className="absolute z-10 top-1 flex-col items-start!">
                                    <p className="text-tiny text-white/60 uppercase font-bold">Guess Who</p>
                                    <h4 className="text-white font-medium text-large">Coming soon...</h4>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}