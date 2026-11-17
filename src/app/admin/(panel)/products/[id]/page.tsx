import { notFound } from "next/navigation";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { AliasEditor } from "@/components/admin/alias-editor";
import { ProductForm } from "@/components/admin/product-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <AdminPageHeader
        title={product.values.title}
        description={
          <Badge variant={product.active ? "default" : "destructive"}>
            {product.active ? "Active" : "Inactive"}
          </Badge>
        }
        actions={
          <AdminActionButton
            label={product.active ? "Deactivate" : "Reactivate"}
            action={setProductActiveAction.bind(null, id, !product.active)}
          />
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Product details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              productId={id}
              initialValues={product.values}
              brands={brands}
              categories={categories}
            />
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Aliases</CardTitle>
            <CardDescription>
              Other names suppliers use for this product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AliasEditor productId={id} aliases={product.aliases} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
