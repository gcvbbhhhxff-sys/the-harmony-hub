"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
type CartState={items:CartItem[];addItem:(item:CartItem)=>void;replaceItem:(id:string,item:CartItem)=>void;setQuantity:(id:string,quantity:number)=>void;removeItem:(id:string)=>void;clear:()=>void};
export const useCartStore=create<CartState>()(persist((set)=>({items:[],addItem:(item)=>set(state=>({items:[...state.items,item]})),replaceItem:(id,item)=>set(state=>({items:state.items.map(current=>current.id===id?item:current)})),setQuantity:(id,quantity)=>set(state=>({items:quantity>0?state.items.map(item=>item.id===id?{...item,quantity}:item):state.items.filter(item=>item.id!==id)})),removeItem:(id)=>set(state=>({items:state.items.filter(item=>item.id!==id)})),clear:()=>set({items:[]})}),{name:"restaurante-cart",storage:createJSONStorage(()=>localStorage)}));
export const cartTotal=(items:CartItem[])=>items.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0);
