// [UC-NAME-GEN/MSS] name_generator.ts — Sinh Tên Biệt Danh Con Vật Tiếng Anh Ngẫu Nhiên & Hài Hước
// Phong cách: [Tính từ ngộ nghĩnh] + [Tên con vật] (Ví dụ: Sleepy Panda, Sneaky Otter)
// Mục đích: Tự động hóa định danh người chơi không cần nhập liệu, không nghiêm túc, không hiện đại, an toàn tuyệt đối.

export const ANIMAL_ADJECTIVES = [
  'Sleepy', 'Sneaky', 'Dapper', 'Jolly', 'Lucky',
  'Crazy', 'Silly', 'Chubby', 'Grumpy', 'Funky',
  'Wobbly', 'Tipsy', 'Hungry', 'Clumsy', 'Breezy',
  'Cheeky', 'Fancy', 'Rowdy', 'Lazy', 'Fluffy',
  'Mighty', 'Brave', 'Zesty', 'Groovy', 'Chill',
  'Spunky', 'Perky', 'Peppy', 'Goofy', 'Bubbly',
] as const;

export const ANIMAL_NAMES = [
  'Panda', 'Otter', 'Badger', 'Llama', 'Capybara',
  'Raccoon', 'Penguin', 'Beaver', 'Walrus', 'Hedgehog',
  'Falcon', 'Gecko', 'Fox', 'Hippo', 'Bear',
  'Turtle', 'Monkey', 'Duck', 'Rooster', 'Sloth',
  'Moose', 'Hamster', 'Koala', 'Dolphin', 'Parrot',
  'Giraffe', 'Flamingo', 'Camel', 'Seagull', 'Rabbit',
] as const;

function hashString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Sinh tên người chơi ngẫu nhiên gồm [Tính từ] + [Con vật].
 * @param existingNames Danh sách tên đã có trong phòng để tránh trùng con vật.
 * @param seed Tùy chọn seed chuỗi hoặc số để tái lập kết quả xác định.
 */
export function generateRandomAnimalName(
  existingNames?: readonly string[],
  seed?: string | number,
): string {
  const existingAnimals = new Set(
    (existingNames ?? [])
      .map((name) => {
        const parts = name.trim().split(' ');
        return parts.length >= 2 ? parts[parts.length - 1] : name;
      })
      .filter(Boolean),
  );

  const availableAnimals = ANIMAL_NAMES.filter((animal) => !existingAnimals.has(animal));
  const animalsToUse = availableAnimals.length > 0 ? availableAnimals : ANIMAL_NAMES;

  let adjIndex: number;
  let animalIndex: number;

  if (seed !== undefined) {
    const seedNum = typeof seed === 'number' ? Math.floor(Math.abs(seed)) : hashString(String(seed));
    adjIndex = seedNum % ANIMAL_ADJECTIVES.length;
    animalIndex = Math.floor(seedNum / ANIMAL_ADJECTIVES.length) % animalsToUse.length;
  } else {
    adjIndex = Math.floor(Math.random() * ANIMAL_ADJECTIVES.length);
    animalIndex = Math.floor(Math.random() * animalsToUse.length);
  }

  const adj = ANIMAL_ADJECTIVES[adjIndex] ?? 'Lucky';
  const animal = animalsToUse[animalIndex] ?? 'Panda';

  return `${adj} ${animal}`;
}
