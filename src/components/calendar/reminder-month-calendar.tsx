import { Badge } from "@/components/ui/badge";
import type { Reminder } from "@/types/application";
import { cn } from "@/lib/utils";

const weekdayLabels = ["\u5468\u4e00", "\u5468\u4e8c", "\u5468\u4e09", "\u5468\u56db", "\u5468\u4e94", "\u5468\u516d", "\u5468\u65e5"];
const yearText = "\u5e74";
const monthText = "\u6708";
const reminderCountText = "\u4e2a\u63d0\u9192";
const descriptionText = "\u6309\u65e5\u671f\u67e5\u770b\u9762\u8bd5\u3001\u7b14\u8bd5\u3001\u6d4b\u8bc4\u548c\u622a\u6b62\u65e5\u671f\u6570\u91cf\u3002";

const reminderTypeMeta = [
  { type: "\u9762\u8bd5", short: "\u9762", className: "bg-violet-50 text-violet-700" },
  { type: "\u7b14\u8bd5", short: "\u7b14", className: "bg-blue-50 text-blue-700" },
  { type: "\u6d4b\u8bc4", short: "\u6d4b", className: "bg-cyan-50 text-cyan-700" },
  { type: "\u622a\u6b62\u65e5\u671f", short: "\u622a", className: "bg-amber-50 text-amber-700" },
  { type: "\u590d\u76d8", short: "\u590d", className: "bg-emerald-50 text-emerald-700" },
  { type: "\u5176\u4ed6", short: "\u5176", className: "bg-slate-50 text-slate-700" },
];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthCells(anchorDate: Date) {
  const firstDay = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function getTypeCounts(reminders: Reminder[]) {
  return reminderTypeMeta
    .map((meta) => ({
      ...meta,
      count: reminders.filter((reminder) => reminder.type === meta.type).length,
    }))
    .filter((item) => item.count > 0);
}

export function ReminderMonthCalendar({ reminders, selectedDate }: { reminders: Reminder[]; selectedDate: Date }) {
  const todayKey = getDateKey(new Date());
  const selectedMonth = selectedDate.getMonth();
  const cells = getMonthCells(selectedDate);
  const remindersByDate = reminders.reduce<Map<string, Reminder[]>>((map, reminder) => {
    const key = getDateKey(new Date(reminder.remindAt));
    const items = map.get(key) ?? [];
    items.push(reminder);
    map.set(key, items);
    return map;
  }, new Map());

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-background to-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">
            {selectedDate.getFullYear()}{yearText}{selectedDate.getMonth() + 1}{monthText}
          </p>
          <p className="text-sm text-muted-foreground">{descriptionText}</p>
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {reminders.length} {reminderCountText}
        </Badge>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <div key={label} className="rounded-md bg-blue-50/70 py-2 text-center text-xs font-semibold text-slate-500">
            {label}
          </div>
        ))}
        {cells.map((date) => {
          const key = getDateKey(date);
          const dayReminders = remindersByDate.get(key) ?? [];
          const typeCounts = getTypeCounts(dayReminders);
          const inCurrentMonth = date.getMonth() === selectedMonth;
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={cn(
                "min-h-24 rounded-lg border p-2.5 transition-colors",
                inCurrentMonth ? "bg-card" : "bg-muted/20 text-muted-foreground",
                dayReminders.length > 0 ? "border-blue-200 shadow-sm" : "border-blue-100/70",
                isToday && "border-blue-400 ring-2 ring-blue-500/20",
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("text-base font-semibold", isToday && "text-blue-700")}>{date.getDate()}</span>
                {dayReminders.length > 0 ? (
                  <span className="rounded-lg bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                    {dayReminders.length}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-1">
                {typeCounts.slice(0, 4).map((item) => (
                  <span key={item.type} className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", item.className)}>
                    {item.short}
                    {item.count}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
