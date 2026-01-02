import { requireAdmin } from "@/lib/admin";
import { getAllSettings, updateSettings } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";
import { AdminErrorHandler } from "@/components/AdminErrorHandler";
import {
  Store,
  Package,
  Mail,
  CreditCard,
  Truck,
  Globe,
} from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getAllSettings();

  async function handleUpdateSettings(formData: FormData) {
    "use server";
    const settingsToUpdate: Record<string, string> = {};

    // Store settings
    const storeName = formData.get("storeName") as string;
    const storeDescription = formData.get("storeDescription") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;

    if (storeName) settingsToUpdate["store.name"] = storeName;
    if (storeDescription)
      settingsToUpdate["store.description"] = storeDescription;
    if (contactEmail) settingsToUpdate["store.contactEmail"] = contactEmail;
    if (contactPhone) settingsToUpdate["store.contactPhone"] = contactPhone;

    // Inventory settings
    const lowStockThreshold = formData.get("lowStockThreshold") as string;
    if (lowStockThreshold)
      settingsToUpdate["inventory.lowStockThreshold"] = lowStockThreshold;

    // General settings
    const currency = formData.get("currency") as string;
    const timezone = formData.get("timezone") as string;
    if (currency) settingsToUpdate["general.currency"] = currency;
    if (timezone) settingsToUpdate["general.timezone"] = timezone;

    await updateSettings(settingsToUpdate);
    redirect("/admin/settings?success=Settings updated successfully");
  }

  return (
    <div className="space-y-6">
      <AdminErrorHandler />
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage store configuration and preferences
        </p>
      </div>

      <form action={handleUpdateSettings} className="space-y-6">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                name="storeName"
                defaultValue={settings["store.name"] || ""}
                placeholder="My Awesome Store"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                defaultValue={settings["store.description"] || ""}
                placeholder="A brief description of your store"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={settings["store.contactEmail"] || ""}
                  placeholder="contact@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={settings["store.contactPhone"] || ""}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">
                Low Stock Threshold
              </Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                defaultValue={settings["inventory.lowStockThreshold"] || "10"}
                placeholder="10"
              />
              <p className="text-sm text-muted-foreground">
                Products with inventory at or below this number will be
                flagged as low stock
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  defaultValue={settings["general.currency"] || "USD"}
                  placeholder="USD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  defaultValue={settings["general.timezone"] || "UTC"}
                  placeholder="UTC"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
}

