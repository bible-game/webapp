"use server"

import React from "react";
import Game from "@/app/game/Game";
import { promises as fs } from 'fs';
import {GetServerSideProps, InferGetServerSidePropsType} from "next";

type Passage = {
    book: string
    chapter: number
    title: string
}

export const getServerSideProps = (async () => {
    const res = await fetch(`${process.env.passageService}/daily`)
    const passage: Passage = await res.json()

    const file: any = await fs.readFile(`${process.cwd()}/${process.env.bibleConfig}`, 'utf8');
    const bible: any = JSON.parse(file);

    return { props: { bible, passage } }
}) satisfies GetServerSideProps<{ bible: any, passage: Passage }>

export default async function Page({bible, passage}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return <Game bible={bible} passage={passage}/>
}