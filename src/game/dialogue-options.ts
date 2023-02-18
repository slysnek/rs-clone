export const options = {
  "dialogue-1": {
    "state-1": {
      "text": "This is option 1",
      "answers":
        [
          ["Answer 1 to option 1", "state-2"],
          ["Answer 2 to option 1", "state-3"]
        ],
    },
    "state-2": {
      "text": "This is option 2",
      "answers":
        [
          ["Answer 1 to option 2", "state-1"],
          ["Answer 2 to option 2", "state-3"]
        ],
    },
    "state-3": {
      "text": "This is option 3",
      "answers":
        [
          ["Answer 1 to option 3", "state-1"],
          ["Answer 2 to option 3", "state-2"]
        ],
    },
 /*    "state-4": {
      "text": "This is option 4",
      "answers":
      {
        "answer-1": {
          "answer-text": "Answer 1 to option 4",
          "link": "state-6"
        },
      }
    },
    "state-5": {
      "text": "This is option 5",
      "answers":
      {
        "answer-1": {
          "answer-text": "Answer 1 to option 5",
          "link": "game-begin"
        },
      }
    },
    "state-6": {
      "text": "This is option 6",
      "answers":
      {
        "answer-1": {
          "answer-text": "Answer 1 to option 6",
          "link": "state-5"
        },
      }
    }, */
  }
}