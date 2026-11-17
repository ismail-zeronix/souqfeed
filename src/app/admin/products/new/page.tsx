import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/auth/session";
import { listBrands } from "@/modules/brands/queries";
import { listCategoriesForAdmin } from "@/modules/categories/queries";
import { EMPTY_PRODUCT_VALUES } from "@/modules/products/queries";

export default async function AdminNewProductPage() {
  await requireAdminPage();
  const [brands, categories] = await Promise.all([
    listBrands(),
    listCategoriesForAdmin(),
  ]);

  return (
    <>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← All products
      </Link>
      <h1 className="mt-2 mb-6 text-3xl font-semibold tracking-tight">
        Add product
      </h1>
      {brands.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
          Every product needs a brand.{" "}
          <Link href="/admin/brands" className="text-primary hover:underline">
            Add a brand first.
          </Link>
        </div>
      ) : (
        <section className="bg-card rounded-2xl border p-5 sm:p-6">
          <ProductForm
            initialValues={EMPTY_PRODUCT_VALUES}
            brands={brands}
            categories={categories}
          />
        </section>
      )}
    </>
  );
}
