import { mockChatMessages } from '../utils/mockData';

// TODO: Replace with actual API call
export const getChatHistory = async () => {
  // return api.get('/chat/history');
  return Promise.resolve({ data: mockChatMessages });
};

// TODO: Replace with actual API call
export const sendMessage = async (message) => {
  // return api.post('/chat/send', { message });
  return Promise.resolve({
    data: {
      id: 'msg_' + Date.now(),
      role: 'assistant',
      content: "That's a great question. Based on your recent training data, I'd recommend focusing on progressive overload for your compound lifts this week. Your bench is trending upward — keep the momentum going.",
      timestamp: new Date().toISOString(),
    },
  });
};
