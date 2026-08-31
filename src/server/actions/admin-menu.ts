"use server";

import { saveCategory as saveCategoryAction, deleteCategory as deleteCategoryAction } from "@/server/actions/admin-categories";
import { saveProduct as saveProductAction, toggleProduct as toggleProductAction, deleteProduct as deleteProductAction, uploadProductImage as uploadProductImageAction } from "@/server/actions/admin-products";
import { saveOptionGroup as saveOptionGroupAction, deleteOptionGroup as deleteOptionGroupAction, saveOption as saveOptionAction, deleteOption as deleteOptionAction } from "@/server/actions/admin-options";
import { saveAddon as saveAddonAction, deleteAddon as deleteAddonAction, linkAddon as linkAddonAction, unlinkAddon as unlinkAddonAction } from "@/server/actions/admin-addons";

export async function saveCategory(...args: Parameters<typeof saveCategoryAction>) {
  return saveCategoryAction(...args);
}

export async function deleteCategory(...args: Parameters<typeof deleteCategoryAction>) {
  return deleteCategoryAction(...args);
}

export async function saveProduct(...args: Parameters<typeof saveProductAction>) {
  return saveProductAction(...args);
}

export async function toggleProduct(...args: Parameters<typeof toggleProductAction>) {
  return toggleProductAction(...args);
}

export async function deleteProduct(...args: Parameters<typeof deleteProductAction>) {
  return deleteProductAction(...args);
}

export async function uploadProductImage(...args: Parameters<typeof uploadProductImageAction>) {
  return uploadProductImageAction(...args);
}

export async function saveOptionGroup(...args: Parameters<typeof saveOptionGroupAction>) {
  return saveOptionGroupAction(...args);
}

export async function deleteOptionGroup(...args: Parameters<typeof deleteOptionGroupAction>) {
  return deleteOptionGroupAction(...args);
}

export async function saveOption(...args: Parameters<typeof saveOptionAction>) {
  return saveOptionAction(...args);
}

export async function deleteOption(...args: Parameters<typeof deleteOptionAction>) {
  return deleteOptionAction(...args);
}

export async function saveAddon(...args: Parameters<typeof saveAddonAction>) {
  return saveAddonAction(...args);
}

export async function deleteAddon(...args: Parameters<typeof deleteAddonAction>) {
  return deleteAddonAction(...args);
}

export async function linkAddon(...args: Parameters<typeof linkAddonAction>) {
  return linkAddonAction(...args);
}

export async function unlinkAddon(...args: Parameters<typeof unlinkAddonAction>) {
  return unlinkAddonAction(...args);
}
