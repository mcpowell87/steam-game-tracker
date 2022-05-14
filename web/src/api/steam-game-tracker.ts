import axios from 'axios';
import { Stats } from '../types';

export const getStats = async (steamId: string): Promise<Stats | null> => {
  try {
    const { data } = await axios
      .get<Stats>(`http://devbox.home:30000/api/purchases/${steamId}/stats`)
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
    } else {
      console.log('unexpected error: ', error);
    }
  }
  return null;
}