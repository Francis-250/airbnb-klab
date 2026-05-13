import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

type ActiveField = "checkIn" | "checkOut";

type BookingDatePickerProps = {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onValidationMessage?: (message: string) => void;
  isVisible?: boolean;
};

export default function BookingDatePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  onValidationMessage,
  isVisible = true,
}: BookingDatePickerProps) {
  const [activeDateField, setActiveDateField] =
    useState<ActiveField>("checkIn");
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );

  useEffect(() => {
    if (!isVisible) return;
    setActiveDateField("checkIn");
    setCalendarMonth(startOfMonth(new Date(checkIn)));
  }, [checkIn, isVisible]);

  return (
    <>
      <View style={styles.bookingDateRow}>
        <Pressable
          onPress={() => setActiveDateField("checkIn")}
          style={[
            styles.bookingDateCard,
            activeDateField === "checkIn" && styles.bookingDateCardActive,
          ]}
        >
          <Text style={styles.bookingFieldLabel}>Check-in</Text>
          <Text style={styles.bookingDateValue}>
            {formatBookingDisplayDate(checkIn)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveDateField("checkOut")}
          style={[
            styles.bookingDateCard,
            activeDateField === "checkOut" && styles.bookingDateCardActive,
          ]}
        >
          <Text style={styles.bookingFieldLabel}>Check-out</Text>
          <Text style={styles.bookingDateValue}>
            {formatBookingDisplayDate(checkOut)}
          </Text>
        </Pressable>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => setCalendarMonth(addMonths(calendarMonth, -1))}
            style={styles.calendarNavButton}
          >
            <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthLabel}>
            {calendarMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            style={styles.calendarNavButton}
          >
            <Ionicons name="chevron-forward" size={18} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysRow}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <Text key={i} style={styles.weekdayLabel}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {buildCalendarDays(calendarMonth).map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const isoDate = toISODate(date);
            const isCheckIn = isoDate === checkIn;
            const isCheckOut = isoDate === checkOut;
            const isSelected = isCheckIn || isCheckOut;
            const inRange = isDateWithinRange(date, checkIn, checkOut);
            const isPast = startOfDay(date) < startOfDay(new Date());

            return (
              <Pressable
                key={isoDate}
                disabled={isPast}
                onPress={() => {
                  onValidationMessage?.("");

                  if (activeDateField === "checkIn") {
                    onCheckInChange(isoDate);
                    if (new Date(checkOut) <= new Date(isoDate)) {
                      const nextDay = new Date(date);
                      nextDay.setDate(nextDay.getDate() + 1);
                      onCheckOutChange(toISODate(nextDay));
                    }
                    setActiveDateField("checkOut");
                    return;
                  }

                  if (new Date(isoDate) <= new Date(checkIn)) {
                    onValidationMessage?.("Check-out must be after check-in.");
                    return;
                  }

                  onCheckOutChange(isoDate);
                }}
                style={[
                  styles.dayCell,
                  inRange && styles.dayCellInRange,
                  isSelected && styles.dayCellSelected,
                  isPast && styles.dayCellDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected,
                    isPast && styles.dayLabelDisabled,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

function isValidDateInput(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value).getTime())
  );
}

function formatBookingDisplayDate(value: string) {
  if (!isValidDateInput(value)) {
    return value;
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells: (Date | null)[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  return cells;
}

function isDateWithinRange(date: Date, checkIn: string, checkOut: string) {
  if (!isValidDateInput(checkIn) || !isValidDateInput(checkOut)) {
    return false;
  }

  const current = startOfDay(date).getTime();
  const start = startOfDay(new Date(checkIn)).getTime();
  const end = startOfDay(new Date(checkOut)).getTime();

  return current > start && current < end;
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  bookingDateRow: {
    flexDirection: "row",
    gap: 10,
  },
  bookingDateCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E6E1DA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FAFAF8",
  },
  bookingDateCardActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: "#FFF5F5",
  },
  bookingFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6F6F6F",
  },
  bookingDateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 6,
  },
  calendarCard: {
    borderWidth: 1,
    borderColor: "#E6E1DA",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  calendarMonthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  weekdaysRow: {
    flexDirection: "row",
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#8D8D8D",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  dayCell: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  dayCellInRange: {
    backgroundColor: "#FCE8EA",
  },
  dayCellSelected: {
    backgroundColor: COLORS.PRIMARY,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  dayLabelSelected: {
    color: "#FFFFFF",
  },
  dayLabelDisabled: {
    color: "#7F7F7F",
  },
});
