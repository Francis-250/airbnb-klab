import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      username: "admin",
      phone: "+1-555-0100",
      password: hashedPassword,
      role: "admin",
      hostStatus: "approved",
      bio: "Platform administrator.",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      username: "alice_host",
      phone: "+1-555-0101",
      password: hashedPassword,
      role: "host",
      hostStatus: "approved",
      bio: "Superhost with 5 years of experience. I love making guests feel at home.",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      username: "bob_guest",
      phone: "+1-555-0102",
      password: hashedPassword,
      role: "guest",
      hostStatus: "approved",
      bio: "Avid traveler exploring new places every month.",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol White",
      email: "carol@example.com",
      username: "carol_guest",
      phone: "+1-555-0103",
      password: hashedPassword,
      role: "guest",
      hostStatus: "approved",
      bio: "Digital nomad working remotely from beautiful places.",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  });

  console.log("👥 Created users");

  const listing1 = await prisma.listing.create({
    data: {
      title: "Cozy apartment in downtown",
      description:
        "A beautiful apartment in the heart of the city with modern finishes and easy access to all the best restaurants and attractions.",
      location: "New York, NY",
      pricePerNight: 120,
      guests: 2,
      type: "apartment",
      amenities: ["WiFi", "Kitchen", "Air conditioning", "Washer", "Elevator"],
      photos: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      ],
      rating: 4.8,
      hostId: alice.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "Beach house with ocean view",
      description:
        "Wake up to stunning ocean views every morning. Steps from the beach with a private pool and BBQ area — perfect for families or groups.",
      location: "Miami, FL",
      pricePerNight: 250,
      guests: 6,
      type: "house",
      amenities: ["WiFi", "Pool", "Beach access", "BBQ", "Kitchen", "Parking"],
      photos: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      ],
      rating: 4.9,
      hostId: alice.id,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "Mountain cabin retreat",
      description:
        "Escape the city in this peaceful mountain cabin surrounded by pine trees. Perfect for hiking lovers and anyone craving fresh mountain air.",
      location: "Denver, CO",
      pricePerNight: 180,
      guests: 4,
      type: "cabin",
      amenities: [
        "Fireplace",
        "Hiking trails",
        "WiFi",
        "Hot tub",
        "Fully equipped kitchen",
      ],
      photos: [
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
      ],
      rating: 4.7,
      hostId: alice.id,
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      title: "Luxury villa with private pool",
      description:
        "An expansive luxury villa ideal for celebrations, retreats, or extended stays. Private pool, chef's kitchen, and breathtaking sunset views.",
      location: "Los Angeles, CA",
      pricePerNight: 450,
      guests: 10,
      type: "villa",
      amenities: [
        "WiFi",
        "Private pool",
        "Hot tub",
        "Chef's kitchen",
        "Home theater",
        "Gym",
        "Parking",
      ],
      photos: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      ],
      rating: 5.0,
      hostId: alice.id,
    },
  });

  console.log("🏠 Created listings");

  await prisma.booking.create({
    data: {
      checkIn: new Date("2025-08-01"),
      checkOut: new Date("2025-08-05"),
      totalPrice: 480,
      status: "confirmed",
      guestId: bob.id,
      listingId: listing1.id,
    },
  });

  await prisma.booking.create({
    data: {
      checkIn: new Date("2025-09-10"),
      checkOut: new Date("2025-09-15"),
      totalPrice: 1250,
      status: "pending",
      guestId: carol.id,
      listingId: listing2.id,
    },
  });

  await prisma.booking.create({
    data: {
      checkIn: new Date("2025-10-20"),
      checkOut: new Date("2025-10-25"),
      totalPrice: 900,
      status: "confirmed",
      guestId: bob.id,
      listingId: listing3.id,
    },
  });

  await prisma.booking.create({
    data: {
      checkIn: new Date("2025-12-24"),
      checkOut: new Date("2025-12-31"),
      totalPrice: 3150,
      status: "pending",
      guestId: carol.id,
      listingId: listing4.id,
    },
  });

  console.log("📅 Created bookings");
  console.log("✅ Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
