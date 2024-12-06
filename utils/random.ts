const adjectives = ['快乐的', '聪明的', '可爱的', '酷酷的'];
const nouns = ['熊猫', '老虎', '狮子', '兔子'];

export const generateRandomUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
};

export const generateRandomAvatar = () => {
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${Math.random()}`;
};
