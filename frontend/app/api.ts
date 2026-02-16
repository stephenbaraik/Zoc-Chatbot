import axios from 'axios';

const API_Base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatResponse {
    response: string;
    user_id: number;
}

export const sendMessage = async (userId: number, message: string): Promise<ChatResponse> => {
    try {
        const res = await axios.post(`${API_Base}/chat`, {
            user_id: userId,
            message: message
        });
        return res.data;
    } catch (error) {
        console.error("API Error", error);
        return { response: "Sorry, I am having trouble connecting to the server.", user_id: userId };
    }
};
