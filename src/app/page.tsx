"use server"

import React from "react";
import Game from "@/app/game/Game";

export default async function Page() {

    const bible = { oldTestament, newTestament }

    const passage = {
        division: 'history',
        book: 'nehemiah',
        chapters: '3-4',
        summary: 'Building and defending Jerusalem’s walls amid opposition.'
    }

    return <Game bible={bible} passage={passage} />
}

const acts = {
    '7-8': {
        book: 'acts',
        chapters: '7-8',
        summary: 'Stephen recounts Israel\'s history, condemns resistance'
    }
}

const nehemiah = {
    '1-2': {

    },
    '3-4': {
        book: 'acts',
        chapters: '3-4',
        summary: 'Building and defending Jerusalem’s walls amid opposition.'
    }
}

const theLaw = {  };
const history = { nehemiah };
const poetry = {  };
const majorProphets = { };
const minorProphets = { };

const gospels = {  };
const earlyChurch = { acts };
const paulineEpistles = {  };
const generalEpistles = {  };
const prophecy = {  };

const oldTestament = { theLaw, history, poetry, majorProphets, minorProphets }
const newTestament = { gospels, earlyChurch, paulineEpistles, generalEpistles, prophecy }