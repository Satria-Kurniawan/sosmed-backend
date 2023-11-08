export function generateUsername(name: string) {
  // Mengubah nama menjadi huruf kecil dan menghilangkan spasi di dalamnya
  const lowercaseName = name.toLowerCase().replace(/\s/g, "");

  // Menghasilkan angka acak antara 1000 hingga 9999
  const randomNum = Math.floor(Math.random() * 9000) + 1000;

  // Menggabungkan nama dengan angka acak
  const username = lowercaseName + "_" + randomNum;

  return username;
}
