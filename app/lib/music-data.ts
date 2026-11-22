export type Category = "spiritual" | "love" | "sad" | "energy" | "chill";

export interface Track {
  id: string;
  title: string;
  artist: string;
  category: Category;
}

export const CATEGORIES: Record<Category, { color: string; image: string }> = {
  spiritual: { color: "#F5B335", image: "/thumbs/spiritual.webp" },
  love:      { color: "#F43F6E", image: "/thumbs/love.webp" },
  sad:       { color: "#3B6FE0", image: "/thumbs/sad.webp" },
  energy:    { color: "#E63946", image: "/thumbs/energy.webp" },
  chill:     { color: "#2DD4BF", image: "/thumbs/chill.webp" },
};

export const TRACKS: Track[] = [
  { id: "AETFvQonfV8", title: "Hanuman Chalisa", artist: "Gulshan Kumar", category: "spiritual" },
  { id: "9a4izd3Rvdw", title: "Challa", artist: "Rabbi Shergill", category: "energy" },
  { id: "TyMUY2CDrjc", title: "Haareya", artist: "Arijit Singh", category: "sad" },
  { id: "fdubeMFwuGs", title: "Ilahi", artist: "Arijit Singh", category: "energy" },
  { id: "XgdY_s1LsZc", title: "Haule Haule", artist: "Sukhwinder Singh", category: "love" },
  { id: "c2gSzYLJ8sY", title: "Ishq Bulaava", artist: "Sanam Puri & Shipra Goyal", category: "love" },
  { id: "VdyBtGaspss", title: "Chahun Main Ya Naa", artist: "Arijit Singh & Palak Muchhal", category: "love" },
  { id: "0NFxcNheoLc", title: "Banjaara", artist: "Mohammed Irfan", category: "sad" },
  { id: "69pPYkGiEAQ", title: "Kisi Ki Muskurahaton Pe Ho Nisar", artist: "Mukesh", category: "chill" },
  { id: "hoNb6HuNmU0", title: "KHAIRIYAT", artist: "Arijit Singh", category: "sad" },
  { id: "5gwy0gcjIkI", title: "Tere Sang Yaara", artist: "Atif Aslam", category: "love" },
  { id: "CxAWKewvooo", title: "Saude Bazi", artist: "Anupam Amod", category: "love" },
  { id: "w9Qo6p4XsXE", title: "Ye Tune Kya Kiya", artist: "Javed Bashir", category: "love" },
  { id: "c3aj-wR3uos", title: "Yeh Parda Hata Do", artist: "Mohammed Rafi & Asha Bhosle", category: "love" },
  { id: "4QVu6Vo6Jhw", title: "Dhan Te Nan", artist: "Vishal Bhardwaj", category: "energy" },
  { id: "7vkW5PNBhDU", title: "Chalti Hai Kya 9 Se 12", artist: "Dev Negi & Neha Kakkar", category: "energy" },
  { id: "qoq8B8ThgEM", title: "Tujh Mein Rab Dikhta Hai", artist: "Roop Kumar Rathod", category: "love" },
  { id: "DAYszemgPxc", title: "Main Agar Kahoon", artist: "Sonu Nigam & Shreya Ghoshal", category: "love" },
  { id: "qpIdoaaPa6U", title: "Jeene Laga Hoon", artist: "Atif Aslam & Shreya Ghoshal", category: "love" },
  { id: "a9Hxkc9YxGE", title: "Bulleya", artist: "Papon", category: "sad" },
  { id: "KQtMPONdxGs", title: "Tere Bina", artist: "Arijit Singh & Aakanksha Sharma", category: "sad" },
  { id: "jFmi69lb8sQ", title: "Hona Tha Pyar", artist: "Atif Aslam & Hadiqa Kiani", category: "love" },
  { id: "kp-Bqr1Gtyw", title: "Sach Keh Raha Hai Deewana", artist: "KK", category: "love" },
  { id: "J8fxDDCMZXY", title: "Relaxing Piano Music", artist: "", category: "chill" },
];