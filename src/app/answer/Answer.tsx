"use client"

import React from "react";
import styles from "./Answer.module.sass"

const Answer = (props) => {

    return (
        <section id={styles.answer} className="flex justify-center mt-8">
            <p>{props.answer}</p>
        </section>
    )
}

export default Answer;