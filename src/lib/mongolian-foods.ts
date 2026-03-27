export interface MongolianFood {
  name: string
  mongolianName: string
  servingSize: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
}

export const MONGOLIAN_FOODS: MongolianFood[] = [
  // Мах, гурилан хоол
  { name: 'Buuz (steamed dumpling)', mongolianName: 'Бууз', servingSize: '1 ширхэг (50г)', calories: 110, protein: 7, fat: 6, carbs: 7, fiber: 0.3 },
  { name: 'Khuushuur (fried pastry)', mongolianName: 'Хуушуур', servingSize: '1 ширхэг (80г)', calories: 200, protein: 8, fat: 12, carbs: 18, fiber: 0.5 },
  { name: 'Tsuivan (stir-fried noodles)', mongolianName: 'Цуйван', servingSize: '100г', calories: 220, protein: 10, fat: 8, carbs: 28, fiber: 1 },
  { name: 'Bansh in soup', mongolianName: 'Банш шөлтэй', servingSize: '100г', calories: 130, protein: 7, fat: 5, carbs: 14, fiber: 0.3 },
  { name: 'Bantan (porridge soup)', mongolianName: 'Бантан', servingSize: '100г', calories: 100, protein: 6, fat: 3, carbs: 12, fiber: 0.5 },
  { name: 'Tavan talgai (plate meal)', mongolianName: 'Тавагтай хоол', servingSize: '100г', calories: 90, protein: 5, fat: 3, carbs: 12, fiber: 0.5 },
  { name: 'Guriltan shul (noodle soup)', mongolianName: 'Гурилтай шөл', servingSize: '100г', calories: 90, protein: 5, fat: 3, carbs: 12, fiber: 0.5 },
  { name: 'Khuurga (stir-fried meat)', mongolianName: 'Хуурга', servingSize: '100г', calories: 180, protein: 12, fat: 10, carbs: 10, fiber: 1 },
  { name: 'Boodog (goat/marmot roast)', mongolianName: 'Боодог', servingSize: '100г', calories: 250, protein: 18, fat: 18, carbs: 0, fiber: 0 },
  { name: 'Khorkhog (stone-cooked meat)', mongolianName: 'Хорхог', servingSize: '100г', calories: 250, protein: 18, fat: 18, carbs: 0, fiber: 0 },
  { name: 'Sharsан makh (roasted meat)', mongolianName: 'Шарсан мах', servingSize: '100г', calories: 270, protein: 20, fat: 20, carbs: 2, fiber: 0 },
  { name: 'Chanasan makh (boiled meat)', mongolianName: 'Чанасан мах', servingSize: '100г', calories: 230, protein: 22, fat: 15, carbs: 0, fiber: 0 },
  { name: 'Pirazok (fried bun)', mongolianName: 'Пиражок', servingSize: '1 ширхэг (100г)', calories: 280, protein: 8, fat: 14, carbs: 30, fiber: 1 },
  { name: 'Manty (large steamed dumpling)', mongolianName: 'Манты', servingSize: '1 ширхэг (60г)', calories: 130, protein: 7, fat: 6, carbs: 12, fiber: 0.3 },
  { name: 'Tsever shul (clear broth soup)', mongolianName: 'Цэвэр шөл', servingSize: '100мл', calories: 30, protein: 3, fat: 1, carbs: 2, fiber: 0 },
  // Будаа, гарнир
  { name: 'Uuver budaa (fried rice)', mongolianName: 'Үүрэг будаа', servingSize: '100г', calories: 160, protein: 8, fat: 4, carbs: 24, fiber: 1 },
  { name: 'White rice (cooked)', mongolianName: 'Цагаан будаа', servingSize: '100г', calories: 130, protein: 3, fat: 0.5, carbs: 28, fiber: 0.4 },
  { name: 'Sharsаn budaa (stir-fried rice)', mongolianName: 'Шарсан будаа', servingSize: '100г', calories: 180, protein: 6, fat: 6, carbs: 26, fiber: 0.5 },
  { name: 'Nookhiitei budaa (buttered rice)', mongolianName: 'Нөөхийтэй будаа', servingSize: '100г', calories: 170, protein: 7, fat: 5, carbs: 24, fiber: 0.4 },
  { name: 'Tomstoi khuurga (potato stir-fry)', mongolianName: 'Төмстэй хуурга', servingSize: '100г', calories: 150, protein: 4, fat: 6, carbs: 20, fiber: 2 },
  // Сүүн бүтээгдэхүүн, ундаа
  { name: 'Airag (fermented mare milk)', mongolianName: 'Айраг', servingSize: '100мл', calories: 50, protein: 2, fat: 2, carbs: 5, fiber: 0 },
  { name: 'Tarag (fermented yogurt)', mongolianName: 'Тараг', servingSize: '100г', calories: 60, protein: 4, fat: 3, carbs: 5, fiber: 0 },
  { name: 'Suutei tsai (milk tea)', mongolianName: 'Сүүтэй цай', servingSize: '100мл', calories: 40, protein: 2, fat: 2, carbs: 3, fiber: 0 },
  { name: 'Aaruul (dried curd)', mongolianName: 'Ааруул', servingSize: '100г', calories: 340, protein: 30, fat: 8, carbs: 40, fiber: 0 },
  { name: 'Urum (clotted cream)', mongolianName: 'Өрөм', servingSize: '100г', calories: 400, protein: 4, fat: 40, carbs: 6, fiber: 0 },
  { name: 'Mongolian cheese', mongolianName: 'Бяслаг', servingSize: '100г', calories: 250, protein: 20, fat: 15, carbs: 10, fiber: 0 },
  { name: 'Shimiin arkhi (milk vodka)', mongolianName: 'Шимийн архи', servingSize: '100мл', calories: 35, protein: 0.5, fat: 0, carbs: 3, fiber: 0 },
  // Талх, бусад
  { name: 'Gambir (Mongolian flatbread)', mongolianName: 'Гамбир', servingSize: '1 ширхэг (80г)', calories: 200, protein: 5, fat: 4, carbs: 36, fiber: 1 },
  { name: 'Boortsog (fried dough)', mongolianName: 'Боорцог', servingSize: '100г', calories: 450, protein: 8, fat: 20, carbs: 58, fiber: 1 },
  { name: 'Ul boov (layered pastry)', mongolianName: 'Ул боов', servingSize: '100г', calories: 420, protein: 7, fat: 16, carbs: 62, fiber: 0.5 },
]

export function getMongolianFoodContext(): string {
  const sections = [
    '## Mongolian Food Nutrition Database',
    '',
    '### Meat & Noodle Dishes (Мах, гурилан хоол)',
    MONGOLIAN_FOODS.slice(0, 15)
      .map(f => `- ${f.mongolianName} (${f.name}), ${f.servingSize}: ${f.calories}kcal, protein ${f.protein}g, fat ${f.fat}g, carbs ${f.carbs}g`)
      .join('\n'),
    '',
    '### Rice & Sides (Будаа, гарнир)',
    MONGOLIAN_FOODS.slice(15, 20)
      .map(f => `- ${f.mongolianName} (${f.name}), ${f.servingSize}: ${f.calories}kcal, protein ${f.protein}g, fat ${f.fat}g, carbs ${f.carbs}g`)
      .join('\n'),
    '',
    '### Dairy & Drinks (Сүүн бүтээгдэхүүн)',
    MONGOLIAN_FOODS.slice(20, 27)
      .map(f => `- ${f.mongolianName} (${f.name}), ${f.servingSize}: ${f.calories}kcal, protein ${f.protein}g, fat ${f.fat}g, carbs ${f.carbs}g`)
      .join('\n'),
    '',
    '### Bread & Others (Талх, бусад)',
    MONGOLIAN_FOODS.slice(27)
      .map(f => `- ${f.mongolianName} (${f.name}), ${f.servingSize}: ${f.calories}kcal, protein ${f.protein}g, fat ${f.fat}g, carbs ${f.carbs}g`)
      .join('\n'),
  ]
  return sections.join('\n')
}
