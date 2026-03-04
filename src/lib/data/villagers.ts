export type VillagerPersonality =
  | "normal"
  | "jock"
  | "lazy"
  | "sisterly"
  | "smug";

export type VillagerProfile = {
  id: string;
  nameZh: string;
  nameEn: string;
  species: string;
  personality: VillagerPersonality;
  hobby: string;
  catchphrase: string;
  birthday: string;
  mood: number;
  location: string;
};

export const DEFAULT_VILLAGERS: VillagerProfile[] = [
  {
    id: "merengue",
    nameZh: "牧牧",
    nameEn: "Merengue",
    species: "犀牛",
    personality: "normal",
    hobby: "自然",
    catchphrase: "蛋糕呀",
    birthday: "03-19",
    mood: 76,
    location: "烘焙小屋",
  },
  {
    id: "dom",
    nameZh: "茶茶丸",
    nameEn: "Dom",
    species: "绵羊",
    personality: "jock",
    hobby: "玩耍",
    catchphrase: "哇耶",
    birthday: "03-18",
    mood: 84,
    location: "海边跑道",
  },
  {
    id: "sherb",
    nameZh: "雷姆",
    nameEn: "Sherb",
    species: "山羊",
    personality: "lazy",
    hobby: "自然",
    catchphrase: "轻飘",
    birthday: "01-18",
    mood: 69,
    location: "果树下",
  },
  {
    id: "cherry",
    nameZh: "樱桃",
    nameEn: "Cherry",
    species: "狗",
    personality: "sisterly",
    hobby: "音乐",
    catchphrase: "汪呜",
    birthday: "05-11",
    mood: 72,
    location: "广场舞台",
  },
  {
    id: "marshal",
    nameZh: "小润",
    nameEn: "Marshal",
    species: "松鼠",
    personality: "smug",
    hobby: "音乐",
    catchphrase: "不管怎样",
    birthday: "09-29",
    mood: 73,
    location: "咖啡摊",
  },
];
