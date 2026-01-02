"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ImportProductsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    updated: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension === "xlsx" || extension === "xls") {
        setFormat("excel");
      } else {
        setFormat("csv");
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.success) {
          setTimeout(() => {
            router.push("/admin/products");
          }, 2000);
        }
      } else {
        setResult({
          success: false,
          imported: 0,
          updated: 0,
          errors: [data.error || "Import failed"],
        });
      }
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        updated: 0,
        errors: ["Failed to import file. Please try again."],
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Products</h1>
          <p className="text-muted-foreground mt-1">
            Import products from CSV or Excel file
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>

            {file && (
              <div className="p-4 border rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Format: {format.toUpperCase()}
                </p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importing..." : "Import Products"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Required Columns:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>name - Product name</li>
                  <li>description - Product description</li>
                  <li>price - Product price (number)</li>
                  <li>category - Category name</li>
                  <li>inventory - Stock quantity (number, optional)</li>
                  <li>image - Image URL (optional)</li>
                  <li>slug - URL slug (optional, auto-generated if not provided)</li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Notes:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Categories will be created automatically if they don't exist</li>
                  <li>Products with existing slugs will be updated</li>
                  <li>New products will be created for new slugs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <span>Import Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Imported</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.imported}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.updated}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-red-600">
                    {result.errors.length}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Errors:</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.success && (
                <p className="text-sm text-green-600">
                  Import completed successfully! Redirecting to products page...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

