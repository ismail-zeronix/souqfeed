import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin/admin-page";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/auth/session";
import { listBrands } from "@/modules/brands/queries";
import { listCategoriesForAdmin } from "@/modules/categories/queries";
import { EMPTY_PRODUCT_VALUES } from "@/modules/products/queries";

export const metadata: Metadata = { title: "Add product" };

export default async function AdminNewProductPage() {
  await requireAdminPage();
  const [brands, categories] = await Promise.all([
    listBrands(),
    listCategoriesForAdmin(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Add product"
        description="Add a canonical product that supplier broadcasts can be matched against."
      />
      {brands.length === 0 ? (
        <AdminEmptyState>
          Every product needs a brand.{" "}
          <Link href="/admin/brands" className="text-primary hover:underline">
            Add a brand first.
          </Link>
        </AdminEmptyState>
      ) : (
        <Card>
          <CardContent>
            <ProductForm
              initialValues={EMPTY_PRODUCT_VALUES}
              brands={brands}
              categories={categories}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
