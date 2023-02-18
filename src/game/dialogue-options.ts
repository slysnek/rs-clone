export const options = {
  "dialogue-1": {
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
  }
}