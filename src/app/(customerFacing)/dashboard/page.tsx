import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Page: React.FC = () => {
  const rooms = [
    {
      title: "Living Room",
      description: "A cozy living room with a fireplace.",
      imageUrl: "/images/living-room.jpg",
    },
    {
      title: "Bedroom",
      description: "A spacious bedroom with a king-sized bed.",
      imageUrl: "/images/bedroom.jpg",
    },
    {
      title: "Kitchen",
      description: "A modern kitchen with all the amenities.",
      imageUrl: "/images/kitchen.jpg",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room, index) => (
          <Card key={index} className="rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>{room.title}</CardTitle>
              <CardDescription>{room.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <img className="w-full rounded-xl" src={room.imageUrl} alt={room.title} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Page;