const badWords: string[] = ['employement', 'job', 'occupation', 'shift', 'overtime', 'deadline'];

const chatFilter = (slot: number, message: string): Bit => {
    for (const badWord of badWords) {
        if (message.indexOf(badWord) !== -1) {
            mxserver.send(slot, "You cannot use profanity in this server!");
            return 1;
        }
    }
    return chatFilterPrev(slot, message);
}

var chatFilterPrev = mxserver.chat_handler;
mxserver.chat_handler = chatFilter;

export { }; // Added to examples only to mark as module so doesn't conflict with any code you write
