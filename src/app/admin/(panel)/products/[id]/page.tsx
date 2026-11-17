import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { AliasEditor } from "@/components/admin/alias-editor";
import { ProductForm } from "@/components/admin/product-form";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/auth/session";
import { isUuid } from "@/lib/validation/form";
import { listBrands } from "@/modules/brands/queries";
import { listCategoriesForAdmin } from "@/modules/categories/queries";
import { setProductActiveAction } from "@/modules/products/actions";
import { getProductForEdit } from "@/modules/products/queries";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [product, brands, categories] = await Promise.all([
    getProductForEdit(id),
    listBrands(),
    listCategoriesForAdmin(),
  ]);
  if (!product) notFound();

  return (
    <>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← All products
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight break-words">
            {product.values.title}
          </h1>
          <Badge
            variant={product.active ? "default" : "destructive"}
            className="mt-3"
          >
            {product.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <AdminActionButton
          label={product.active ? "Deactivate" : "Reactivate"}
          action={setProductActiveAction.bind(null, id, !product.active)}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="bg-card min-w-0 rounded-2xl border p-5 sm:p-6">
          <h2 className="mb-5 font-semibold">Product details</h2>
          <ProductForm
            productId={id}
            initialValues={product.values}
            brands={brands}
            categories={categories}
          />
        </section>
        <section className="bg-card min-w-0 rounded-2xl border p-5 sm:p-6">
          <h2 className="mb-5 font-semibold">Aliases</h2>
          <AliasEditor productId={id} aliases={product.aliases} />
        </section>
      </div>
    </>
  );
}
