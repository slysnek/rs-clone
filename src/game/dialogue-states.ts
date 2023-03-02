export const options = {
  "dialogue-1": {
    "state-0": {
      "text": "",
      "answers":
        [
        ],
    },
    "state-1": {
      "text": "Greetings, The Chosen One. Once again the people of Vault 13 are in desperate need of your help.  Will be you be able to prove your loyalty to us this time?",
      "answers":
        [
          ["I’m always ready to help and to ease the burden my people struggle with. What should I do?", "state-2"],
          ["Nah, I don’t think so. C’mon, I’ve already got you a water chip. Can’t you just leave me alone?", "state-3"]
        ],
    },
    "state-2": {
      "text": "Great! Now you should listen to me carefully. There is a forest nearby, our people go there to gather some valuable plants for science purposes. Last time when our scavenge group came there, they heard terrifying shrieks and ran away. Can you go there and see what’s going on?",
      "answers":
        [
          ["Sounds pretty dangerous. Is there any else I should know?", "state-4"],
          ["Yeah, I’ll check it out. Where should I go exactly?", "state-5"]
        ],
    },
    "state-3": {
      "text": "No. Either you go there voluntarily or you can find yourself a new Vault to live in.",
      "answers":
        [
          ["Okay, okay… I agree. So what’s the deal about?", "state-2"],
          ["Please, don’t throw me away! I’ll do whatever you say, Observer!", "state-5"]
        ],
    },
    "state-4": {
      "text": "The scientific team says that before they left the forest, they had seen some strange silhouettes between trees that looked like humans. However, no human could produce such horrible sounds with their voices.",
      "answers":
        [
          ["Interesting… It seems to me that these creatures may be ghouls but I haven’t seen a ghoul around here for years.", "state-6"],
        ],
    },
    "state-5": {
      "text": "Here are the coordinates where our people heard the shrieks. Be careful, The Chosen One, we need you alive.",
      "answers":
        [
          ["[start the mission]", "state-0"],
        ],
    },
    "state-6": {
      "text": "Everything around changes constantly, The Chosen One. The Great War showed us that we must be ready for everything.",
      "answers":
        [
          ["You’re right. So, where should I go?", "state-5"],
        ],
    },
  },
  "dialogue-2": {
    "state-0": {
      "text": "",
      "answers":
        [
        ],
    },
    "state-1": {
      "text": "Welcome back, The Chosen one. Didn’t expect you to return soon. Tell me, what did you encounter in the forest?",
      "answers":
        [
          ["My assumption that it was ghouls was right.", "state-2"],
        ],
    },
    "state-2": {
      "text": "Ghouls… I have heard that some of these creatures still have some functioning parts of their brains and it is even possible to talk with them. ",
      "answers":
        [
          ["Not with these guys. They were feral ghouls – humans that completely lost their mind after The Great War.", "state-3"],
        ],
    },
    "state-3": {
      "text": "So… You killed them?",
      "answers":
        [
          ["Yes… It was not the first time I had to deal with these things.  Every time I see these things I remember Necropolis… That was a real challenge back then and I wouldn’t want to do it again.", "state-4"],
          ["No, we opened some beers and grilled some barbeque together. What else could I do with some crazy blood-thirsty creatures who completely lost their mind and wanted to kill you on sight?!", "state-5"]
        ],
    },
    "state-4": {
      "text": "I understand. Thank you, The Chosen one, you really did a job there.",
      "answers":
        [
          ["No problems. I am always ready to help you and the dwellers of Vault 13.", "state-6"],
        ],
    },
    "state-5": {
      "text": "Ha-ha. Really funny. No need to be cocky, The Chosen One. You did us a great favour and we will never forget that.",
      "answers":
        [
          ["Okay, I’m sorry. I didn’t want to be rude. So after all I’ve done, can I finally enjoy my rest?", "state-6"],
        ],
    },
    "state-6": {
      "text": "Actually… There is one more thing you could do right now.",
      "answers":
        [
          ["What is that?", "state-7"],
          ["Are you serious? I just came after a messy fight and you want me to do something else? ", "state-8"],
        ],
    },
    "state-7": {
      "text": "Our scavengers spotted a junkyard to the East of our Vault. There is nothing much to be honest, only rusty cars, dust and trash. However, some cars still may have intact engines. Some parts of these engines worth its weight in gold. Our engineers can use them to fix our own machinery or we can trade them for vital resources at worst. We cannot miss that chance, The Chosen one.",
      "answers":
        [
          ["If these things are so valuable, I think it is my duty to go there and collect them. But I think there is something else you didn’t say to me, did you?", "state-9"],
          ["And why is that my responsibility now? Don’t we have other people to wander around and gather junk?", "state-9"],
        ],
    },
    "state-8": {
      "text": "You must understand that you are practically the only person that is capable of surviving outside for a long period of time. I don’t think that we have people that can perform such a task.",
      "answers":
        [
          ["Well, so, what do you want from me?", "state-7"],
        ],
    },
    "state-9": {
      "text": "Well, you see, our mechanic – Michael, the guy who is capable of disassembling engines, happens to be a huge arachnophobe. He hates spiders, scorpions and everything that has more than 4 legs with all his soul. And you won’t believe whom this junkyard is infested with…",
      "answers":
        [
          ["Radscorpions?! Jesus Christ, these things are pure terror! And you want me deal with them? I don’t think I would be able to perform such a task… ", "state-12"],
          ["Observer, are you out of your mind? If you didn’t know Radscorpions can kill you with one hit. Their stings are poisonous, people die from them in great agony.", "state-12"],
          ["Scorpions? Piece of cake! I’ve dealt with these creatures million times. Send me the coordinates of this place, I’ll deal with them in a second.", "state-10"],
        ],
    },
    "state-10": {
      "text": "Good. Here are the coordinates of this place. Clear the junkyard and come back alive, I’ll send Michael after you.",
      "answers":
        [
          ["[start mission]", "state-0"],
          ["Wait. He will not back me up?", "state-11"],
        ],
    },
    "state-11": {
      "text": "No. Right now he is busy with other thinks.",
      "answers":
        [
          ["Okay… Guess I have no choice [start mission]", "state-0"],
        ],
    },
    "state-12": {
      "text": "Look, I know it is very dangerous. But you should understand that we struggle now. Nearby cities sell everything at exorbitant prices. We don't have an ace up our sleeve. Our own resources are very limited and we must seize every opportunity we can. If you don’t want to help – fine, it is your choice. But your decision reduces the amount of days we are able to live.",
      "answers":
        [
          ["I guess you’re right. I am responsible for the lives of people that live in Vault and I must do everything I can, while I am still able to, to protect them. I’ll go.", "state-10"],
          ["These are certainly persuasive words but… Ah, whatever, I’ll do it. Just please, leave me alone after I finish this task.", "state-10"],
        ],
    },
  },
  "dialogue-3": {
    "state-0": {
      "text": "",
      "answers":
        [
        ],
    },
    "state-1": {
      "text": "You look… messy. Are you okay?",
      "answers":
        [
          ["Yes. The fight was tough but I managed to do it. You can send Michael now, the place is safe.", "state-3"],
          ["I don’t know… I think the scorpions stung me a few times. It hurts like hell and my vision is blurry… This time I reckon I really got lucky. ", "state-2"],
        ],
    },
    "state-2": {
      "text": "But you managed to do it. I don’t even know how to thank you, The Chosen One. You are truly a great warrior and devoted dweller of Vault 13. What you have done will have a huge impact on our well being. If there weren’t you I don’t know if we would survive.",
      "answers":
        [
          ["Yeah, yeah… Thanks I guess. I think I’ll go and rest a bit.", "state-4"],
        ],
    },
    "state-3": {
      "text": "Oh, thank you, The Chosen One. I’ll tell him immediately. We cannot lose any precious time. Go and rest a bit but not for a long.",
      "answers":
        [
          ["What do you mean ‘not for a long’? Haven’t I done enough already?", "state-5"],
          ["Hold on. Do you want me to do something else?", "state-5"]
        ],
    },
    "state-4": {
      "text": "Yes, of course, you deserve resting. I’m afraid, however, your rest won’t be long…",
      "answers":
        [
          ["What do you mean ‘not for a long’? Haven’t I done enough already?", "state-5"],
          ["Hold on. Do you want me to do something else?", "state-5"]
        ],
    },
    "state-5": {
      "text": "Yes. But before you complain – I must say, I didn’t want to bother you anymore. While you were out doing your job our recon met a man nearly our Vault entrance. You know our policy – usually we don’t talk with strangers but this man was seriously hurt and barely alive. We let him in and gave him first aid. It seems that he was mutilated by something really big and scary.",
      "answers":
        [
          ["Wait. We don’t let any strangers into our Vault and you know that. What if it was a spy or a raider? And what is more important – how does it concern me?", "state-6"],
          ["Well, it is unfortunate for the guy. Thank God, our people helped him.", "state-7"],
          ["I don’t think it was a good idea. It would be better if they let him die. We have not time and resources for mercy.", "state-8"]
        ],
    },
    "state-6": {
      "text": "I know and when I heard about this I was furious. However, this man gave us some really valuable information.",
      "answers":
        [
          ["What is it? ", "state-9"],
        ],
    },
    "state-7": {
      "text": "Well, I had a different opinion on this matter. We cannot afford caring about strangers. However, this man gave us some really valuable information.",
      "answers":
        [
          ["What is it? ", "state-9"],
        ],
    },
    "state-8": {
      "text": "These are cruel words but… Maybe you’re right. We cannot afford caring about strangers. However, this man gave us some really valuable information.",
      "answers":
        [
          ["What is it? ", "state-9"],
        ],
    },
    "state-9": {
      "text": "It seems to be that about 6-7 miles to the north there is an abandoned parking lot. It is surrounded by walls and has only one entrance to it. There are some cars left but I don’t think they are worth that much. The real treasure is a few fuel cisterns that seem to have gas in them.",
      "answers":
        [
          ["How can you that this man can be trusted? What if this is a trap?", "state-10"],
          ["That sounds great. We should check this place as soon as possible.", "state-11"],
          ["Observer, you’re scaring me. I don’t believe that it is simply possible that this place exists and no one, I repeat, NO ONE has placed their hands on such a valuable stuff already.", "state-12"],
        ],
    },
    "state-10": {
      "text": "Well, I have some good news and bad news for you. The good news is that this place is definitely not a trap. The bad news – this parking lot is a home for several deathclaws.",
      "answers":
        [
          ["I heard you right? Deathclaws?", "state-13"],
        ],
    },
    "state-11": {
      "text": "Hold your horses, The Chosen one. The thing is – it would not be possible to seize the gas without the fight. The place is riddled with Deathclaws.",
      "answers":
        [
          ["I heard you right? Deathclaws?", "state-13"],
        ],
    },
    "state-12": {
      "text": "Well, you are right. Someone has already put their hands. Or, I must say, paws. With long claws. Long deadly claws.",
      "answers":
        [
          ["I heard you right? Deathclaws?", "state-13"],
        ],
    },
    "state-13": {
      "text": "Yes… The man who we brought here was a part of group that had lived at that parking lot. They traded gas for some resources and managed to survive for some time. However, last night a flock of deathclaws attacked this place. As I understood, that man was the luckiest. He asked us to see if anyone survived and if we find something valuable we can take it.",
      "answers":
        [
          ["Sounds like a suicide mission. I don’t think that even I can handle several deathclaws. It is too much. ", "state-14"],
          ["Poor man… Listen, I really want to help him, but I don’t think it would be possible. It is really dangerous.", "state-14"],
          ["Whatever valuable is there, I won’t go! The group of several people was destroyed and you want me to go there?", "state-14"],
        ],
    },
    "state-14": {
      "text": "Look, here’s the thing. A representative from NCR contacted me a while ago and asked if we had some fuel. Apparently they have some shortage in gas and they are ready to pay big. Really big. Food, ammo, spare parts, whatever we want. Nowadays gas is like a liquid gold. If we manage to get it, we won’t have to risk our lives anymore. That’s our lucky ticket here, The Chosen One.",
      "answers":
        [
          ["Now that you have said this… Damn. It is really our chance.", "state-15"],
          ["I guess I cannot say ‘no’ to this one. We must seize this opportunity.", "state-15"],
        ],
    },
    "state-15": {
      "text": "That’s right. Now get a good rest, gather all the necessary supplies and go. I know you will succeed.",
      "answers":
        [
          ["Okay. I won’t waste any time. [get a rest and start mission]", "state-0"],
          ["Wait. Can I bring someone with me to help me to fight?", "state-16"],
        ],
    },
    "state-16": {
      "text": "Well, you can ask people if you want. But I don’t think that someone will agree. You are basically the only person who has dealt with dangerous monsters. Even the recon team – they don’t go far and they flee as soon as they see something dangerous. I think you’re on your own.",
      "answers":
        [
          ["I didn’t even think about this. You're right, I'd better without people.", "state-17"],
          ["Actually, I think it would be better to do this alone. Other people would get in my way.  ", "state-17"],
        ],
    },
    "state-17": {
      "text": "Do as you want, The Chosen One, but come back alive. Good luck.",
      "answers":
        [
          ["Goodbye, Observer [get a rest and start mission]", "state-0"],
        ],
    },
  }
}