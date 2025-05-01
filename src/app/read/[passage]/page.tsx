import React from "react";
import Navigation from "@/app/navigation";

function get(path: string): Promise<any> {
    return fetch(`${process.env.SVC_BIBLE}/${path}`, { method: "GET" })
        .then((response) => {
            return response.json()
        });
}

/**
 * Read Passage Page
 * @since 12th April 2025
 */
export default async function Read({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;
    // const text = (await get(passage))['text'];
    const verses: any = [
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 1,
            "text": "The high priest said, “Are these things so?”\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 2,
            "text": "He said, “Brothers and fathers, listen. The God of glory appeared to our father Abraham, when he was in Mesopotamia, before he lived in Haran,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 3,
            "text": "and said to him, ‘Get out of your land, and from your relatives, and come into a land which I will show you.’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 4,
            "text": "Then he came out of the land of the Chaldaeans, and lived in Haran. From there, when his father was dead, God moved him into this land, where you are now living.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 5,
            "text": "He gave him no inheritance in it, no, not so much as to set his foot on. He promised that he would give it to him for a possession, and to his offspring after him, when he still had no child.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 6,
            "text": "God spoke in this way: that his offspring would live as aliens in a strange land, and that they would be enslaved and mistreated for four hundred years.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 7,
            "text": "‘I will judge the nation to which they will be in bondage,’ said God, ‘and after that will they come out, and serve me in this place.’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 8,
            "text": "He gave him the covenant of circumcision. So Abraham became the father of Isaac, and circumcised him the eighth day. Isaac became the father of Jacob, and Jacob became the father of the twelve patriarchs.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 9,
            "text": "“The patriarchs, moved with jealousy against Joseph, sold him into Egypt. God was with him,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 10,
            "text": "and delivered him out of all his afflictions, and gave him favor and wisdom before Pharaoh, king of Egypt. He made him governor over Egypt and all his house.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 11,
            "text": "Now a famine came over all the land of Egypt and Canaan, and great affliction. Our fathers found no food.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 12,
            "text": "But when Jacob heard that there was grain in Egypt, he sent out our fathers the first time.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 13,
            "text": "On the second time Joseph was made known to his brothers, and Joseph’s race was revealed to Pharaoh.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 14,
            "text": "Joseph sent, and summoned Jacob, his father, and all his relatives, seventy-five souls.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 15,
            "text": "Jacob went down into Egypt, and he died, himself and our fathers,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 16,
            "text": "and they were brought back to Shechem, and laid in the tomb that Abraham bought for a price in silver from the children of Hamor of Shechem.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 17,
            "text": "“But as the time of the promise came close which God had sworn to Abraham, the people grew and multiplied in Egypt,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 18,
            "text": "until there arose a different king, who didn’t know Joseph.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 19,
            "text": "The same took advantage of our race, and mistreated our fathers, and forced them to throw out their babies, so that they wouldn’t stay alive.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 20,
            "text": "At that time Moses was born, and was exceedingly handsome. He was nourished three months in his father’s house.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 21,
            "text": "When he was thrown out, Pharaoh’s daughter took him up, and reared him as her own son.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 22,
            "text": "Moses was instructed in all the wisdom of the Egyptians. He was mighty in his words and works.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 23,
            "text": "But when he was forty years old, it came into his heart to visit his brothers, the children of Israel.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 24,
            "text": "Seeing one of them suffer wrong, he defended him, and avenged him who was oppressed, striking the Egyptian.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 25,
            "text": "He supposed that his brothers understood that God, by his hand, was giving them deliverance; but they didn’t understand.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 26,
            "text": "“The day following, he appeared to them as they fought, and urged them to be at peace again, saying, ‘Sirs, you are brothers. Why do you wrong one another?’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 27,
            "text": "But he who did his neighbor wrong pushed him away, saying, ‘Who made you a ruler and a judge over us?\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 28,
            "text": "Do you want to kill me, as you killed the Egyptian yesterday?’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 29,
            "text": "Moses fled at this saying, and became a stranger in the land of Midian, where he became the father of two sons.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 30,
            "text": "“When forty years were fulfilled, an angel of the Lord appeared to him in the wilderness of Mount Sinai, in a flame of fire in a bush.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 31,
            "text": "When Moses saw it, he wondered at the sight. As he came close to see, a voice of the Lord came to him,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 32,
            "text": "‘I am the God of your fathers, the God of Abraham, the God of Isaac, and the God of Jacob.’ Moses trembled, and dared not look.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 33,
            "text": "The Lord said to him, ‘Take off your sandals, for the place where you stand is holy ground.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 34,
            "text": "I have surely seen the affliction of my people that is in Egypt, and have heard their groaning. I have come down to deliver them. Now come, I will send you into Egypt.’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 35,
            "text": "“This Moses, whom they refused, saying, ‘Who made you a ruler and a judge?’—God has sent him as both a ruler and a deliverer by the hand of the angel who appeared to him in the bush.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 36,
            "text": "This man led them out, having worked wonders and signs in Egypt, in the Red Sea, and in the wilderness for forty years.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 37,
            "text": "This is that Moses, who said to the children of Israel, ‘The Lord our God will raise up a prophet for you from among your brothers, like me.’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 38,
            "text": "This is he who was in the assembly in the wilderness with the angel that spoke to him on Mount Sinai, and with our fathers, who received living revelations to give to us,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 39,
            "text": "to whom our fathers wouldn’t be obedient, but rejected him, and turned back in their hearts to Egypt,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 40,
            "text": "saying to Aaron, ‘Make us gods that will go before us, for as for this Moses, who led us out of the land of Egypt, we don’t know what has become of him.’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 41,
            "text": "They made a calf in those days, and brought a sacrifice to the idol, and rejoiced in the works of their hands.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 42,
            "text": "But God turned, and gave them up to serve the army of the sky, as it is written in the book of the prophets,\n‘Did you offer to me slain animals and sacrifices\nforty years in the wilderness, O house of Israel?\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 43,
            "text": "You took up the tabernacle of Moloch,\nthe star of your god Rephan,\nthe figures which you made to worship.\nI will carry you away beyond Babylon.’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 44,
            "text": "“Our fathers had the tabernacle of the testimony in the wilderness, even as he who spoke to Moses commanded him to make it according to the pattern that he had seen;\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 45,
            "text": "which also our fathers, in their turn, brought in with Joshua when they entered into the possession of the nations, whom God drove out before the face of our fathers, to the days of David,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 46,
            "text": "who found favor in the sight of God, and asked to find a habitation for the God of Jacob.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 47,
            "text": "But Solomon built him a house.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 48,
            "text": "However, the Most High doesn’t dwell in temples made with hands, as the prophet says,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 49,
            "text": "‘heaven is my throne,\nand the earth a footstool for my feet.\nWhat kind of house will you build me?’ says the Lord.\n‘Or what is the place of my rest?\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 50,
            "text": "Didn’t my hand make all these things?’\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 51,
            "text": "“You stiff-necked and uncircumcised in heart and ears, you always resist the Holy Spirit! As your fathers did, so you do.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 52,
            "text": "Which of the prophets didn’t your fathers persecute? They killed those who foretold the coming of the Righteous One, of whom you have now become betrayers and murderers.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 53,
            "text": "You received the law as it was ordained by angels, and didn’t keep it!”\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 54,
            "text": "Now when they heard these things, they were cut to the heart, and they gnashed at him with their teeth.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 55,
            "text": "But he, being full of the Holy Spirit, looked up steadfastly into heaven, and saw the glory of God, and Jesus standing on the right hand of God,\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 56,
            "text": "and said, “Behold, I see the heavens opened, and the Son of Man standing at the right hand of God!”\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 57,
            "text": "But they cried out with a loud voice, and stopped their ears, and rushed at him with one accord.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 58,
            "text": "They threw him out of the city, and stoned him. The witnesses placed their garments at the feet of a young man named Saul.\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 59,
            "text": "They stoned Stephen as he called out, saying, “Lord Jesus, receive my spirit!”\n"
        },
        {
            "book_id": "ACT",
            "book_name": "Acts",
            "chapter": 7,
            "verse": 60,
            "text": "He kneeled down, and cried with a loud voice, “Lord, don’t hold this sin against them!” When he had said this, he fell asleep.\n"
        }
    ];
    const text = "The high priest said, “Are these things so?” He said, “Brothers and fathers, listen. The God of glory appeared to our father Abraham, when he was in Mesopotamia, before he lived in Haran, and said to him, ‘Get out of your land, and from your relatives, and come into a land which I will show you.’ Then he came out of the land of the Chaldaeans, and lived in Haran. From there, when his father was dead, God moved him into this land, where you are now living. He gave him no inheritance in it, no, not so much as to set his foot on. He promised that he would give it to him for a possession, and to his offspring after him, when he still had no child. God spoke in this way: that his offspring would live as aliens in a strange land, and that they would be enslaved and mistreated for four hundred years. ‘I will judge the nation to which they will be in bondage,’ said God, ‘and after that will they come out, and serve me in this place.’ He gave him the covenant of circumcision. So Abraham became the father of Isaac, and circumcised him the eighth day. Isaac became the father of Jacob, and Jacob became the father of the twelve patriarchs. “The patriarchs, moved with jealousy against Joseph, sold him into Egypt. God was with him, and delivered him out of all his afflictions, and gave him favor and wisdom before Pharaoh, king of Egypt. He made him governor over Egypt and all his house. Now a famine came over all the land of Egypt and Canaan, and great affliction. Our fathers found no food. But when Jacob heard that there was grain in Egypt, he sent out our fathers the first time. On the second time Joseph was made known to his brothers, and Joseph’s race was revealed to Pharaoh. Joseph sent, and summoned Jacob, his father, and all his relatives, seventy-five souls. Jacob went down into Egypt, and he died, himself and our fathers, and they were brought back to Shechem, and laid in the tomb that Abraham bought for a price in silver from the children of Hamor of Shechem. “But as the time of the promise came close which God had sworn to Abraham, the people grew and multiplied in Egypt, until there arose a different king, who didn’t know Joseph. The same took advantage of our race, and mistreated our fathers, and forced them to throw out their babies, so that they wouldn’t stay alive. At that time Moses was born, and was exceedingly handsome. He was nourished three months in his father’s house. When he was thrown out, Pharaoh’s daughter took him up, and reared him as her own son. Moses was instructed in all the wisdom of the Egyptians. He was mighty in his words and works. But when he was forty years old, it came into his heart to visit his brothers, the children of Israel. Seeing one of them suffer wrong, he defended him, and avenged him who was oppressed, striking the Egyptian. He supposed that his brothers understood that God, by his hand, was giving them deliverance; but they didn’t understand. “The day following, he appeared to them as they fought, and urged them to be at peace again, saying, ‘Sirs, you are brothers. Why do you wrong one another?’ But he who did his neighbor wrong pushed him away, saying, ‘Who made you a ruler and a judge over us? Do you want to kill me, as you killed the Egyptian yesterday?’ Moses fled at this saying, and became a stranger in the land of Midian, where he became the father of two sons. “When forty years were fulfilled, an angel of the Lord appeared to him in the wilderness of Mount Sinai, in a flame of fire in a bush. When Moses saw it, he wondered at the sight. As he came close to see, a voice of the Lord came to him, ‘I am the God of your fathers, the God of Abraham, the God of Isaac, and the God of Jacob.’ Moses trembled, and dared not look. The Lord said to him, ‘Take off your sandals, for the place where you stand is holy ground. I have surely seen the affliction of my people that is in Egypt, and have heard their groaning. I have come down to deliver them. Now come, I will send you into Egypt.’ “This Moses, whom they refused, saying, ‘Who made you a ruler and a judge?’—God has sent him as both a ruler and a deliverer by the hand of the angel who appeared to him in the bush. This man led them out, having worked wonders and signs in Egypt, in the Red Sea, and in the wilderness for forty years. This is that Moses, who said to the children of Israel, ‘The Lord our God will raise up a prophet for you from among your brothers, like me.’ This is he who was in the assembly in the wilderness with the angel that spoke to him on Mount Sinai, and with our fathers, who received living revelations to give to us, to whom our fathers wouldn’t be obedient, but rejected him, and turned back in their hearts to Egypt, saying to Aaron, ‘Make us gods that will go before us, for as for this Moses, who led us out of the land of Egypt, we don’t know what has become of him.’ They made a calf in those days, and brought a sacrifice to the idol, and rejoiced in the works of their hands. But God turned, and gave them up to serve the army of the sky, as it is written in the book of the prophets, ‘Did you offer to me slain animals and sacrifices forty years in the wilderness, O house of Israel? You took up the tabernacle of Moloch, the star of your god Rephan, the figures which you made to worship. I will carry you away beyond Babylon.’ “Our fathers had the tabernacle of the testimony in the wilderness, even as he who spoke to Moses commanded him to make it according to the pattern that he had seen; which also our fathers, in their turn, brought in with Joshua when they entered into the possession of the nations, whom God drove out before the face of our fathers, to the days of David, who found favor in the sight of God, and asked to find a habitation for the God of Jacob. But Solomon built him a house. However, the Most High doesn’t dwell in temples made with hands, as the prophet says, ‘heaven is my throne, and the earth a footstool for my feet. What kind of house will you build me?’ says the Lord. ‘Or what is the place of my rest? Didn’t my hand make all these things?’ “You stiff-necked and uncircumcised in heart and ears, you always resist the Holy Spirit! As your fathers did, so you do. Which of the prophets didn’t your fathers persecute? They killed those who foretold the coming of the Righteous One, of whom you have now become betrayers and murderers. You received the law as it was ordained by angels, and didn’t keep it!” Now when they heard these things, they were cut to the heart, and they gnashed at him with their teeth. But he, being full of the Holy Spirit, looked up steadfastly into heaven, and saw the glory of God, and Jesus standing on the right hand of God, and said, “Behold, I see the heavens opened, and the Son of Man standing at the right hand of God!” But they cried out with a loud voice, and stopped their ears, and rushed at him with one accord. They threw him out of the city, and stoned him. The witnesses placed their garments at the feet of a young man named Saul. They stoned Stephen as he called out, saying, “Lord Jesus, receive my spirit!” He kneeled down, and cried with a loud voice, “Lord, don’t hold this sin against them!” When he had said this, he fell asleep.";
    const wordsPerMinute = 200;
    const readingTime = `${calculateReadingTime()} minute read`;

    function calculateReadingTime() {
        if (!!text) {
            const words = text.split(' ');

            return Math.ceil(words.length / wordsPerMinute);

        } else return '';
    }

    return (
        <>
            <div className="bg-white absolute top-0 left-0 w-full">
                <div className="flex justify-center">
                    <Navigation stats={true} play={true}/>
                    <main className="h-full w-[40rem] text-black">
                        <div className="h-[114px]">
                            <h1 className="mb-3 text-lg">{passage}</h1>
                            <h1 className="mb-6">
                                <br/><span className="text-gray-400 text-sm">({readingTime})</span>
                            </h1>
                        </div>
                        <div>
                            {verses.map((verse: any) => <p className="my-4"><span className="text-gray-400 text-xs">{verse.verse} </span> {verse.text}</p>)}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}