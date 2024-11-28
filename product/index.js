const { MongoClient } = require("mongodb");

async function run() {
  const uri = "mongodb+srv://mudelysambo:Tech%404747@cluster0.rgxv1.mongodb.net/perfumeDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB successfully!");

    const dbName = "perfumeDatabase";
    const database = client.db(dbName);

    // Define collections
    const collections = {
      AllPerfumes: database.collection("AllPerfumes"),
      FemalePerfumes: database.collection("FemalePerfumes"),
      MalePerfumes: database.collection("MalePerfumes"),
      DiscountedPerfumes: database.collection("DiscountedPerfumes"),
    };

    // Define data
    const data = {
      AllPerfumes: [
        { category: "MALE", name: "Luxury Perfume", price: 200, is_bulk_available: true, is_sold_out: false },
        { category: "FEMALE", name: "Elegant Fragrance", price: 160, is_bulk_available: false, is_sold_out: false },
        { category: "UNISEX", name: "Fresh Aroma", price: 500, is_bulk_available: true, is_sold_out: false },
        { category: "MALE", name: "Classic Woody Scent", price: 205, is_bulk_available: true, is_sold_out: false },
        { category: "FEMALE", name: "Rose Bliss Perfume", price: 130, is_bulk_available: false, is_sold_out: false },
        { category: "UNISEX", name: "Citrus Delight", price: 230, is_bulk_available: true, is_sold_out: false },
        { category: "MALE", name: "Oceanic Fresh", price: 130, is_bulk_available: false, is_sold_out: true },
        { category: "FEMALE", name: "Vanilla Essence", price: 140, is_bulk_available: false, is_sold_out: false },
        { category: "UNISEX", name: "Spice & Leather", price: 105, is_bulk_available: true, is_sold_out: false },
      ],
      FemalePerfumes: [
        { category: "FEMALE", name: "Luxury Perfume", price: 100, is_bulk_available: true, is_sold_out: false },
        { category: "FEMALE", name: "Elegant Fragrance", price: 120, is_bulk_available: false, is_sold_out: false },
        { category: "FEMALE", name: "Fresh Aroma", price: 100, is_bulk_available: true, is_sold_out: false },
        { category: "FEMALE", name: "Classic Woody Scent", price: 450, is_bulk_available: true, is_sold_out: false },
        { category: "FEMALE", name: "Rose Bliss Perfume", price: 130, is_bulk_available: false, is_sold_out: false },
        { category: "FEMALE", name: "Citrus Delight", price: 155, is_bulk_available: true, is_sold_out: false },
        { category: "FEMALE", name: "Oceanic Fresh", price: 110, is_bulk_available: false, is_sold_out: true },
        { category: "FEMALE", name: "Vanilla Essence", price: 140, is_bulk_available: false, is_sold_out: false },
        { category: "FEMALE", name: "Spice & Leather", price: 105, is_bulk_available: true, is_sold_out: false },
      ],
      MalePerfumes: [
        { category: "MALE", name: "Luxury Perfume", price: 100, is_bulk_available: true, is_sold_out: false },
        { category: "MALE", name: "Elegant Fragrance", price: 120, is_bulk_available: false, is_sold_out: false },
        { category: "MALE", name: "Fresh Aroma", price: 290, is_bulk_available: true, is_sold_out: false },
        { category: "MALE", name: "Classic Woody Scent", price: 400, is_bulk_available: true, is_sold_out: false },
        { category: "MALE", name: "Rose Bliss Perfume", price: 190, is_bulk_available: false, is_sold_out: false },
        { category: "MALE", name: "Citrus Delight", price: 295, is_bulk_available: true, is_sold_out: false },
        { category: "MALE", name: "Oceanic Fresh", price: 110, is_bulk_available: false, is_sold_out: true },
        { category: "MALE", name: "Vanilla Essence", price: 140, is_bulk_available: false, is_sold_out: false },
        { category: "MALE", name: "Spice & Leather", price: 150, is_bulk_available: true, is_sold_out: false },
      ],
      DiscountedPerfumes: [
        { category: "MALE", name: "Luxury Perfume", price: 300, is_bulk_available: true, is_sold_out: false, discount: 10 },
        { category: "FEMALE", name: "Elegant Fragrance", price: 320, is_bulk_available: false, is_sold_out: false, discount: 5 },
        { category: "UNISEX", name: "Fresh Aroma", price: 180, is_bulk_available: true, is_sold_out: false, discount: 15 },
        { category: "MALE", name: "Classic Woody Scent", price: 200, is_bulk_available: true, is_sold_out: false, discount: 15 },
        { category: "FEMALE", name: "Rose Bliss Perfume", price: 130, is_bulk_available: false, is_sold_out: false, discount: 12 },
        { category: "UNISEX", name: "Citrus Delight", price: 400, is_bulk_available: true, is_sold_out: false, discount: 20 },
        { category: "MALE", name: "Oceanic Fresh", price: 210, is_bulk_available: false, is_sold_out: true, discount: 7 },
        { category: "FEMALE", name: "Vanilla Essence", price: 140, is_bulk_available: false, is_sold_out: false, discount: 15 },
        { category: "UNISEX", name: "Spice & Leather", price: 150, is_bulk_available: true, is_sold_out: false, discount: 10 },
      ],
    };

    // Insert data into collections
    for (const [collectionName, perfumes] of Object.entries(data)) {
      const collection = collections[collectionName];
      for (const perfume of perfumes) {
        const existing = await collection.findOne({ name: perfume.name });
        if (!existing) {
          await collection.insertOne(perfume);
          console.log(`Inserted: ${perfume.name} into ${collectionName}`);
        } else {
          console.log(`Skipped: ${perfume.name} already exists in ${collectionName}`);
        }
      }
    }

    console.log("Data processing completed!");
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    await client.close();
  }
}

// Call the function
run();
