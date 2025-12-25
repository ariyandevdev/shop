import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteSlider, updateSlider } from "@/lib/admin-actions";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function AdminSlidersPage() {
  await requireAdmin();

  const sliders = await prisma.slider.findMany({
    orderBy: { order: "asc" },
  });

  async function handleDelete(formData: FormData) {
    "use server";
    const sliderId = formData.get("sliderId") as string;
    if (sliderId) {
      await deleteSlider(sliderId);
      redirect("/admin/sliders");
    }
  }

  async function handleToggleActive(formData: FormData) {
    "use server";
    const sliderId = formData.get("sliderId") as string;
    const currentActive = formData.get("isActive") === "true";
    
    if (sliderId) {
      const slider = await prisma.slider.findUnique({
        where: { id: sliderId },
      });
      
      if (slider) {
        await updateSlider({
          id: sliderId,
          title: slider.title,
          description: slider.description,
          image: slider.image,
          link: slider.link || undefined,
          buttonText: slider.buttonText || undefined,
          order: slider.order,
          isActive: !currentActive,
        });
        redirect("/admin/sliders");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sliders</h1>
        <Button asChild>
          <Link href="/admin/sliders/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Slider
          </Link>
        </Button>
      </div>

      {/* Sliders Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sliders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No sliders found. Create your first slider to get started.
                </td>
              </tr>
            ) : (
              sliders.map((slider) => (
                <tr key={slider.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="relative w-20 h-12 rounded overflow-hidden">
                      <Image
                        src={slider.image}
                        alt={slider.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{slider.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {slider.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{slider.order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        slider.isActive
                          ? "text-green-600 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {slider.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/sliders/${slider.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <form action={handleToggleActive}>
                        <input
                          type="hidden"
                          name="sliderId"
                          value={slider.id}
                        />
                        <input
                          type="hidden"
                          name="isActive"
                          value={slider.isActive.toString()}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          title={slider.isActive ? "Deactivate" : "Activate"}
                        >
                          {slider.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </form>
                      <form action={handleDelete}>
                        <input
                          type="hidden"
                          name="sliderId"
                          value={slider.id}
                        />
                        <DeleteButton
                          confirmMessage={`Are you sure you want to delete "${slider.title}"?`}
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

