import vesuvio from "@/assets/pizza-vesuvio.jpg";
import blaze from "@/assets/pizza-blaze.jpg";
import moon from "@/assets/pizza-moon.jpg";
import grove from "@/assets/pizza-grove.jpg";

export const pizzaImages: Record<string, string> = {
  vesuvio,
  blaze,
  moon,
  grove,
};

export const money = (cents: number) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

export type OrderStatus =
  | "received"
  | "in_kitchen"
  | "sent_to_delivery"
  | "delivered";

export const statusFlow: OrderStatus[] = [
  "received",
  "in_kitchen",
  "sent_to_delivery",
  "delivered",
];

export const statusLabel: Record<OrderStatus, string> = {
  received: "Order received",
  in_kitchen: "In kitchen",
  sent_to_delivery: "Sent to delivery",
  delivered: "Delivered",
};

export const categoryLabel: Record<string, string> = {
  base: "Pizza bases",
  sauce: "Sauces",
  cheese: "Cheeses",
  veggie: "Vegetables",
};
