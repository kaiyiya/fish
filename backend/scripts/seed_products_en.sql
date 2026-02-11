-- Simple English seed data for dev environment

INSERT INTO category (name)
VALUES ('sea_fish'), ('freshwater_fish'), ('deep_sea_fish'), ('shellfish');

INSERT INTO fish_product
  (name, categoryId, price, stock, description, imageUrls, nutritionInfo, cookingTips)
VALUES
  (
    'Salmon Sashimi Set',
    1,
    88.00,
    100,
    'Premium Norwegian salmon, suitable for sashimi or light pan-fry.',
    '[""]',
    'Rich in high-quality protein and omega-3 fatty acids.',
    'Slice for sashimi, or pan-fry both sides lightly.'
  ),
  (
    'Deep Sea Cod Fillet',
    3,
    65.00,
    80,
    'Alaskan cod fillet with tender texture and few bones.',
    '[""]',
    'High protein, low fat, suitable for children and elders.',
    'Steam, bake or fry; serve with lemon juice.'
  ),
  (
    'Steamed Mandarin Fish',
    2,
    48.00,
    60,
    'Fresh mandarin fish ideal for steaming.',
    '[""]',
    'Balanced nutrition with delicate taste.',
    'Steam with ginger and scallion, then pour hot oil to enhance aroma.'
  ),
  (
    'Spicy Crayfish',
    4,
    98.00,
    120,
    'Ready-to-eat spicy crayfish, just reheat and serve.',
    '[""]',
    'Rich in protein and trace elements, perfect for late-night snacks.',
    'Reheat gently and serve hot, pairs well with cold drinks.'
  );

