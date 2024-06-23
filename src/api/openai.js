import axios from 'axios';

const API_KEY = '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';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 1000;

export const sendMessage = async (message, context = '', onMessageChunk) => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/gpt-4/completions',
        {
          prompt: `${context}\n${message}`,
          max_tokens: 150,
          n: 1,
          stop: null,
          temperature: 0.7,
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );

      const responseText = response.data.choices[0].text;
      const chunkSize = 10;
      let offset = 0;

      while (offset < responseText.length) {
        const chunk = responseText.slice(offset, offset + chunkSize);
        onMessageChunk(chunk);
        offset += chunkSize;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
      }

      return; // Exit the function if the request was successful

    } catch (error) {
      console.error('Error sending message:', error);

      retryCount += 1;

      if (retryCount >= MAX_RETRIES) {
        throw error; // Re-throw the error if the max retries have been reached
      }

      console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS)); // Wait before retrying
    }
  }
};
