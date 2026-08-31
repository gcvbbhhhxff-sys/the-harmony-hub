"use client";

import { createContext, useContext } from "react";

type RestaurantBrandContextValue = { nome: string; logoUrl: string | null };

const RestaurantBrandContext = createContext<RestaurantBrandContextValue>({ nome: "Seu restaurante", logoUrl: null });

export function RestaurantBrandProvider({ nome, logoUrl, children }: RestaurantBrandContextValue & { children: React.ReactNode }) {
  return <RestaurantBrandContext.Provider value={{ nome, logoUrl }}>{children}</RestaurantBrandContext.Provider>;
}

export function useRestaurantBrand() {
  return useContext(RestaurantBrandContext);
}
