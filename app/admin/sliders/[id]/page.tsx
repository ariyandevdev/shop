import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateSlider } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { AdminErrorHandler } from "@/components/AdminErrorHandler";

export default async function EditSliderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const slider = await prisma.slider.findUnique({
    where: { id },
  });

  if (!slider) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await updateSlider({
      id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image: formData.get("image") as string,
      link: (formData.get("link") as string) || undefined,
      buttonText: (formData.get("buttonText") as string) || undefined,
      order: parseInt(formData.get("order") as string, 10),
      isActive: formData.get("isActive") === "on",
    });

    if (result.success) {
      redirect("/admin/sliders");
    } else {
      redirect(
        `/admin/sliders/${id}?error=${encodeURIComponent(result.error || "Failed to update slider")}`
      );
    }
  }

  return (
    <div className="space-y-6">
      <AdminErrorHandler />
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/sliders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Slider</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slider Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={slider.title}
                placeholder="Enter slider title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={slider.description}
                placeholder="Enter slider description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL *</Label>
              <Input
                id="image"
                name="image"
                type="url"
                required
                defaultValue={slider.image}
                placeholder="https://images.unsplash.com/photo-..."
              />
              <p className="text-sm text-muted-foreground">
                Supports Unsplash and other image URLs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                name="link"
                type="url"
                defaultValue={slider.link || ""}
                placeholder="https://example.com"
              />
              <p className="text-sm text-muted-foreground">
                Optional URL for the CTA button
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text (Optional)</Label>
              <Input
                id="buttonText"
                name="buttonText"
                defaultValue={slider.buttonText || ""}
                placeholder="Shop Now"
              />
              <p className="text-sm text-muted-foreground">
                Text for the CTA button (requires Link to be set)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Display Order *</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="0"
                  required
                  defaultValue={slider.order.toString()}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive" className="flex items-center gap-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    defaultChecked={slider.isActive}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span>Active</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only active sliders are displayed on the homepage
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Slider</Button>
              <Button asChild type="button" variant="outline">
                <Link href="/admin/sliders">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

