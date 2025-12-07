import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us - Shop",
  description: "Learn more about our company, mission, values, and team",
};

// Static data
const companyInfo = {
  name: "Shop",
  foundedYear: 2020,
  location: "San Francisco, CA",
  description: "We are a leading online retailer dedicated to providing high-quality products and exceptional customer service. Our mission is to make shopping convenient, enjoyable, and accessible to everyone.",
  heroImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop",
};

const mission = {
  title: "Our Mission",
  content: "To provide customers with the best shopping experience by offering high-quality products, competitive prices, and outstanding customer service. We strive to build lasting relationships with our customers and contribute positively to the communities we serve.",
};

const vision = {
  title: "Our Vision",
  content: "To become the world's most trusted and customer-centric online marketplace, where people can discover and purchase products that enhance their lives while supporting sustainable and ethical business practices.",
};

const values = [
  {
    title: "Customer First",
    description: "Our customers are at the heart of everything we do. We listen, learn, and continuously improve to exceed their expectations.",
  },
  {
    title: "Quality",
    description: "We are committed to offering only the highest quality products that meet rigorous standards and provide lasting value.",
  },
  {
    title: "Innovation",
    description: "We embrace new technologies and innovative solutions to enhance the shopping experience and stay ahead of the curve.",
  },
  {
    title: "Integrity",
    description: "We conduct business with honesty, transparency, and ethical practices, building trust with customers and partners.",
  },
  {
    title: "Sustainability",
    description: "We are committed to environmental responsibility and sustainable practices in all aspects of our operations.",
  },
  {
    title: "Community",
    description: "We believe in giving back to the communities we serve and supporting causes that make a positive impact.",
  },
];

const team = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "CEO & Founder",
    bio: "With over 15 years of experience in e-commerce, Sarah founded Shop with a vision to revolutionize online shopping.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "CTO",
    bio: "Michael leads our technology team, ensuring our platform is fast, secure, and user-friendly.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Head of Customer Experience",
    bio: "Emily is passionate about creating exceptional customer experiences and building lasting relationships.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "David Kim",
    role: "Head of Operations",
    bio: "David oversees our supply chain and logistics, ensuring products reach customers quickly and efficiently.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <main className="container mx-auto p-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-8">
          <Image
            src={companyInfo.heroImage}
            alt="About Us"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About {companyInfo.name}</h1>
              <p className="text-lg md:text-xl max-w-3xl">
                {companyInfo.description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span>Founded in {companyInfo.foundedYear}</span>
          <span>•</span>
          <span>{companyInfo.location}</span>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{mission.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{mission.content}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{vision.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{vision.content}</p>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="relative w-full h-64">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

