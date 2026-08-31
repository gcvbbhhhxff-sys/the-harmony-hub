import type { RestaurantSettings } from "@/types/menu";

const DAYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"] as const;

type Schedule = RestaurantSettings["horario_funcionamento"];

type StatusOverride = RestaurantSettings["status_manual"];

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function currentDaySchedule(now: Date, schedule: Schedule) {
  return schedule?.[DAYS[now.getDay()] ?? "domingo"];
}

export function isRestaurantOpen(now: Date, schedule: Schedule, override: StatusOverride) {
  if (override === "aberto") return true;
  if (override === "fechado") return false;

  const item = currentDaySchedule(now, schedule);
  if (!item?.ativo || !item.abertura || !item.fechamento) return false;

  const current = now.getHours() * 60 + now.getMinutes();
  const opening = toMinutes(item.abertura);
  const closing = toMinutes(item.fechamento);

  return closing > opening ? current >= opening && current < closing : current >= opening || current < closing;
}

export function getNextOpening(now: Date, schedule: Schedule) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < DAYS.length; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const item = schedule?.[DAYS[date.getDay()] ?? "domingo"];

    if (!item?.ativo || !item.abertura) continue;

    if (offset === 0 && toMinutes(item.abertura) <= currentMinutes) continue;
    return item.abertura;
  }

  return null;
}
